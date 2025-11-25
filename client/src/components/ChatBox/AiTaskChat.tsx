"use client";
import React, { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function AiTaskChat({
  onTaskExtracted,
}: {
  onTaskExtracted: (task: any) => void;
}) {
  const [input, setInput] = useState("");
  const [aiResult, setAiResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAiResult(null);
    try {
      const res = await fetch(`${API}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setAiResult(data.extracted);
      if (onTaskExtracted) onTaskExtracted(data.extracted);
    } catch {
      setAiResult({ error: "AI error" });
    }
    setLoading(false);
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 rounded border p-2"
          placeholder="Tell me what you need to do..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white"
          disabled={loading}
        >
          {loading ? "Thinking..." : "Ask AI"}
        </button>
      </form>
      {aiResult && (
        <div className="mt-4 rounded bg-gray-50 p-2 text-sm dark:bg-gray-800">
          <pre>{JSON.stringify(aiResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
