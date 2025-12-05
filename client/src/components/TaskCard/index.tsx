import { Task } from "@/state/api";
import { format } from "date-fns";
import Image from "next/image";
import React from "react";

type Props = {
  task: Task;
};

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8000";

const TaskCard = ({ task }: Props) => {
  return (
    <div className="mb-4 rounded-2xl border border-gray-800 bg-gradient-to-br from-[#181c24] to-[#232a36] p-6 shadow-xl transition hover:scale-[1.01] hover:shadow-2xl">
      <div className="mb-2 flex items-center justify-between">
        <span className="inline-block rounded-full border border-blue-800 bg-blue-900/60 px-3 py-1 text-xs font-bold text-blue-200">
          #{task.id}
        </span>
        <span
          className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${
            task.priority === "Urgent"
              ? "border-red-800 bg-red-900/60 text-red-200"
              : task.priority === "High"
                ? "border-orange-800 bg-orange-900/60 text-orange-200"
                : task.priority === "Medium"
                  ? "border-yellow-800 bg-yellow-900/60 text-yellow-200"
                  : "border-gray-700 bg-gray-800/80 text-gray-200"
          }`}
        >
          {task.priority}
        </span>
      </div>
      <h3 className="mb-2 text-xl font-bold text-blue-200">{task.title}</h3>
      <p className="mb-3 text-gray-300">
        {task.description || "No description provided"}
      </p>
      {task.attachments && task.attachments.length > 0 && (
        <div className="mb-3">
          <Image
            src={
              task.attachments[0].fileURL
                ? `${API}/uploads/${task.attachments[0].fileURL}`
                : "https://via.placeholder.com/400x200?text=No+Image"
            }
            alt={task.attachments[0].fileName}
            width={400}
            height={200}
            className="rounded-lg border border-gray-700"
          />
        </div>
      )}
      <div className="mb-2 flex flex-wrap gap-2">
        <span
          className={`rounded-full border px-2 py-1 text-xs font-semibold ${
            task.status === "Completed"
              ? "border-green-800 bg-green-900/60 text-green-200"
              : task.status === "Work In Progress"
                ? "border-yellow-800 bg-yellow-900/60 text-yellow-200"
                : "border-gray-700 bg-gray-800/80 text-gray-200"
          }`}
        >
          {task.status}
        </span>
        {task.tags &&
          task.tags.split(",").map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-blue-700 bg-blue-800/80 px-2 py-1 text-xs font-semibold text-blue-200"
            >
              {tag.trim()}
            </span>
          ))}
      </div>
      <div className="mb-3 grid grid-cols-2 gap-4 text-sm text-gray-400">
        <div>
          <span className="font-semibold text-gray-300">Start:</span>{" "}
          {task.startDate ? format(new Date(task.startDate), "P") : "Not set"}
        </div>
        <div>
          <span className="font-semibold text-gray-300">Due:</span>{" "}
          {task.dueDate ? format(new Date(task.dueDate), "P") : "Not set"}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400">Author:</span>
          <span className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-200">
            {task.author ? task.author.username : "Unknown"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400">Assignee:</span>
          <span className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-200">
            {task.assignee ? task.assignee.username : "Unassigned"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
