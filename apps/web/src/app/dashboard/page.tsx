"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Mic, CheckSquare, GitBranch, BarChart2, Clock, Search, Bell, HelpCircle,
  Plus, Sparkles, ChevronDown, Settings, Plug, Users, Tag, FileText,
  Home
} from "lucide-react";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("notes");

  const tabs = [
    { id: "notes", label: "AI Notes", icon: <Mic className="w-3.5 h-3.5" /> },
    { id: "tasks", label: "Tasks", icon: <CheckSquare className="w-3.5 h-3.5" /> },
    { id: "pipeline", label: "Pipeline", icon: <GitBranch className="w-3.5 h-3.5" /> },
    { id: "reports", label: "Reports", icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { id: "timeline", label: "Timeline", icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  const sidebarItems = [
    { label: "AI Notes", icon: <Mic className="w-3.5 h-3.5" />, tab: "notes" },
    { label: "Tasks", icon: <CheckSquare className="w-3.5 h-3.5" />, tab: "tasks" },
    { label: "Pipeline", icon: <GitBranch className="w-3.5 h-3.5" />, tab: "pipeline" },
    { label: "Reports", icon: <BarChart2 className="w-3.5 h-3.5" />, tab: "reports" },
    { label: "Timeline", icon: <Clock className="w-3.5 h-3.5" />, tab: "timeline" },
    { label: "Accounts", icon: <Users className="w-3.5 h-3.5" />, tab: "accounts" },
    { label: "Contacts", icon: <Tag className="w-3.5 h-3.5" />, tab: "contacts" },
    { label: "Deals", icon: <FileText className="w-3.5 h-3.5" />, tab: "deals" },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0d0d12" }}>
      {/* SIDEBAR */}
      <aside className="dash-sb w-56 flex-shrink-0 hidden md:flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3.5">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#ff1a97,#b80055)" }}>
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 12.5C7 12.5 1.5 8.833 1.5 5A3.5 3.5 0 0 1 7 2.917 3.5 3.5 0 0 1 12.5 5C12.5 8.833 7 12.5 7 12.5Z" fill="white" /></svg>
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>pandicrm</span>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto noscroll">
          <p className="sb-label">Workspace</p>
          {sidebarItems.slice(0, 5).map((item) => (
            <div
              key={item.tab}
              className={`dni ${activeTab === item.tab ? "on" : ""}`}
              onClick={() => setActiveTab(item.tab)}
            >
              {item.icon}<span>{item.label}</span>
            </div>
          ))}
          <p className="sb-label" style={{ marginTop: 14 }}>CRM</p>
          {sidebarItems.slice(5).map((item) => (
            <div key={item.tab} className={`dni ${activeTab === item.tab ? "on" : ""}`} onClick={() => setActiveTab(item.tab)}>
              {item.icon}<span>{item.label}</span>
            </div>
          ))}
          <p className="sb-label" style={{ marginTop: 14 }}>Settings</p>
          <div className="dni"><Settings className="w-3.5 h-3.5 flex-shrink-0" /><span>Settings</span></div>
          <div className="dni"><Plug className="w-3.5 h-3.5 flex-shrink-0" /><span>Integrations</span></div>
        </nav>

        <div className="px-3 pb-3 pt-2 border-t" style={{ borderColor: "rgba(255,26,151,0.1)" }}>
          <div className="mb-2 px-3 py-2.5 rounded-xl" style={{ background: "linear-gradient(135deg,rgba(255,26,151,0.12),rgba(184,0,85,0.07))", border: "1px solid rgba(255,26,151,0.15)" }}>
            <p style={{ fontSize: 10.5, fontWeight: 600, color: "#ff80c4", marginBottom: 2 }}>Early Access</p>
            <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", lineHeight: 1.4 }}>Lock in founding member pricing when we launch.</p>
          </div>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl cursor-pointer" style={{ transition: "background .14s" }} onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")} onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#ff66b3,#b80055)" }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: "#fff" }}>SC</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Sarah Chen</p>
              <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>sarah@acmecorp.com</p>
            </div>
            <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.22)" }} />
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: "#f5f5f7" }}>
        {/* Top bar */}
        <div className="flex items-center px-5 gap-3 flex-shrink-0 bg-white border-b border-gray-100" style={{ height: 52 }}>
          <div className="flex-1 flex items-center gap-3">
            <h1 style={{ fontSize: 14, fontWeight: 700, color: "#0d0d12", whiteSpace: "nowrap" }}>
              {tabs.find((t) => t.id === activeTab)?.label || activeTab}
            </h1>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-200" style={{ maxWidth: 220, flex: 1 }}>
              <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <input type="text" placeholder="Search anything..." style={{ background: "transparent", fontSize: 12, color: "#374151", outline: "none", flex: 1 }} />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors" aria-label="Notifications">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "#ff1a97" }} />
            </button>
            <button className="p-2 rounded-xl hover:bg-gray-50 transition-colors" aria-label="Help">
              <HelpCircle className="w-4 h-4 text-gray-500" />
            </button>
            <Link href="/" className="text-xs font-medium text-gray-500 px-3 py-1.5 rounded-lg border border-gray-200 ml-1 hover:border-pk-500 hover:text-pk-700 transition-colors">&larr; Back to site</Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="flex items-center gap-1.5 mb-5 overflow-x-auto noscroll">
            {tabs.map((t) => (
              <button key={t.id} className={`dtab ${activeTab === t.id ? "on" : ""}`} onClick={() => setActiveTab(t.id)}>
                {t.icon}<span className="ml-1">{t.label}</span>
              </button>
            ))}
          </div>

          {activeTab === "notes" && <NotesPanel />}
          {activeTab === "tasks" && <TasksPanel />}
          {activeTab === "pipeline" && <PipelinePanel />}
          {activeTab === "reports" && <ReportsPanel />}
          {activeTab === "timeline" && <TimelinePanel />}
          {activeTab === "accounts" && <PlaceholderPanel title="Accounts" />}
          {activeTab === "contacts" && <PlaceholderPanel title="Contacts" />}
          {activeTab === "deals" && <PlaceholderPanel title="Deals" />}
        </div>
      </div>
    </div>
  );
}

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="surf p-8 text-center">
      <h2 className="font-bold text-xl text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 text-sm">This section is coming soon. Switch to another tab to explore the dashboard.</p>
    </div>
  );
}

function NotesPanel() {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[{v:"12",l:"Notes this week"},{v:"38",l:"Actions extracted"},{v:"87%",l:"Avg sentiment",pink:true},{v:"4.2h",l:"Processed"}].map((s) => (
          <div key={s.l} className="surf p-4 text-center">
            <p style={{ fontSize: 22, fontWeight: 900, color: s.pink ? "#b80055" : "#0d0d12" }}>{s.v}</p>
            <p style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 2 }}>{s.l}</p>
          </div>
        ))}
      </div>
      <div className="surf p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#ff1a97,#b80055)" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p style={{ fontSize: 13.5, fontWeight: 700, color: "#1f2937" }}>Acme Corp &mdash; Expansion Call</p>
            <p style={{ fontSize: 11, color: "#9ca3af" }}>Jun 9, 2026 &middot; 45 min &middot; Sarah Chen (VP Sales)</p>
          </div>
          <span className="ml-auto" style={{ fontSize: 10, fontWeight: 700, color: "#b80055", background: "#fff0f7", padding: "5px 11px", borderRadius: 999, border: "1px solid rgba(184,0,85,0.1)" }}>AI Note</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p style={{ fontSize: 9.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>Summary</p>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.65 }}>Acme Corp expanding 10&rarr;25 seats. Budget confirmed $24K/yr. Key concern: onboarding timeline needs 2 weeks. Sarah will loop in CTO. Decision by Friday June 14.</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <p style={{ fontSize: 9.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>Action Items</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2.5 bg-white rounded-xl p-2.5 border border-gray-100"><div className="w-4 h-4 rounded flex-shrink-0 mt-0.5" style={{ border: "2px solid #ff1a97", background: "#fff0f7" }} /><p style={{ fontSize: 11.5, fontWeight: 500, color: "#1f2937" }}>Send onboarding deck &mdash; due Thursday</p></div>
              <div className="flex items-start gap-2.5 bg-white rounded-xl p-2.5 border border-gray-100"><div className="w-4 h-4 rounded flex-shrink-0 mt-0.5" style={{ border: "2px solid #ff1a97", background: "#fff0f7" }} /><p style={{ fontSize: 11.5, fontWeight: 500, color: "#1f2937" }}>Schedule technical review with CTO</p></div>
              <div className="flex items-start gap-2.5 bg-white rounded-xl p-2.5 border border-gray-100"><div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ border: "2px solid #22c55e", background: "#f0fdf4" }}><CheckSquare className="w-2.5 h-2.5" style={{ color: "#22c55e" }} /></div><p style={{ fontSize: 11.5, color: "#9ca3af", textDecoration: "line-through" }}>Send NDA for signature</p></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function TasksPanel() {
  const cols = [
    { label: "To Do", dot: "#9ca3af", bg: "#e5e7eb", count: 4, items: [{t:"Follow up — Apex Media",d:"Due Friday"},{t:"Renewal call — Horizon",d:"Due Monday"},{t:"Q4 pipeline review",d:"Due next week"}] },
    { label: "In Progress", dot: "#ff1a97", bg: "#fff0f7", count: 2, items: [{t:"Proposal — Acme Corp",d:"Due Today",hot:true},{t:"Onboarding deck — TechCorp",d:"Due Tomorrow",hot:true}] },
    { label: "Done", dot: "#4ade80", bg: "#f0fdf4", count: 3, items: [{t:"Onboarding — NovaSys",d:"Completed",done:true},{t:"Contract — Meridian",d:"Completed",done:true}] },
  ];
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Task Board</h2>
        <button className="btn-p text-xs px-3.5 py-2"><Plus className="w-3.5 h-3.5" />New Task</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cols.map((col) => (
          <div key={col.label} className="rounded-2xl p-4" style={{ background: "rgba(243,244,246,0.7)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: col.dot }} />
              <p style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".05em" }}>{col.label}</p>
              <span className="ml-auto" style={{ fontSize: 9.5, background: col.bg, color: col.dot, padding: "1px 6px", borderRadius: 999 }}>{col.count}</span>
            </div>
            <div className="flex flex-col gap-2">
              {col.items.map((item: any) => (
                <div key={item.t} className="surf p-3" style={item.hot ? { borderLeft: "3px solid #ff1a97" } : {}}>
                  <p style={{ fontSize: 11.5, fontWeight: item.done ? 400 : 600, color: item.done ? "#9ca3af" : "#1f2937", textDecoration: item.done ? "line-through" : "none", marginBottom: 3 }}>{item.t}</p>
                  <p style={{ fontSize: 10, color: item.done ? "#16a34a" : item.hot ? "#b80055" : "#9ca3af", fontWeight: item.hot ? 600 : 400 }}>{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function PipelinePanel() {
  const stages = [
    { label: "Lead", dot: "#9ca3af", total: "$32K", items: [{n:"Apex Media",v:"$12,000 · 3d"},{n:"DataFlow Inc",v:"$8,500 · 1d"},{n:"Prism Labs",v:"$11,500 · 5d"}] },
    { label: "Qualify", dot: "#ffadd9", total: "$61K", items: [{n:"Acme Corp",v:"$24,000 · 7d"},{n:"TechCorp",v:"$37,000 · 2d"}] },
    { label: "Propose", dot: "#f59e0b", total: "$89K", items: [{n:"Meridian Inc",v:"$52,000 · HOT",hot:true},{n:"Horizon SaaS",v:"$37,000 · 4d"}] },
    { label: "Negotiate", dot: "#a78bfa", total: "$66K", items: [{n:"NovaSys",v:"$18,000 · 12d"},{n:"CloudBase",v:"$48,000 · 8d"}] },
    { label: "Won", dot: "#4ade80", total: "$44K", won: true, items: [{n:"Stellar Co",v:"$22,000 ✓"},{n:"Vortex Labs",v:"$22,000 ✓"}] },
  ];
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div><h2 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Sales Pipeline</h2><p style={{ fontSize: 11, color: "#9ca3af" }}>Total: <span style={{ fontWeight: 600, color: "#374151" }}>$248,500</span></p></div>
        <button className="btn-p text-xs px-3.5 py-2"><Plus className="w-3.5 h-3.5" />Add Deal</button>
      </div>
      <div className="flex gap-3 overflow-x-auto noscroll pb-3">
        {stages.map((stage) => (
          <div key={stage.label} style={{ minWidth: 155, flexShrink: 0 }}>
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="w-2 h-2 rounded-full" style={{ background: stage.dot }} />
              <p style={{ fontSize: 9.5, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".05em" }}>{stage.label}</p>
              <span className="ml-auto" style={{ fontSize: 9, color: stage.won ? "#16a34a" : "#9ca3af", fontWeight: stage.won ? 600 : 400 }}>{stage.total}</span>
            </div>
            {stage.items.map((item: any) => (
              <div key={item.n} className={`pkc ${stage.won ? "border-green-100" : ""}`} style={item.hot ? { borderColor: "rgba(255,26,151,0.18)" } : {}}>
                <p style={{ fontWeight: 600, fontSize: 11, color: "#1f2937" }}>{item.n}</p>
                <p style={{ color: item.hot ? "#b80055" : stage.won ? "#16a34a" : "#9ca3af", fontSize: 10, marginTop: 2, fontWeight: item.hot || stage.won ? 600 : 400 }}>{item.v}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

function ReportsPanel() {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Reports</h2>
        <select className="bg-white border border-gray-200 rounded-lg text-gray-600 focus:outline-none" style={{ fontSize: 12, padding: "5px 10px" }}><option>Last 30 days</option><option>Last 90 days</option></select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[{v:"$248K",l:"Pipeline",c:"+18%"},{v:"68%",l:"Win Rate",c:"+4pts"},{v:"18d",l:"Avg Cycle",c:"-2d",down:true},{v:"94%",l:"Retention",c:"+1pt"}].map((s) => (
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

function TimelinePanel() {
  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Customer Timeline</h2>
        <span style={{ fontSize: 11, color: "#9ca3af" }}>Acme Corp &middot; Sarah Chen</span>
      </div>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px" style={{ background: "linear-gradient(180deg,#ff1a97 0%,rgba(255,26,151,0.08) 100%)" }} />
        <div className="flex flex-col gap-4 pl-10">
          {[
            { title: "Discovery Call", date: "Jun 2 · 11am", desc: "45-min intro. Identified pain points: manual reporting, no pipeline visibility.", badge: "AI Note Generated", badgeBg: "#fff0f7", badgeColor: "#b80055", badgeBorder: "rgba(184,0,85,0.12)" },
            { title: "Demo Sent", date: "Jun 5 · 2:30pm", desc: "Shared personalised demo video. Sarah forwarded to CTO." },
            { title: "Proposal Sent", date: "Jun 14 · 9am", desc: "$24K annual proposal for 25 seats. Awaiting review.", badge: "Awaiting Response", badgeBg: "#fffbeb", badgeColor: "#d97706", badgeBorder: "rgba(217,119,6,0.14)", dot: "#f59e0b", dotGlow: "rgba(245,158,11,0.14)" },
            { dashed: true, desc: "Next: Decision call — Friday" },
          ].map((ev, i) => (
            <div key={i} className="relative" style={ev.dashed ? { opacity: 0.45 } : {}}>
              {ev.dashed ? (
                <div className="w-4 h-4 rounded-full absolute -left-6 top-1.5" style={{ border: "2px dashed #d1d5db" }} />
              ) : (
                <div className="tld absolute -left-6 top-1.5" style={ev.dot ? { background: ev.dot, boxShadow: `0 0 0 3px ${ev.dotGlow}` } : {}} />
              )}
              <div className="surf p-4" style={ev.dashed ? { borderStyle: "dashed" } : {}}>
                {ev.title && (
                  <div className="flex items-center justify-between mb-1.5">
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>{ev.title}</p>
                    <span style={{ fontSize: 10, color: "#9ca3af" }}>{ev.date}</span>
                  </div>
                )}
                {ev.desc && <p style={{ fontSize: 12, color: "#6b7280", marginBottom: ev.badge ? 8 : 0 }}>{ev.desc}</p>}
                {ev.badge && <span style={{ fontSize: 10, color: ev.badgeColor, background: ev.badgeBg, padding: "3px 10px", borderRadius: 999, border: `1px solid ${ev.badgeBorder}` }}>{ev.badge}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
