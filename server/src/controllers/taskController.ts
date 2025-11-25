import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const { projectId } = req.query;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        projectId: Number(projectId),
      },
      include: {
        author: true,
        assignee: true,
        comments: true,
        attachments: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving tasks: ${error.message}` });
  }
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    points,
    projectId,
    authorUserId,
    assignedUserId,
  } = req.body;

  if (!title || !projectId || !authorUserId) {
    console.log("Missing required fields:", { title, projectId, authorUserId });
    return;
  }

  // Check if project exists
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    console.log("Project does not exist:", projectId);
    return;
  }

  try {
    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        tags,
        startDate,
        dueDate,
        points,
        projectId,
        authorUserId,
        assignedUserId,
      },
    });
    res.status(201).json(newTask);
  } catch (error: any) {
    console.error("Error creating a task:", error); // Add this line
    res
      .status(500)
      .json({ message: `Error creating a task: ${error.message}` });
  }
};

export const updateTaskStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { status } = req.body;
  try {
    const updatedTask = await prisma.task.update({
      where: {
        id: Number(taskId),
      },
      data: {
        status: status,
      },
    });
    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};

export const getUserTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { authorUserId: Number(userId) },
          { assignedUserId: Number(userId) },
        ],
      },
      include: {
        author: true,
        assignee: true,
      },
    });
    res.json(tasks);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user's tasks: ${error.message}` });
  }
};

export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  try {
    // Delete related records first (cascade)
    await prisma.taskAssignment.deleteMany({
      where: { taskId: Number(taskId) },
    });
    await prisma.attachment.deleteMany({
      where: { taskId: Number(taskId) },
    });
    await prisma.comment.deleteMany({
      where: { taskId: Number(taskId) },
    });

    // Delete the task
    await prisma.task.delete({
      where: { id: Number(taskId) },
    });

    res.json({ message: "Task deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: `Error deleting task: ${error.message}` });
  }
};

export const getTaskById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  try {
    const task = await prisma.task.findUnique({
      where: { id: Number(taskId) },
      include: {
        project: true,
        author: true,
        assignee: true,
        comments: {
          include: {
            user: true,
          },
          orderBy: { id: "desc" },
        },
        attachments: {
          include: {
            uploadedBy: true,
          },
        },
        activities: {
          include: {
            user: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!task) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    res.json(task);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving task: ${error.message}` });
  }
};

export const updateTask = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { taskId } = req.params;
  const { userId, ...updates } = req.body;

  try {
    // Get current task to compare for activity logging
    const currentTask = await prisma.task.findUnique({
      where: { id: Number(taskId) },
    });

    if (!currentTask) {
      res.status(404).json({ message: "Task not found" });
      return;
    }

    // Build activity entries for changed fields
    const activities: {
      taskId: number;
      userId: number;
      action: string;
      field: string;
      oldValue: string | null;
      newValue: string | null;
    }[] = [];

    // Fields to track in activity log (exclude title and description)
    const fieldMappings: { [key: string]: string } = {
      status: "status",
      priority: "priority",
      assignedUserId: "assignee",
      dueDate: "due_date",
      startDate: "start_date",
      points: "points",
      tags: "tags",
    };

    for (const [field, activityField] of Object.entries(fieldMappings)) {
      if (updates[field] !== undefined) {
        const oldValue = currentTask[field as keyof typeof currentTask];
        const newValue = updates[field];

        // Only log if value actually changed
        if (String(oldValue ?? "") !== String(newValue ?? "")) {
          activities.push({
            taskId: Number(taskId),
            userId: Number(userId),
            action: `${activityField}_changed`,
            field: activityField,
            oldValue: oldValue != null ? String(oldValue) : null,
            newValue: newValue != null ? String(newValue) : null,
          });
        }
      }
    }

    // Update task and create activities in a transaction
    const [updatedTask] = await prisma.$transaction([
      prisma.task.update({
        where: { id: Number(taskId) },
        data: updates,
        include: {
          project: true,
          author: true,
          assignee: true,
          comments: {
            include: { user: true },
            orderBy: { id: "desc" },
          },
          attachments: {
            include: { uploadedBy: true },
          },
          activities: {
            include: { user: true },
            orderBy: { createdAt: "desc" },
          },
        },
      }),
      ...(activities.length > 0
        ? [prisma.taskActivity.createMany({ data: activities })]
        : []),
    ]);

    res.json(updatedTask);
  } catch (error: any) {
    res.status(500).json({ message: `Error updating task: ${error.message}` });
  }
};
