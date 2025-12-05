import Modal from "@/components/Modal";
import {
  Priority,
  Status,
  useCreateTaskMutation,
  useGetAuthUserQuery,
  useGetUsersQuery,
  useGetProjectsQuery,
} from "@/state/api";
import React, { useState, useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  id?: string | null; // projectId if provided
};

const ModalNewTask = ({ isOpen, onClose, id = null }: Props) => {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const { data: currentUser } = useGetAuthUserQuery();
  const { data: users } = useGetUsersQuery();
  const { data: projects } = useGetProjectsQuery();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Backlog);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [projectId, setProjectId] = useState(id ? String(id) : "");

  useEffect(() => {
    if (id) setProjectId(String(id));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !currentUser?.userId || !projectId) return;

    await createTask({
      title,
      description,
      status,
      priority,
      tags,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      authorUserId: currentUser.userId,
      assignedUserId: assignedUserId ? Number(assignedUserId) : undefined,
      projectId: Number(projectId),
    });

    setTitle("");
    setDescription("");
    setStatus(Status.ToDo);
    setPriority(Priority.Backlog);
    setTags("");
    setStartDate("");
    setDueDate("");
    setAssignedUserId("");
    if (!id) setProjectId("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-xl rounded-2xl bg-gradient-to-br from-white to-gray-100 p-8 shadow-2xl dark:from-[#181c24] dark:to-[#232a36]">
        <button
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          ×
        </button>
        <h2 className="mb-6 text-center text-2xl font-extrabold text-blue-600 dark:text-blue-300">
          Create New Task
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              className="w-full rounded-lg border bg-gray-50 p-3 text-gray-900 dark:bg-dark-tertiary dark:text-white"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Task title"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              className="w-full rounded-lg border bg-gray-50 p-3 text-gray-900 dark:bg-dark-tertiary dark:text-white"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status
              </label>
              <select
                className="w-full rounded-lg border bg-gray-50 p-3 dark:bg-dark-tertiary dark:text-white"
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
              >
                {Object.values(Status).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Priority
              </label>
              <select
                className="w-full rounded-lg border bg-gray-50 p-3 dark:bg-dark-tertiary dark:text-white"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                {Object.values(Priority).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Tags
            </label>
            <input
              className="w-full rounded-lg border bg-gray-50 p-3 text-gray-900 dark:bg-dark-tertiary dark:text-white"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="comma,separated,tags"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border bg-gray-50 p-3 text-gray-900 dark:bg-dark-tertiary dark:text-white"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Due Date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border bg-gray-50 p-3 text-gray-900 dark:bg-dark-tertiary dark:text-white"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Assignee
              </label>
              <select
                className="w-full rounded-lg border bg-gray-50 p-3 dark:bg-dark-tertiary dark:text-white"
                value={assignedUserId}
                onChange={(e) => setAssignedUserId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {users?.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.username}
                  </option>
                ))}
              </select>
            </div>
            {!id && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Project
                </label>
                <select
                  className="w-full rounded-lg border bg-gray-50 p-3 dark:bg-dark-tertiary dark:text-white"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  required
                >
                  <option value="">Select project</option>
                  {projects?.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border border-gray-400 bg-transparent px-5 py-2 font-semibold text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-2 font-bold text-white shadow-lg transition hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-400"
              disabled={isLoading || !title || !projectId}
            >
              {isLoading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalNewTask;
