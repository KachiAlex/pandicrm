"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { api, Deal } from "@/lib/api";

export default function ReportsPanel({ workspaceId }: { workspaceId: string }) {
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

  const pipeline = deals.reduce((sum, d) => sum + Number(d.value), 0);
  const won = deals.filter((d) => d.stage === "won");
  const wonValue = won.reduce((sum, d) => sum + Number(d.value), 0);
  const winRate = deals.length > 0 ? Math.round((won.length / deals.length) * 100) : 0;

  const stats = [
    { v: `$${(pipeline / 1000).toFixed(0)}K`, l: "Pipeline", c: "+18%" },
    { v: `${winRate}%`, l: "Win Rate", c: "+4pts" },
    { v: "18d", l: "Avg Cycle", c: "-2d", down: true },
    { v: "94%", l: "Retention", c: "+1pt" },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Reports</h2>
        <select className="bg-white border border-gray-200 rounded-lg text-gray-600 focus:outline-none" style={{ fontSize: 12, padding: "5px 10px" }}>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.l} className="surf p-4 text-center">
            <p style={{ fontSize: 22, fontWeight: 900, color: "#0d0d12" }}>{s.v}</p>
            <p style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 2 }}>{s.l}</p>
            <span className={`${s.down ? "sdn" : "sup"} inline-block mt-1.5`}>{s.c}</span>
          </div>
        ))}
      </div>
      <div className="surf p-5">
        <p style={{ fontSize: 9.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 14 }}>Revenue Closed &mdash; Monthly</p>
        <div className="flex items-end gap-2" style={{ height: 110 }}>
          {[40,55,68,92,72,80].map((h,i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div className="w-full rounded-t-lg" style={{ height: `${h}%`, background: i===3 ? "linear-gradient(180deg,#ff1a97,#b80055)" : ["#ffd6ec","#ffadd9","#ff80c4","","#ffadd9","#ff80c4"][i], boxShadow: i===3 ? "0 4px 14px rgba(184,0,85,0.28)" : "none" }} />
              <p style={{ fontSize: 8.5, color: i===3 ? "#b80055" : "#9ca3af", fontWeight: i===3 ? 600 : 400 }}>{["Apr","May","Jun","Jul","Aug","Sep"][i]}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
