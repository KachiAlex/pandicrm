"use client";

import { useState, useEffect } from "react";
import { api, type Task } from "../../../../lib/api";

const WORKSPACE_ID = "ws-demo";

// Mock team members data
const teamMembers = [
  { id: "current-user", name: "You", avatar: null, role: "Team Lead" },
  { id: "user-sales", name: "Sarah Johnson", avatar: null, role: "Sales Manager" },
  { id: "user-marketing", name: "Mike Chen", avatar: null, role: "Marketing Specialist" },
  { id: "user-dev", name: "Alex Rivera", avatar: null, role: "Developer" },
  { id: "user-cs", name: "Emma Wilson", avatar: null, role: "Customer Success" },
  { id: "user-ops", name: "James Brown", avatar: null, role: "Operations Manager" },
];

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200",
};

const statusColors = {
  pending: "bg-gray-100 text-gray-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  archived: "bg-gray-100 text-gray-600",
};

const categoryColors = {
  sales: "bg-blue-50 text-blue-700",
  marketing: "bg-purple-50 text-purple-700",
  development: "bg-indigo-50 text-indigo-700",
  operations: "bg-gray-50 text-gray-700",
  customer_service: "bg-cyan-50 text-cyan-700",
  admin: "bg-amber-50 text-amber-700",
  personal: "bg-pink-50 text-pink-700",
  other: "bg-slate-50 text-slate-700",
};

export default function TeamTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"list" | "board">("list");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.getTasks(WORKSPACE_ID);
      if (response.error) {
        setError(response.error);
      } else if (response.tasks) {
        setTasks(response.tasks);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const memberMatch = selectedMember === "all" || task.assigneeId?.value === selectedMember;
      const categoryMatch = selectedCategory === "all" || task.category === selectedCategory;
      return memberMatch && categoryMatch;
    });
  };

  const getTasksByMember = (memberId: string) => {
    return tasks.filter(task => task.assigneeId?.value === memberId);
  };

  const getMemberStats = (memberId: string) => {
    const memberTasks = getTasksByMember(memberId);
    return {
      total: memberTasks.length,
      pending: memberTasks.filter(t => t.status === "pending").length,
      inProgress: memberTasks.filter(t => t.status === "in_progress").length,
      completed: memberTasks.filter(t => t.status === "completed").length,
      overdue: memberTasks.filter(t => 
        t.dueAt && 
        new Date(t.dueAt) < new Date() && 
        t.status !== "completed"
      ).length,
    };
  };

  const assignTask = async (taskId: string, assigneeId: string) => {
    try {
      const response = await api.updateTask(taskId, {
        assigneeId: { value: assigneeId },
      });
      
      if (response.error) {
        setError(response.error);
      } else {
        fetchTasks(); // Refresh tasks
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign task");
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const response = await api.completeTask(taskId, {
        completedBy: { value: "current-user" },
        actualHours: 1,
      });
      
      if (response.error) {
        setError(response.error);
      } else {
        fetchTasks(); // Refresh tasks
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to complete task");
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-base-900">Team Tasks</h1>
            <p className="mt-2 text-base text-base-600">
              Collaborate with your team and track task assignments.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-8">
          <div className="text-center text-base-600">Loading team tasks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-base-900">Team Tasks</h1>
            <p className="mt-2 text-base text-base-600">
              Collaborate with your team and track task assignments.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-8">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-base-900">Team Tasks</h1>
          <p className="mt-2 text-base text-base-600">
            Collaborate with your team and track task assignments.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-border/60 bg-white/50">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 text-sm font-medium transition ${
                viewMode === "list"
                  ? "bg-primary text-white"
                  : "text-base-600 hover:text-base-900"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`px-4 py-2 text-sm font-medium transition ${
                viewMode === "board"
                  ? "bg-primary text-white"
                  : "text-base-600 hover:text-base-900"
              }`}
            >
              Board View
            </button>
          </div>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="rounded-lg border border-border/60 bg-white/50 px-4 py-2 text-sm font-medium text-base-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Team Members</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-border/60 bg-white/50 px-4 py-2 text-sm font-medium text-base-900 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            <option value="sales">Sales</option>
            <option value="marketing">Marketing</option>
            <option value="development">Development</option>
            <option value="operations">Operations</option>
            <option value="customer_service">Customer Service</option>
            <option value="admin">Admin</option>
            <option value="personal">Personal</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Team Overview Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">
            Total Tasks
          </p>
          <p className="mt-2 text-3xl font-semibold text-base-900">{filteredTasks.length}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">
            Assigned Tasks
          </p>
          <p className="mt-2 text-3xl font-semibold text-base-900">
            {filteredTasks.filter(t => t.assigneeId).length}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">
            Unassigned
          </p>
          <p className="mt-2 text-3xl font-semibold text-base-900">
            {filteredTasks.filter(t => !t.assigneeId).length}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">
            Overdue
          </p>
          <p className="mt-2 text-3xl font-semibold text-red-600">
            {filteredTasks.filter(t => 
              t.dueAt && 
              new Date(t.dueAt) < new Date() && 
              t.status !== "completed"
            ).length}
          </p>
        </div>
      </div>

      {viewMode === "board" ? (
        /* Board View - Team Members as Columns */
        <div className="grid gap-6 lg:grid-cols-3">
          {teamMembers.map(member => {
            const memberTasks = getTasksByMember(member.id).filter(task => 
              selectedCategory === "all" || task.category === selectedCategory
            );
            const stats = getMemberStats(member.id);
            
            return (
              <div key={member.id} className="flex flex-col">
                <div className="rounded-t-xl bg-gradient-to-r from-primary to-secondary p-4 text-white">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm opacity-90">{member.role}</p>
                  <div className="mt-2 flex gap-4 text-xs">
                    <span>{stats.total} total</span>
                    <span>{stats.completed} done</span>
                    <span>{stats.overdue} overdue</span>
                  </div>
                </div>
                
                <div className="flex-1 rounded-b-xl border border-border/60 bg-white/50 p-4 min-h-[400px]">
                  <div className="space-y-3">
                    {memberTasks.map(task => (
                      <div
                        key={task.id.value}
                        className="rounded-lg border border-border/40 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-base-900 text-sm">{task.title}</h4>
                          <span className={`rounded px-2 py-1 text-xs font-medium ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-base-600 mb-2 line-clamp-2">{task.description}</p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className={`rounded px-2 py-1 text-xs font-medium ${statusColors[task.status]}`}>
                            {task.status.replace("-", " ")}
                          </span>
                          <span className={`rounded px-2 py-1 text-xs font-medium ${categoryColors[task.category]}`}>
                            {task.category.replace("_", " ")}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between text-xs text-base-600">
                          <span>Due: {task.dueAt ? new Date(task.dueAt).toLocaleDateString() : "No due date"}</span>
                          {task.estimatedHours && <span>{task.estimatedHours}h</span>}
                        </div>
                        
                        {task.status !== "completed" && (
                          <div className="mt-3 pt-3 border-t border-border/20">
                            <button
                              onClick={() => completeTask(task.id.value)}
                              className="w-full rounded bg-primary px-3 py-1 text-xs font-medium text-white transition hover:bg-primary/90"
                            >
                              Mark Complete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {memberTasks.length === 0 && (
                      <div className="text-center py-8 text-base-600">
                        No tasks assigned
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-6">
          <h3 className="font-display text-lg text-base-900 mb-4">
            {selectedMember === "all" ? "All Team Tasks" : 
             teamMembers.find(m => m.id === selectedMember)?.name + "'s Tasks"}
          </h3>
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <div
                key={task.id.value}
                className="flex items-start gap-4 p-4 rounded-lg border border-border/40 bg-white/50 hover:bg-white transition"
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  checked={task.status === "completed"}
                  onChange={() => task.status !== "completed" && completeTask(task.id.value)}
                  disabled={task.status === "completed"}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base-900">{task.title}</span>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[task.status]}`}>
                      {task.status.replace("-", " ")}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${categoryColors[task.category]}`}>
                      {task.category.replace("_", " ")}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-base-600">
                    {task.description}
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm text-base-600">
                    <span>Assigned to: {task.assigneeId ? 
                      teamMembers.find(m => m.id === task.assigneeId?.value)?.name || "Unknown" : 
                      "Unassigned"}</span>
                    <span>Due: {task.dueAt ? new Date(task.dueAt).toLocaleDateString() : "No due date"}</span>
                    {task.estimatedHours && <span>Est: {task.estimatedHours}h</span>}
                  </div>
                  {task.tags && task.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {task.tags.map(tag => (
                        <span key={tag} className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {!task.assigneeId && (
                  <select
                    onChange={(e) => e.target.value && assignTask(task.id.value, e.target.value)}
                    className="rounded-lg border border-border/60 bg-white/50 px-3 py-2 text-sm font-medium text-base-900 focus:outline-none focus:ring-2 focus:ring-primary"
                    defaultValue=""
                  >
                    <option value="" disabled>Assign to...</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                )}
              </div>
            ))}
            {filteredTasks.length === 0 && (
              <div className="text-center py-8 text-base-600">
                No tasks found for the selected filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Team Performance Summary */}
      <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-6">
        <h3 className="font-display text-lg text-base-900 mb-4">Team Performance</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map(member => {
            const stats = getMemberStats(member.id);
            const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
            
            return (
              <div key={member.id} className="rounded-lg border border-border/40 bg-white/50 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h4 className="font-medium text-base-900">{member.name}</h4>
                    <p className="text-sm text-base-600">{member.role}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-base-600">Completion Rate</span>
                    <span className="font-medium text-base-900">{completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-base-600">
                    <div>{stats.pending} pending</div>
                    <div>{stats.inProgress} in progress</div>
                    <div>{stats.completed} completed</div>
                    <div>{stats.overdue} overdue</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
