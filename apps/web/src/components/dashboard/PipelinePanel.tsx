"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { api, Deal, DealStage } from "@/lib/api";

const STAGES: { key: DealStage; label: string; dot: string }[] = [
  { key: "lead", label: "Lead", dot: "#9ca3af" },
  { key: "qualify", label: "Qualify", dot: "#ffadd9" },
  { key: "propose", label: "Propose", dot: "#f59e0b" },
  { key: "negotiate", label: "Negotiate", dot: "#a78bfa" },
  { key: "won", label: "Won", dot: "#4ade80" },
  { key: "lost", label: "Lost", dot: "#ef4444" },
];

export default function PipelinePanel({ workspaceId }: { workspaceId: string }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    api.deals.list(workspaceId).then((data) => {
      setDeals(data);
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

  const total = deals.reduce((sum, d) => sum + Number(d.value), 0);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Sales Pipeline</h2>
          <p style={{ fontSize: 11, color: "#9ca3af" }}>
            Total: <span style={{ fontWeight: 600, color: "#374151" }}>${(total / 1000).toFixed(0)}K</span>
          </p>
        </div>
        <button className="btn-p text-xs px-3.5 py-2"><Plus className="w-3.5 h-3.5" />Add Deal</button>
      </div>
      <div className="flex gap-3 overflow-x-auto noscroll pb-3">
        {STAGES.map((stage) => {
          const items = deals.filter((d) => d.stage === stage.key);
          const stageTotal = items.reduce((sum, d) => sum + Number(d.value), 0);
          const won = stage.key === "won";
          return (
            <div key={stage.key} style={{ minWidth: 155, flexShrink: 0 }}>
              <div className="flex items-center gap-1.5 mb-2.5">
                <div className="w-2 h-2 rounded-full" style={{ background: stage.dot }} />
                <p style={{ fontSize: 9.5, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".05em" }}>{stage.label}</p>
                <span className="ml-auto" style={{ fontSize: 9, color: won ? "#16a34a" : "#9ca3af", fontWeight: won ? 600 : 400 }}>${(stageTotal / 1000).toFixed(0)}K</span>
              </div>
              {items.map((item) => {
                const hot = item.probability >= 50 && item.stage !== "won" && item.stage !== "lost";
                return (
                  <div key={item.id} className={`pkc ${won ? "border-green-100" : ""}`} style={hot ? { borderColor: "rgba(255,26,151,0.18)" } : {}}>
                    <p style={{ fontWeight: 600, fontSize: 11, color: "#1f2937" }}>{item.name}</p>
                    <p style={{ color: hot ? "#b80055" : won ? "#16a34a" : "#9ca3af", fontSize: 10, marginTop: 2, fontWeight: hot || won ? 600 : 400 }}>
                      ${Number(item.value).toLocaleString()} {item.probability > 0 ? `· ${item.probability}%` : ""}
                    </p>
                  </div>
                );
              })}
              {items.length === 0 && (
                <div className="pkc text-center text-gray-400 text-xs py-2">No deals</div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
