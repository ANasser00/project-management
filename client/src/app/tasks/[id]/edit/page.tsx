"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import {
  Priority,
  Status,
  useGetAuthUserQuery,
  useGetTaskByIdQuery,
  useGetUsersQuery,
  useUpdateTaskMutation,
} from "@/state/api";

type Props = { params: { id: string } };

const toDateInputValue = (value?: string) =>
  value ? new Date(value).toISOString().split("T")[0] : "";

export default function EditTaskPage({ params }: Props) {
  const taskId = Number(params.id);
  const router = useRouter();

  const { data: task, isLoading, isError } = useGetTaskByIdQuery(taskId);
  const { data: currentUser } = useGetAuthUserQuery();
  const { data: users } = useGetUsersQuery();
  const [updateTask, { isLoading: saving }] = useUpdateTaskMutation();

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: Status.ToDo,
    priority: Priority.Medium,
    tags: "",
    startDate: "",
    dueDate: "",
    assignedUserId: undefined as number | undefined,
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || "",
        status: (task.status as Status) || Status.ToDo,
        priority: (task.priority as Priority) || Priority.Medium,
        tags: task.tags || "",
        startDate: toDateInputValue(task.startDate),
        dueDate: toDateInputValue(task.dueDate),
        assignedUserId: task.assignedUserId ?? undefined,
      });
    }
  }, [task]);

  if (isLoading) return <div className="p-8">Loading task…</div>;
  if (isError || !task) return <div className="p-8">Task not found.</div>;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "assignedUserId" && value !== ""
          ? Number(value)
          : value || (name === "assignedUserId" ? undefined : value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTask({
      taskId,
      userId: currentUser?.userId ?? task.authorUserId,
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      tags: form.tags,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      assignedUserId: form.assignedUserId ?? null,
    });
    router.push(`/projects/${task.projectId}`);
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Header name={`Edit Task #${task.id}`} />
      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl bg-white p-6 shadow dark:bg-dark-secondary"
      >
        <div>
          <label className="block text-sm font-semibold">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded border p-2 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold">Description</label>
          <textarea
            name="description"
            rows={4}
            value={form.description}
            onChange={handleChange}
            className="mt-1 w-full rounded border p-2 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 w-full rounded border p-2 dark:bg-gray-800 dark:text-white"
            >
              {Object.values(Status).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold">Priority</label>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="mt-1 w-full rounded border p-2 dark:bg-gray-800 dark:text-white"
            >
              {Object.values(Priority).map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold">Tags</label>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            className="mt-1 w-full rounded border p-2 dark:bg-gray-800 dark:text-white"
            placeholder="comma,separated,tags"
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="mt-1 w-full rounded border p-2 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="mt-1 w-full rounded border p-2 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold">Assignee</label>
          <select
            name="assignedUserId"
            value={form.assignedUserId ?? ""}
            onChange={handleChange}
            className="mt-1 w-full rounded border p-2 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Unassigned</option>
            {users?.map((user) => (
              <option key={user.userId} value={user.userId}>
                {user.username}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="flex-1 rounded border border-gray-300 px-4 py-2 dark:border-gray-600"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
