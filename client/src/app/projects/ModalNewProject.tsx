"use client";
import React, { useState } from "react";
import { useCreateProjectMutation } from "@/state/api";
import { X } from "lucide-react";

export default function ModalNewProject({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [createProject, { isLoading, isSuccess, isError }] =
    useCreateProjectMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject({
      name,
      description,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined,
    });
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-br from-[#181c24] to-[#232a36] p-8 shadow-2xl ring-1 ring-blue-900/40 dark:from-[#181c24] dark:to-[#232a36]">
        {/* Close Button */}
        <button
          className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition hover:bg-gray-700 hover:text-white"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="mb-6 text-center text-3xl font-extrabold tracking-tight text-blue-400 drop-shadow dark:text-blue-300">
          Create New Project
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-300">
              Name
            </label>
            <input
              className="w-full rounded-lg border-none bg-[#232a36] p-3 text-white placeholder-gray-500 shadow-inner focus:ring-2 focus:ring-blue-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Project name"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-300">
              Description
            </label>
            <textarea
              className="w-full rounded-lg border-none bg-[#232a36] p-3 text-white placeholder-gray-500 shadow-inner focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description"
              rows={3}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-gray-300">
                Start Date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border-none bg-[#232a36] p-3 text-white placeholder-gray-500 shadow-inner focus:ring-2 focus:ring-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-semibold text-gray-300">
                End Date
              </label>
              <input
                type="date"
                className="w-full rounded-lg border-none bg-[#232a36] p-3 text-white placeholder-gray-500 shadow-inner focus:ring-2 focus:ring-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              className="rounded-lg border border-gray-500 bg-transparent px-5 py-2 font-semibold text-gray-300 transition hover:bg-gray-700 hover:text-white"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-2 font-bold text-white shadow-lg transition hover:from-blue-600 hover:to-blue-800 focus:ring-2 focus:ring-blue-400"
              disabled={isLoading || !name}
            >
              {isLoading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
        {isError && (
          <div className="mt-4 rounded bg-red-900/80 p-3 text-center text-sm text-red-200 shadow">
            Error creating project.
          </div>
        )}
      </div>
    </div>
  );
}
