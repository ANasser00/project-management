"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetUsersQuery,
  useGetAuthUserQuery,
  useGetProjectsQuery,
} from "@/state/api";
import { Loader2, Sparkles, SendHorizonal } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type ChatMessage = {
  role: "user" | "ai";
  content: string;
  extracted?: any;
  actionCompleted?: boolean;
  completionText?: string;
};

const REQUIRED_FIELDS = [
  "title",
  "description",
  "status",
  "priority",
  "tags",
  "startDate",
  "dueDate",
  "assignee",
];

function getMissingFields(task: any) {
  return REQUIRED_FIELDS.filter(
    (field) =>
      !task[field] ||
      (typeof task[field] === "string" && task[field].trim() === ""),
  );
}

function randomTitle() {
  const titles = [
    "Review Q4 Budget",
    "Design Landing Page",
    "Fix Login Bug",
    "Prepare Sprint Demo",
    "Update Documentation",
    "Plan Team Meeting",
    "Optimize Database",
    "Write Unit Tests",
    "Refactor API",
    "Research New Tools",
  ];
  return titles[Math.floor(Math.random() * titles.length)];
}

function randomDescription() {
  const descs = [
    "This task was generated automatically.",
    "Please update as needed.",
    "Randomly assigned for demo purposes.",
    "No description provided.",
    "Auto-generated task.",
  ];
  return descs[Math.floor(Math.random() * descs.length)];
}

function randomStatus() {
  const statuses = ["To Do", "Work In Progress", "Under Review", "Completed"];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

function randomPriority() {
  const priorities = ["Urgent", "High", "Medium", "Low", "Backlog"];
  return priorities[Math.floor(Math.random() * priorities.length)];
}

function randomTags() {
  const tags = [
    "frontend,urgent",
    "backend,api",
    "meeting,planning",
    "bug,critical",
    "documentation",
    "research",
    "review",
    "testing",
    "refactor",
    "feature",
  ];
  return tags[Math.floor(Math.random() * tags.length)];
}

function randomDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays + Math.floor(Math.random() * 10));
  return date.toISOString().split("T")[0];
}

export default function AiTaskChatBox() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [createTask, { isLoading: creating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: updating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();
  const { data: users } = useGetUsersQuery();
  const { data: currentUser } = useGetAuthUserQuery();
  const { data: projects } = useGetProjectsQuery();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [selectedProjectId, setSelectedProjectId] = useState<number>();

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  useEffect(() => {
    if (!selectedProjectId && projects && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Load chat from localStorage on mount
  useEffect(() => {
    const savedChat = localStorage.getItem("ai-task-chat");
    if (savedChat) {
      setChat(JSON.parse(savedChat));
    }
  }, []);

  // Save chat to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("ai-task-chat", JSON.stringify(chat));
  }, [chat]);

  // Find userId by username (case-insensitive)
  const findUserId = (username: string) => {
    if (!users || !username) return undefined;
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase(),
    );
    return user?.userId;
  };

  // Find projectId by name (case-insensitive)
  const findProjectIdByName = (name?: string) => {
    if (!projects || !name) return undefined;
    const lower = name.toLowerCase();
    return projects.find((p) => p.name.toLowerCase() === lower)?.id;
  };

  // Find a valid projectId (random if multiple)
  const getRandomProjectId = () => {
    if (!projects || projects.length === 0) return undefined;
    return projects[Math.floor(Math.random() * projects.length)]?.id;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = input.trim();
    setChat((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    const historyPayload = chat.slice(-12).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const res = await fetch(`${API}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: userMessage, history: historyPayload }),
      });
      const data = await res.json();
      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.extracted
            ? "Here is what I extracted from your request:"
            : "Sorry, I couldn't extract a task from that.",
          extracted: data.extracted,
        },
      ]);
    } catch {
      setChat((prev) => [
        ...prev,
        { role: "ai", content: "AI error. Please try again." },
      ]);
    }
    setLoading(false);
  };

  const determineAction = (msg: ChatMessage) =>
    msg.extracted?.action?.toLowerCase?.() ?? "create";

  const handleAiAction = async (extracted: any, messageIndex: number) => {
    if (!extracted) return;
    const action = (extracted.action || "create").toLowerCase();

    const ensureUser = () => {
      if (!currentUser?.userId) {
        setChat((prev) => [
          ...prev,
          { role: "ai", content: "You must be signed in to modify tasks." },
        ]);
        return false;
      }
      return true;
    };

    try {
      if (action === "update") {
        if (!ensureUser()) return;
        const taskId = extracted.taskId;
        if (!taskId) {
          setChat((prev) => [
            ...prev,
            { role: "ai", content: "I need the task ID to perform an update." },
          ]);
          return;
        }
        const updates = extracted.updatedFields || {};
        const resolved: Record<string, any> = {};

        if (updates.title !== undefined) resolved.title = updates.title;
        if (updates.description !== undefined)
          resolved.description = updates.description;
        if (updates.status !== undefined) resolved.status = updates.status;
        if (updates.priority !== undefined)
          resolved.priority = updates.priority;
        if (updates.tags !== undefined) resolved.tags = updates.tags;

        if (updates.startDate !== undefined)
          resolved.startDate = updates.startDate
            ? new Date(updates.startDate).toISOString()
            : null;
        if (updates.dueDate !== undefined)
          resolved.dueDate = updates.dueDate
            ? new Date(updates.dueDate).toISOString()
            : null;

        const resolvedAssignee =
          updates.assigneeUserId ??
          (updates.assignee ? findUserId(updates.assignee) : undefined);
        if (resolvedAssignee !== undefined)
          resolved.assignedUserId = resolvedAssignee;

        if (updates.projectId !== undefined)
          resolved.projectId = updates.projectId;
        else if (updates.projectName) {
          const matched = findProjectIdByName(updates.projectName);
          if (matched) resolved.projectId = matched;
        }

        const hasChanges = Object.keys(resolved).length > 0;
        if (!hasChanges) {
          setChat((prev) => [
            ...prev,
            {
              role: "ai",
              content: "No updated fields were provided to apply.",
            },
          ]);
          return;
        }

        await updateTask({
          taskId,
          userId: currentUser?.userId as number,
          ...resolved,
        }).unwrap();

        setChat((prev) =>
          prev.map((msg, idx) =>
            idx === messageIndex
              ? {
                  ...msg,
                  actionCompleted: true,
                  completionText: `Task #${taskId} updated successfully.`,
                }
              : msg,
          ),
        );
        return;
      }

      if (action === "delete") {
        if (!ensureUser()) return;
        const taskId = extracted.taskId;
        if (!taskId) {
          setChat((prev) => [
            ...prev,
            { role: "ai", content: "I need the task ID to delete it." },
          ]);
          return;
        }
        await deleteTask(taskId).unwrap();
        setChat((prev) =>
          prev.map((msg, idx) =>
            idx === messageIndex
              ? {
                  ...msg,
                  actionCompleted: true,
                  completionText: `Task #${taskId} deleted.`,
                }
              : msg,
          ),
        );
        return;
      }

      // CREATE (default)
      if (!ensureUser()) return;
      const filled = {
        ...extracted,
        title: extracted.title || randomTitle(),
        description: extracted.description || randomDescription(),
        status: extracted.status || randomStatus(),
        priority: extracted.priority || randomPriority(),
        tags: extracted.tags || randomTags(),
        startDate: extracted.startDate || randomDate(-5),
        dueDate: extracted.dueDate || randomDate(5),
        assignee:
          extracted.assignee ||
          users?.[Math.floor(Math.random() * (users?.length || 1))]?.username ||
          "Unassigned",
      };

      const assignedUserId = findUserId(filled.assignee);
      const projectId =
        extracted.projectId ??
        findProjectIdByName(extracted.projectName) ??
        selectedProjectId ??
        getRandomProjectId();

      if (!projectId) {
        setChat((prev) => [
          ...prev,
          {
            role: "ai",
            content:
              "No valid project found. Create a project first before adding tasks.",
          },
        ]);
        return;
      }

      await createTask({
        title: filled.title,
        description: filled.description,
        status: filled.status,
        priority: filled.priority,
        tags: filled.tags,
        startDate: filled.startDate
          ? new Date(filled.startDate).toISOString()
          : undefined,
        dueDate: filled.dueDate
          ? new Date(filled.dueDate).toISOString()
          : undefined,
        assignedUserId,
        projectId,
        authorUserId: currentUser?.userId,
      }).unwrap();

      setChat((prev) =>
        prev.map((msg, idx) =>
          idx === messageIndex
            ? {
                ...msg,
                actionCompleted: true,
                completionText: "Task created successfully.",
              }
            : msg,
        ),
      );
    } catch (err: any) {
      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          content: `Unable to ${action} the task: ${
            err?.data?.message || err?.message || "unknown error"
          }`,
        },
      ]);
    }
  };

  return (
    <div className="mx-auto flex h-[75vh] max-w-3xl flex-col rounded-2xl bg-gradient-to-b from-white to-gray-50 p-6 shadow-xl dark:from-[#111827] dark:to-[#0f172a]">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/30 pb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Task Assistant
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Choose a project or mention it in your prompt
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-300">
            Project
          </label>
          <select
            className="rounded-lg border border-white/40 bg-white/80 px-3 py-1 text-sm dark:border-white/10 dark:bg-black/30 dark:text-white"
            value={selectedProjectId ?? ""}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            disabled={!projects || projects.length === 0}
          >
            {projects?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl bg-white/70 p-4 shadow-inner dark:bg-white/5">
        {chat.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center text-gray-500 dark:text-gray-400">
            <Sparkles className="mb-3 h-8 w-8 text-blue-400" />
            <p className="font-medium">“Tell me what you need to do…”</p>
            <p className="text-sm">
              e.g. “Create a random task for marketing next week”
            </p>
          </div>
        )}

        {chat.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-900 shadow dark:bg-gray-800 dark:text-gray-100"
              }`}
            >
              <p className="whitespace-pre-line">{msg.content}</p>

              {msg.role === "ai" && msg.extracted && (
                <div className="mt-3 space-y-3 rounded-xl bg-white/80 p-3 text-xs text-gray-800 shadow-inner dark:bg-black/20 dark:text-gray-100">
                  <div className="flex items-center justify-between rounded-full bg-gray-200 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                    <span>{determineAction(msg)}</span>
                    {msg.extracted?.taskId && (
                      <span>Task #{msg.extracted.taskId}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Title", value: msg.extracted.title },
                      {
                        label: "Description",
                        value: msg.extracted.description,
                      },
                      { label: "Status", value: msg.extracted.status },
                      { label: "Priority", value: msg.extracted.priority },
                      { label: "Tags", value: msg.extracted.tags },
                      { label: "Start Date", value: msg.extracted.startDate },
                      { label: "Due Date", value: msg.extracted.dueDate },
                      { label: "Assignee", value: msg.extracted.assignee },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] uppercase tracking-wide text-gray-500">
                          {label}
                        </p>
                        <p className="font-medium">
                          {value || (
                            <span className="text-red-500">Not set</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>

                  {determineAction(msg) === "update" && (
                    <div className="rounded-lg bg-blue-50 p-2 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                      <p className="text-[11px] font-semibold">
                        Fields to update
                      </p>
                      <ul className="mt-1 list-disc pl-4">
                        {Object.entries(msg.extracted.updatedFields || {}).map(
                          ([field, value]) => (
                            <li key={field}>
                              <span className="font-semibold">{field}</span>:{" "}
                              {String(value)}
                            </li>
                          ),
                        )}
                      </ul>
                    </div>
                  )}
                  {determineAction(msg) === "delete" && (
                    <div className="rounded-lg bg-red-50 p-2 text-red-700 dark:bg-red-900/30 dark:text-red-200">
                      Are you sure you want to delete this task?
                    </div>
                  )}

                  {msg.extracted?.needsClarification ? (
                    <div className="rounded-lg bg-yellow-50 p-3 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                      {msg.extracted.followUpQuestion ||
                        "Please provide the missing information."}
                    </div>
                  ) : !msg.actionCompleted ? (
                    (() => {
                      const action = determineAction(msg);
                      const actionLoading =
                        action === "update"
                          ? updating
                          : action === "delete"
                            ? deleting
                            : creating;
                      if (action === "create") {
                        const missing = getMissingFields(msg.extracted);
                        return missing.length > 0 ? (
                          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                            <p>
                              Missing:
                              <span className="font-semibold">
                                {" "}
                                {missing.join(", ")}
                              </span>
                            </p>
                            <button
                              className="ml-auto rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                              onClick={() => handleAiAction(msg.extracted, idx)}
                              disabled={actionLoading}
                            >
                              {actionLoading
                                ? "Generating..."
                                : "Auto-fill & Create"}
                            </button>
                          </div>
                        ) : (
                          <button
                            className="w-full rounded-full bg-green-600 px-4 py-2 text-center text-xs font-semibold uppercase text-white hover:bg-green-500 disabled:opacity-60"
                            onClick={() => handleAiAction(msg.extracted, idx)}
                            disabled={actionLoading}
                          >
                            {actionLoading ? "Creating..." : "Create Task"}
                          </button>
                        );
                      }
                      if (action === "update") {
                        return (
                          <button
                            className="w-full rounded-full bg-blue-600 px-4 py-2 text-center text-xs font-semibold uppercase text-white hover:bg-blue-500 disabled:opacity-60"
                            onClick={() => handleAiAction(msg.extracted, idx)}
                            disabled={actionLoading}
                          >
                            {actionLoading
                              ? "Updating..."
                              : `Update Task #${msg.extracted.taskId ?? ""}`}
                          </button>
                        );
                      }
                      return (
                        <button
                          className="w-full rounded-full bg-red-600 px-4 py-2 text-center text-xs font-semibold uppercase text-white hover:bg-red-500 disabled:opacity-60"
                          onClick={() => handleAiAction(msg.extracted, idx)}
                          disabled={actionLoading}
                        >
                          {actionLoading ? "Deleting..." : "Delete Task"}
                        </button>
                      );
                    })()
                  ) : (
                    <p className="text-center text-green-500">
                      {msg.completionText}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="mt-4 flex items-end gap-3 rounded-2xl border border-white/40 bg-white/80 p-3 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5"
      >
        <textarea
          className="min-h-[60px] flex-1 resize-none rounded-xl bg-transparent p-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none dark:text-white dark:placeholder-gray-400"
          placeholder="Describe the task, or ask for a random one..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-500 disabled:opacity-50"
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <SendHorizonal className="h-4 w-4" />
          )}
          {loading ? "Thinking" : "Send"}
        </button>
      </form>
    </div>
  );
}
