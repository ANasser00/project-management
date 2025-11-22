"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useGetTaskByIdQuery,
  useUpdateTaskMutation,
  useGetUsersQuery,
  useGetAuthUserQuery,
} from "@/state/api";
import { ArrowLeft, Loader2, Pencil, Check, X } from "lucide-react";
import TaskProperties from "./TaskProperties";
import TaskActivityFeed from "./TaskActivityFeed";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params.id);

  const { data: task, isLoading, error } = useGetTaskByIdQuery(taskId);
  const { data: users } = useGetUsersQuery();
  const { data: currentUser } = useGetAuthUserQuery();
  const [updateTask] = useUpdateTaskMutation();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || "");
    }
  }, [task]);

  const handleUpdateTask = async (updates: Record<string, unknown>) => {
    if (!currentUser?.userId) return;
    await updateTask({
      taskId,
      userId: currentUser.userId,
      ...updates,
    });
  };

  const handleSaveTitle = async () => {
    if (editTitle.trim() && editTitle !== task?.title) {
      await handleUpdateTask({ title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleSaveDescription = async () => {
    if (editDescription !== task?.description) {
      await handleUpdateTask({ description: editDescription });
    }
    setIsEditingDescription(false);
  };

  const handleCancelTitle = () => {
    setEditTitle(task?.title || "");
    setIsEditingTitle(false);
  };

  const handleCancelDescription = () => {
    setEditDescription(task?.description || "");
    setIsEditingDescription(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Task not found</p>
        <button
          onClick={() => router.back()}
          className="text-blue-500 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-dark-secondary">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <span className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {task.project?.name}
          </span>
          <span className="text-gray-400">/</span>
          <span className="text-sm text-gray-500">Task-{task.id}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-3xl">
            {/* Title */}
            {isEditingTitle ? (
              <div className="mb-4 flex items-center gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-2xl font-semibold text-gray-900 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-dark-tertiary dark:text-white"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") handleCancelTitle();
                  }}
                />
                <button
                  onClick={handleSaveTitle}
                  className="rounded p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <Check className="h-5 w-5" />
                </button>
                <button
                  onClick={handleCancelTitle}
                  className="rounded p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div
                className="group mb-4 flex cursor-pointer items-center gap-2"
                onClick={() => setIsEditingTitle(true)}
              >
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {task.title}
                </h1>
                <Pencil className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            )}

            {/* Description */}
            <div className="mb-8">
              <h2 className="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Description
              </h2>
              {isEditingDescription ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={6}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-dark-tertiary dark:text-gray-300"
                    autoFocus
                    placeholder="Add a description..."
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveDescription}
                      className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                    >
                      <Check className="h-4 w-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelDescription}
                      className="flex items-center gap-1 rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="group cursor-pointer rounded-md p-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setIsEditingDescription(true)}
                >
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {task.description || "Click to add a description..."}
                  </p>
                  <Pencil className="mt-2 h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              )}
            </div>

            {/* Activity Feed */}
            <TaskActivityFeed activities={task.activities || []} />
          </div>
        </div>

        {/* Properties Sidebar */}
        <TaskProperties
          task={task}
          users={users || []}
          onUpdate={handleUpdateTask}
        />
      </div>
    </div>
  );
}
