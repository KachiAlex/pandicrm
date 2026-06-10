"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Mic, CheckSquare, GitBranch, BarChart2, Clock, Search, Bell, HelpCircle,
  ChevronDown, Settings, Plug, Users, Tag, FileText,
  Loader2
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import NotesPanel from "@/components/dashboard/NotesPanel";
import TasksPanel from "@/components/dashboard/TasksPanel";
import PipelinePanel from "@/components/dashboard/PipelinePanel";
import ReportsPanel from "@/components/dashboard/ReportsPanel";
import TimelinePanel from "@/components/dashboard/TimelinePanel";
import ListPanel from "@/components/dashboard/ListPanel";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("notes");
  const { workspace, loading: loadingWorkspace } = useWorkspace();
  const { data: session } = useSession();

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
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl cursor-pointer text-left"
            style={{ transition: "background .14s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#ff66b3,#b80055)" }}>
              <span style={{ fontSize: 9.5, fontWeight: 700, color: "#fff" }}>
                {(session?.user?.name || session?.user?.email || "U").slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.8)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {session?.user?.name || session?.user?.email || "User"}
              </p>
              <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.28)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {session?.user?.email || ""}
              </p>
            </div>
            <ChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(255,255,255,0.22)" }} />
          </button>
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

          {loadingWorkspace ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-pk-600" />
            </div>
          ) : !workspace ? (
            <div className="surf p-8 text-center">
              <h2 className="font-bold text-xl text-gray-900 mb-2">No workspace found</h2>
              <p className="text-gray-500 text-sm">Create a workspace to get started.</p>
            </div>
          ) : (
            <>
              {activeTab === "notes" && <NotesPanel workspaceId={workspace.id} />}
              {activeTab === "tasks" && <TasksPanel workspaceId={workspace.id} />}
              {activeTab === "pipeline" && <PipelinePanel workspaceId={workspace.id} />}
              {activeTab === "reports" && <ReportsPanel workspaceId={workspace.id} />}
              {activeTab === "timeline" && <TimelinePanel workspaceId={workspace.id} />}
              {activeTab === "accounts" && <ListPanel workspaceId={workspace.id} type="accounts" />}
              {activeTab === "contacts" && <ListPanel workspaceId={workspace.id} type="contacts" />}
              {activeTab === "deals" && <ListPanel workspaceId={workspace.id} type="deals" />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

