"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import {
  Mic, CheckSquare, GitBranch, BarChart2, Clock, Search, Bell, HelpCircle,
  ChevronDown, Settings, Plug, Users, Tag, FileText,
  Loader2, Check, X, Mail, FileText as FileIcon, CheckCircle, DollarSign,
  Menu
} from "lucide-react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { api, Notification } from "@/lib/api";
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!workspace?.id) return;
    api.notifications.list(workspace.id).then((data) => setNotifications(data)).catch(() => {});
  }, [workspace?.id]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    await api.notifications.markRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllRead = async () => {
    if (!workspace?.id) return;
    await api.notifications.markAllRead(workspace.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

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
      {/* Mobile sidebar overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowMobileSidebar(false)} />
      )}
      {/* SIDEBAR */}
      <aside className={`dash-sb w-56 flex-shrink-0 flex-col h-full fixed md:relative z-50 md:z-auto transition-transform duration-200 ${showMobileSidebar ? "flex translate-x-0" : "hidden md:flex -translate-x-full md:translate-x-0"}`}>
        <div className="flex items-center justify-between gap-2 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#ff1a97,#b80055)" }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 12.5C7 12.5 1.5 8.833 1.5 5A3.5 3.5 0 0 1 7 2.917 3.5 3.5 0 0 1 12.5 5C12.5 8.833 7 12.5 7 12.5Z" fill="white" /></svg>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>pandicrm</span>
          </div>
          <button className="md:hidden p-1 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setShowMobileSidebar(false)} aria-label="Close menu">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        <nav className="flex-1 px-3 overflow-y-auto noscroll">
          <p className="sb-label">Workspace</p>
          {sidebarItems.slice(0, 5).map((item) => (
            <div
              key={item.tab}
              className={`dni ${activeTab === item.tab ? "on" : ""}`}
              onClick={() => { setActiveTab(item.tab); setShowMobileSidebar(false); }}
            >
              {item.icon}<span>{item.label}</span>
            </div>
          ))}
          <p className="sb-label" style={{ marginTop: 14 }}>CRM</p>
          {sidebarItems.slice(5).map((item) => (
            <div key={item.tab} className={`dni ${activeTab === item.tab ? "on" : ""}`} onClick={() => { setActiveTab(item.tab); setShowMobileSidebar(false); }}>
              {item.icon}<span>{item.label}</span>
            </div>
          ))}
          <p className="sb-label" style={{ marginTop: 14 }}>Settings</p>
          <Link href="/settings" className="dni" onClick={() => setShowMobileSidebar(false)}><Settings className="w-3.5 h-3.5 flex-shrink-0" /><span>Settings</span></Link>
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
            <button className="md:hidden p-1.5 -ml-1 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setShowMobileSidebar(true)} aria-label="Open menu">
              <Menu className="w-4 h-4 text-gray-600" />
            </button>
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
            <div className="relative" ref={notifRef}>
              <button
                className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors"
                aria-label="Notifications"
                onClick={() => setShowNotifications((s) => !s)}
              >
                <Bell className="w-4 h-4 text-gray-500" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[14px] h-[14px] flex items-center justify-center rounded-full text-[9px] font-bold text-white px-1" style={{ background: "#ff1a97" }}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#1f2937" }}>Notifications</p>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-[10px] font-semibold text-pk-600 hover:text-pk-700 transition-colors">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-gray-400 text-xs">No notifications yet.</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${n.read ? "opacity-60" : ""}`}
                          style={{ borderBottom: "1px solid #f9fafb" }}
                          onClick={() => markRead(n.id)}
                        >
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: n.type === "deal_won" ? "#f0fdf4" : n.type === "deal_lost" ? "#fef2f2" : n.type === "task_completed" ? "#f0fdf4" : "#fff0f7" }}>
                            {n.type === "deal_won" ? <DollarSign className="w-3.5 h-3.5 text-green-600" /> :
                             n.type === "deal_lost" ? <DollarSign className="w-3.5 h-3.5 text-red-500" /> :
                             n.type === "task_completed" ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> :
                             n.type === "note_added" ? <FileIcon className="w-3.5 h-3.5 text-pink-600" /> :
                             <Mail className="w-3.5 h-3.5 text-pink-600" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontSize: 11.5, fontWeight: 600, color: "#1f2937" }}>{n.title}</p>
                            <p className="text-[10.5px] text-gray-500 truncate">{n.message}</p>
                            <p className="text-[9px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                          </div>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0 mt-1.5" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
            <div className="surf p-8 text-center max-w-md mx-auto">
              <h2 className="font-bold text-xl text-gray-900 mb-2">No workspace found</h2>
              <p className="text-gray-500 text-sm mb-6">Create a workspace to get started.</p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newWorkspaceName.trim()) return;
                  setCreatingWorkspace(true);
                  try {
                    const res = await fetch("/api/workspaces", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: newWorkspaceName.trim() }),
                    });
                    if (!res.ok) throw new Error("Failed to create workspace");
                    const data = await res.json();
                    window.location.reload();
                  } catch (err: any) {
                    alert(err.message || "Failed to create workspace");
                    setCreatingWorkspace(false);
                  }
                }}
                className="flex flex-col gap-3"
              >
                <input
                  type="text"
                  placeholder="Workspace name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pk-500 transition-colors"
                />
                <button type="submit" disabled={creatingWorkspace || !newWorkspaceName.trim()} className="btn-p text-sm px-4 py-2.5 flex items-center justify-center gap-2">
                  {creatingWorkspace ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create Workspace
                </button>
              </form>
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

