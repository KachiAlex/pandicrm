"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { api, Deal, Task, Account, Contact, Note } from "@/lib/api";

export default function ReportsPanel({ workspaceId }: { workspaceId: string }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    Promise.all([
      api.deals.list(workspaceId),
      api.tasks.list(workspaceId),
      api.accounts.list(workspaceId),
      api.contacts.list(workspaceId),
      api.notes.list(workspaceId),
    ]).then(([dealsData, tasksData, accountsData, contactsData, notesData]) => {
      setDeals(dealsData);
      setTasks(tasksData);
      setAccounts(accountsData);
      setContacts(contactsData);
      setNotes(notesData);
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

  // KPI calculations
  const pipeline = deals.reduce((sum, d) => sum + Number(d.value), 0);
  const won = deals.filter((d) => d.stage === "won");
  const wonValue = won.reduce((sum, d) => sum + Number(d.value), 0);
  const winRate = deals.length > 0 ? Math.round((won.length / deals.length) * 100) : 0;
  const tasksDone = tasks.filter((t) => t.status === "done").length;
  const tasksCompletion = tasks.length > 0 ? Math.round((tasksDone / tasks.length) * 100) : 0;

  const stats = [
    { v: `$${(pipeline / 1000).toFixed(0)}K`, l: "Pipeline", sub: `${deals.length} deals` },
    { v: `${winRate}%`, l: "Win Rate", sub: `${won.length} won · $${(wonValue / 1000).toFixed(0)}K` },
    { v: `${tasksCompletion}%`, l: "Task Completion", sub: `${tasksDone} / ${tasks.length} done` },
    { v: String(contacts.length), l: "Contacts", sub: `${accounts.length} accounts` },
  ];

  // Stage chart data
  const stageOrder = ["lead", "qualify", "propose", "negotiate", "won", "lost"];
  const stageLabels: Record<string, string> = { lead: "Lead", qualify: "Qualify", propose: "Propose", negotiate: "Negotiate", won: "Won", lost: "Lost" };
  const stageColors: Record<string, string> = { lead: "#9ca3af", qualify: "#ffadd9", propose: "#f59e0b", negotiate: "#a78bfa", won: "#4ade80", lost: "#ef4444" };
  const stageCounts = stageOrder.map((s) => deals.filter((d) => d.stage === s).length);
  const maxStageCount = Math.max(1, ...stageCounts);

  // Monthly revenue by closeDate for won deals
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyRevenue = new Array(12).fill(0);
  won.forEach((d) => {
    if (d.closeDate) {
      const m = new Date(d.closeDate).getMonth();
      monthlyRevenue[m] += Number(d.value);
    }
  });
  const maxMonthly = Math.max(1, ...monthlyRevenue);

  // Task status chart
  const taskStatusOrder = ["todo", "in_progress", "done"];
  const taskStatusLabels: Record<string, string> = { todo: "To Do", in_progress: "In Progress", done: "Done" };
  const taskStatusColors: Record<string, string> = { todo: "#9ca3af", in_progress: "#ff1a97", done: "#4ade80" };
  const taskStatusCounts = taskStatusOrder.map((s) => tasks.filter((t) => t.status === s).length);
  const maxTaskCount = Math.max(1, ...taskStatusCounts);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Reports</h2>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>Live data</span>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.l} className="surf p-4 text-center">
            <p style={{ fontSize: 22, fontWeight: 900, color: "#0d0d12" }}>{s.v}</p>
            <p style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 2 }}>{s.l}</p>
            <p style={{ fontSize: 9.5, color: "#6b7280", marginTop: 4 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="surf p-5">
          <p style={{ fontSize: 9.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 14 }}>Deals by Stage</p>
          <div className="flex flex-col gap-3">
            {stageOrder.map((s, i) => {
              const count = stageCounts[i];
              const pct = Math.round((count / maxStageCount) * 100);
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-16 text-right flex-shrink-0">{stageLabels[s]}</span>
                  <div className="flex-1 h-5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: stageColors[s], minWidth: count > 0 ? 4 : 0 }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-6 text-right flex-shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="surf p-5">
          <p style={{ fontSize: 9.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 14 }}>Tasks by Status</p>
          <div className="flex flex-col gap-3">
            {taskStatusOrder.map((s, i) => {
              const count = taskStatusCounts[i];
              const pct = Math.round((count / maxTaskCount) * 100);
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 text-right flex-shrink-0">{taskStatusLabels[s]}</span>
                  <div className="flex-1 h-5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: taskStatusColors[s], minWidth: count > 0 ? 4 : 0 }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-6 text-right flex-shrink-0">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="surf p-5 md:col-span-2">
          <p style={{ fontSize: 9.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 14 }}>Revenue Closed by Month</p>
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {months.map((m, i) => {
              const v = monthlyRevenue[i];
              const pct = Math.round((v / maxMonthly) * 100);
              const isMax = v === maxMonthly && v > 0;
              return (
                <div key={m} className="flex flex-col items-center gap-1 flex-1">
                  <div className="w-full rounded-t-lg" style={{ height: `${Math.max(pct, 4)}%`, background: isMax ? "linear-gradient(180deg,#ff1a97,#b80055)" : "#ffadd9", boxShadow: isMax ? "0 4px 14px rgba(184,0,85,0.28)" : "none", transition: "height .3s ease" }} />
                  <p style={{ fontSize: 8.5, color: isMax ? "#b80055" : "#9ca3af", fontWeight: isMax ? 600 : 400 }}>{m}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
