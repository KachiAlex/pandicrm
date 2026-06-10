"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { api, Task } from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; dot: string; bg: string }> = {
  todo: { label: "To Do", dot: "#9ca3af", bg: "#e5e7eb" },
  in_progress: { label: "In Progress", dot: "#ff1a97", bg: "#fff0f7" },
  done: { label: "Done", dot: "#4ade80", bg: "#f0fdf4" },
};

export default function TasksPanel({ workspaceId }: { workspaceId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    api.tasks.list(workspaceId).then((data) => {
      setTasks(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-pk-600" />
      </div>
    );
  }

  const groups = ["todo", "in_progress", "done"] as const;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Task Board</h2>
        <button className="btn-p text-xs px-3.5 py-2"><Plus className="w-3.5 h-3.5" />New Task</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {groups.map((status) => {
          const meta = STATUS_LABELS[status];
          const items = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="rounded-2xl p-4" style={{ background: "rgba(243,244,246,0.7)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: meta.dot }} />
                <p style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".05em" }}>{meta.label}</p>
                <span className="ml-auto" style={{ fontSize: 9.5, background: meta.bg, color: meta.dot, padding: "1px 6px", borderRadius: 999 }}>{items.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((item) => {
                  const hot = item.priority === "high" && item.status !== "done";
                  const done = item.status === "done";
                  const due = item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "No due date";
                  return (
                    <div key={item.id} className="surf p-3" style={hot ? { borderLeft: "3px solid #ff1a97" } : {}}>
                      <p style={{ fontSize: 11.5, fontWeight: done ? 400 : 600, color: done ? "#9ca3af" : "#1f2937", textDecoration: done ? "line-through" : "none", marginBottom: 3 }}>{item.title}</p>
                      <p style={{ fontSize: 10, color: done ? "#16a34a" : hot ? "#b80055" : "#9ca3af", fontWeight: hot ? 600 : 400 }}>{done ? "Completed" : due}</p>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-xs">No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
