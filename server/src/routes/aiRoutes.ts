import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

const safe = (value?: string | null) =>
  value ? value.replace(/"/g, '\\"') : "";
const formatDate = (value?: Date | null) =>
  value ? value.toISOString().split("T")[0] : "";

router.post("/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message) return res.status(400).json({ error: "No message provided" });

  try {
    const [projects, users, tasks] = await Promise.all([
      prisma.project.findMany({ select: { id: true, name: true } }),
      prisma.user.findMany({ select: { userId: true, username: true } }),
      prisma.task.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          tags: true,
          startDate: true,
          dueDate: true,
          projectId: true,
          project: { select: { name: true } },
          assignee: { select: { username: true, userId: true } },
        },
        orderBy: { id: "desc" },
        take: 40,
      }),
    ]);

    const projectContext =
      projects.length > 0
        ? projects.map((p) => `{"id":${p.id},"name":"${p.name}"}`).join(", ")
        : "";
    const userContext =
      users.length > 0
        ? users
            .map((u) => `{"userId":${u.userId},"username":"${u.username}"}`)
            .join(", ")
        : "";

    const taskContext =
      tasks.length > 0
        ? tasks
            .map(
              (t) =>
                `{"id":${t.id},"title":"${safe(t.title)}","description":"${safe(
                  t.description
                )}","projectId":${t.projectId},"projectName":"${safe(
                  t.project?.name
                )}","status":"${safe(t.status)}","priority":"${safe(
                  t.priority
                )}","tags":"${safe(t.tags)}","startDate":"${formatDate(
                  t.startDate
                )}","dueDate":"${formatDate(t.dueDate)}","assignee":"${safe(
                  t.assignee?.username
                )}","assigneeUserId":${t.assignee?.userId ?? "null"}}`
            )
            .join(", ")
        : "";

    const historyText =
      history.length > 0
        ? history
            .map(
              (entry: { role: string; content: string }) =>
                `${entry.role.toUpperCase()}: ${entry.content}`
            )
            .join("\n")
        : "No prior conversation.";

    const prompt = `
You are an intelligent task planner inside a project management app.

Return JSON ONLY with these keys:
{
  "action": "create" | "update" | "delete",
  "taskId": number|null,
  "projectId": number|null,
  "projectName": string|null,
  "title": string|null,
  "description": string|null,
  "status": "To Do"|"Work In Progress"|"Under Review"|"Completed"|null,
  "priority": "Urgent"|"High"|"Medium"|"Low"|"Backlog"|null,
  "tags": string|null,
  "startDate": "YYYY-MM-DD"|null,
  "dueDate": "YYYY-MM-DD"|null,
  "assignee": string|null,
  "assigneeUserId": number|null,
  "updatedFields": { ...only when action === "update" },
  "deleteReason": string|null,
  "needsClarification": boolean,
  "followUpQuestion": string
}

Rules:
1. Decide the action: use "update" or "delete" only when the user references an existing task from the list. "Delete" must be explicitly requested.
2. When updating or deleting, identify the correct task by id/title/project from the context.
3. When action is "update" or "delete", copy every known field (title, description, status, priority, tags, dates, assignee) from that task into your response unless the user explicitly changes it. Do NOT return null or "Not set" if the context already contains a value.
4. When creating and information is missing, fabricate realistic details (title, description, dates, etc.).
5. Always prefer existing users/projects for assignment; otherwise set assignee to "Unassigned" and projectId null.
6. If you need more info, set needsClarification=true and ask in followUpQuestion.
7. Dates must be YYYY-MM-DD.

Existing projects: [${projectContext || "none"}]
Existing users: [${userContext || "none"}]
Existing tasks (reference by id when updating/deleting): [${
      taskContext || "none"
    }]

Conversation so far:
${historyText}

Current user message: """${message}"""
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Gemini API error:", error);
      return res
        .status(500)
        .json({ error: "Gemini API error", details: error });
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "{}";
    let extracted;
    try {
      extracted = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      extracted = match ? JSON.parse(match[0]) : {};
    }

    res.json({ extracted });
  } catch (e) {
    console.error("AI /chat error:", e);
    res.status(500).json({ error: "AI error", details: e });
  }
});

export default router;
