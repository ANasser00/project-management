"use client";

import { TaskActivity } from "@/state/api";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  ArrowRight,
  Calendar,
  Flag,
  User,
  FileText,
  Tag,
} from "lucide-react";

interface TaskActivityFeedProps {
  activities: TaskActivity[];
}

const getActivityIcon = (action: string) => {
  if (action.includes("status")) return <Activity className="h-4 w-4" />;
  if (action.includes("priority")) return <Flag className="h-4 w-4" />;
  if (action.includes("assignee")) return <User className="h-4 w-4" />;
  if (action.includes("date")) return <Calendar className="h-4 w-4" />;
  if (action.includes("title") || action.includes("description"))
    return <FileText className="h-4 w-4" />;
  if (action.includes("tags")) return <Tag className="h-4 w-4" />;
  return <Activity className="h-4 w-4" />;
};

const formatFieldName = (field: string) => {
  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatValue = (value: string | null | undefined, field: string) => {
  if (!value) return "None";

  // Format dates
  if (field.includes("date")) {
    try {
      return new Date(value).toLocaleDateString();
    } catch {
      return value;
    }
  }

  return value;
};

export default function TaskActivityFeed({
  activities,
}: TaskActivityFeedProps) {
  if (activities.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
          <Activity className="h-4 w-4" />
          Activity
        </h2>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No activity yet
        </p>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
        <Activity className="h-4 w-4" />
        Activity
      </h2>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-4 dark:border-gray-700 dark:bg-dark-secondary"
          >
            <div className="rounded-full bg-gray-100 p-2 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
              {getActivityIcon(activity.action)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  {activity.user?.username || "Unknown user"}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  changed {formatFieldName(activity.field || activity.action)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {formatValue(activity.oldValue, activity.field || "")}
                </span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
                <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {formatValue(activity.newValue, activity.field || "")}
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                {formatDistanceToNow(new Date(activity.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
