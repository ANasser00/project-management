"use client";

import { useState } from "react";
import {
  TaskDetails,
  User,
  Priority,
  Status,
} from "@/state/api";
import {
  Calendar,
  Flag,
  User as UserIcon,
  Folder,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";

interface TaskPropertiesProps {
  task: TaskDetails;
  users: User[];
  onUpdate: (updates: Record<string, unknown>) => void;
}

const priorityColors: Record<Priority, string> = {
  [Priority.Urgent]: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  [Priority.High]: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  [Priority.Medium]: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  [Priority.Low]: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  [Priority.Backlog]: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

const statusColors: Record<Status, string> = {
  [Status.ToDo]: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  [Status.WorkInProgress]: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  [Status.UnderReview]: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  [Status.Completed]: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
};

export default function TaskProperties({
  task,
  users,
  onUpdate,
}: TaskPropertiesProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleStatusChange = (status: Status) => {
    onUpdate({ status });
    setActiveDropdown(null);
  };

  const handlePriorityChange = (priority: Priority) => {
    onUpdate({ priority });
    setActiveDropdown(null);
  };

  const handleAssigneeChange = (userId: number | null) => {
    onUpdate({ assignedUserId: userId });
    setActiveDropdown(null);
  };

  const handleDateChange = (field: string, value: string) => {
    onUpdate({ [field]: value ? new Date(value).toISOString() : null });
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-dark-secondary">
      <h2 className="mb-6 text-sm font-semibold text-gray-500 dark:text-gray-400">
        Properties
      </h2>

      <div className="space-y-6">
        {/* Status */}
        <div className="relative">
          <label className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Folder className="h-4 w-4" />
            Status
          </label>
          <button
            onClick={() =>
              setActiveDropdown(activeDropdown === "status" ? null : "status")
            }
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm ${
              task.status
                ? statusColors[task.status as Status]
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            <span>{task.status || "No status"}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {activeDropdown === "status" && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-dark-secondary">
              {Object.values(Status).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span
                    className={`inline-block rounded px-2 py-0.5 ${statusColors[status]}`}
                  >
                    {status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Priority */}
        <div className="relative">
          <label className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Flag className="h-4 w-4" />
            Priority
          </label>
          <button
            onClick={() =>
              setActiveDropdown(
                activeDropdown === "priority" ? null : "priority",
              )
            }
            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm ${
              task.priority
                ? priorityColors[task.priority as Priority]
                : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            <span>{task.priority || "No priority"}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {activeDropdown === "priority" && (
            <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-dark-secondary">
              {Object.values(Priority).map((priority) => (
                <button
                  key={priority}
                  onClick={() => handlePriorityChange(priority)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span
                    className={`inline-block rounded px-2 py-0.5 ${priorityColors[priority]}`}
                  >
                    {priority}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Assignee */}
        <div className="relative">
          <label className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <UserIcon className="h-4 w-4" />
            Assignee
          </label>
          <button
            onClick={() =>
              setActiveDropdown(
                activeDropdown === "assignee" ? null : "assignee",
              )
            }
            className="flex w-full items-center justify-between rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          >
            <span>{task.assignee?.username || "Unassigned"}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
          {activeDropdown === "assignee" && (
            <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-dark-secondary">
              <button
                onClick={() => handleAssigneeChange(null)}
                className="block w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Unassigned
              </button>
              {users.map((user) => (
                <button
                  key={user.userId}
                  onClick={() => handleAssigneeChange(user.userId!)}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {user.username}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Due Date */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            Due Date
          </label>
          <input
            type="date"
            value={
              task.dueDate
                ? format(new Date(task.dueDate), "yyyy-MM-dd")
                : ""
            }
            onChange={(e) => handleDateChange("dueDate", e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-dark-tertiary"
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            Start Date
          </label>
          <input
            type="date"
            value={
              task.startDate
                ? format(new Date(task.startDate), "yyyy-MM-dd")
                : ""
            }
            onChange={(e) => handleDateChange("startDate", e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-dark-tertiary"
          />
        </div>

        {/* Project (read-only) */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Folder className="h-4 w-4" />
            Project
          </label>
          <div className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
            {task.project?.name || "No project"}
          </div>
        </div>

        {/* Points */}
        {task.points !== undefined && task.points !== null && (
          <div>
            <label className="mb-2 block text-sm text-gray-500 dark:text-gray-400">
              Points
            </label>
            <div className="rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 dark:bg-gray-700 dark:text-gray-300">
              {task.points}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
