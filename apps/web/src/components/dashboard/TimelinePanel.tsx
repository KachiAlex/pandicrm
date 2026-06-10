"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { api, TimelineEvent } from "@/lib/api";

export default function TimelinePanel({ workspaceId }: { workspaceId: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    api.timeline.list(workspaceId).then((data) => {
      setEvents(data);
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

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Customer Timeline</h2>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>{events.length} events</span>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: "linear-gradient(180deg,#ff1a97 0%,rgba(255,26,151,0.08) 100%)" }} />
        <div className="flex flex-col gap-4 pl-10">
          {events.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-8">No timeline events yet.</div>
          )}
          {events.map((ev) => {
            const date = new Date(ev.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            const typeColors: Record<string, { dot: string; glow: string; badge: string; badgeBg: string; badgeBorder: string }> = {
              call: { dot: "#ff1a97", glow: "rgba(255,26,151,0.14)", badge: "#b80055", badgeBg: "#fff0f7", badgeBorder: "rgba(184,0,85,0.12)" },
              email: { dot: "#3b82f6", glow: "rgba(59,130,246,0.14)", badge: "#1d4ed8", badgeBg: "#eff6ff", badgeBorder: "rgba(29,78,216,0.12)" },
              meeting: { dot: "#f59e0b", glow: "rgba(245,158,11,0.14)", badge: "#d97706", badgeBg: "#fffbeb", badgeBorder: "rgba(217,119,6,0.14)" },
              note: { dot: "#a78bfa", glow: "rgba(167,139,250,0.14)", badge: "#7c3aed", badgeBg: "#f5f3ff", badgeBorder: "rgba(124,58,237,0.12)" },
              deal_stage_change: { dot: "#22c55e", glow: "rgba(34,197,94,0.14)", badge: "#16a34a", badgeBg: "#f0fdf4", badgeBorder: "rgba(22,163,74,0.12)" },
              task_completed: { dot: "#4ade80", glow: "rgba(74,222,128,0.14)", badge: "#16a34a", badgeBg: "#f0fdf4", badgeBorder: "rgba(22,163,74,0.12)" },
            };
            const colors = typeColors[ev.type] || typeColors.note;
            return (
              <div key={ev.id} className="relative">
                <div className="tld absolute -left-6 top-1.5" style={{ background: colors.dot, boxShadow: `0 0 0 3px ${colors.glow}` }} />
                <div className="surf p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>{ev.title}</p>
                    <span style={{ fontSize: 10, color: "#9ca3af" }}>{date}</span>
                  </div>
                  {ev.description && (
                    <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{ev.description}</p>
                  )}
                  <span style={{ fontSize: 10, color: colors.badge, background: colors.badgeBg, padding: "3px 10px", borderRadius: 999, border: `1px solid ${colors.badgeBorder}` }}>
                    {ev.type.replace("_", " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
