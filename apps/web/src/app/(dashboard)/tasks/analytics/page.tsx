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

const categoryColors = {
  sales: "bg-blue-500",
  marketing: "bg-purple-500",
  development: "bg-indigo-500",
  operations: "bg-gray-500",
  customer_service: "bg-cyan-500",
  admin: "bg-amber-500",
  personal: "bg-pink-500",
  other: "bg-slate-500",
};

const priorityColors = {
  urgent: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-green-500",
};

export default function TaskAnalyticsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "quarter">("month");

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [timeRange]);

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

  const fetchStats = async () => {
    try {
      const response = await api.getTaskStats(WORKSPACE_ID);
      if (response.error) {
        setError(response.error);
      } else if (response.stats) {
        setStats(response.stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    }
  };

  const getTasksInTimeRange = () => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStart, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return tasks.filter(task => new Date(task.createdAt) >= startDate);
  };

  const getCategoryStats = () => {
    const tasksInRange = getTasksInTimeRange();
    const categoryCount: Record<string, number> = {};
    
    tasksInRange.forEach(task => {
      categoryCount[task.category] = (categoryCount[task.category] || 0) + 1;
    });

    return Object.entries(categoryCount).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / tasksInRange.length) * 100),
    }));
  };

  const getPriorityStats = () => {
    const tasksInRange = getTasksInTimeRange();
    const priorityCount: Record<string, number> = {};
    
    tasksInRange.forEach(task => {
      priorityCount[task.priority] = (priorityCount[task.priority] || 0) + 1;
    });

    return Object.entries(priorityCount).map(([priority, count]) => ({
      priority,
      count,
      percentage: Math.round((count / tasksInRange.length) * 100),
    }));
  };

  const getTeamMemberStats = () => {
    const tasksInRange = getTasksInTimeRange();
    
    return teamMembers.map(member => {
      const memberTasks = tasksInRange.filter(task => task.assigneeId?.value === member.id);
      const completedTasks = memberTasks.filter(task => task.status === "completed");
      const overdueTasks = memberTasks.filter(task => 
        task.dueAt && 
        new Date(task.dueAt) < new Date() && 
        task.status !== "completed"
      );

      return {
        member,
        total: memberTasks.length,
        completed: completedTasks.length,
        overdue: overdueTasks.length,
        completionRate: memberTasks.length > 0 ? Math.round((completedTasks.length / memberTasks.length) * 100) : 0,
      };
    });
  };

  const getTimePeriodStats = () => {
    const tasksInRange = getTasksInTimeRange();
    const periodCount: Record<string, number> = {};
    
    tasksInRange.forEach(task => {
      periodCount[task.timePeriod] = (periodCount[task.timePeriod] || 0) + 1;
    });

    return Object.entries(periodCount).map(([period, count]) => ({
      period,
      count,
      percentage: Math.round((count / tasksInRange.length) * 100),
    }));
  };

  const getCompletionTrend = () => {
    const tasksInRange = getTasksInTimeRange();
    const completedByDate: Record<string, number> = {};
    
    tasksInRange
      .filter(task => task.completedAt)
      .forEach(task => {
        const date = new Date(task.completedAt!).toLocaleDateString();
        completedByDate[date] = (completedByDate[date] || 0) + 1;
      });

    return Object.entries(completedByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-base-900">Task Analytics</h1>
            <p className="mt-2 text-base text-base-600">
              Track performance and accountability metrics.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-8">
          <div className="text-center text-base-600">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-base-900">Task Analytics</h1>
            <p className="mt-2 text-base text-base-600">
              Track performance and accountability metrics.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-8">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  const tasksInRange = getTasksInTimeRange();
  const categoryStats = getCategoryStats();
  const priorityStats = getPriorityStats();
  const teamMemberStats = getTeamMemberStats();
  const timePeriodStats = getTimePeriodStats();
  const completionTrend = getCompletionTrend();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-base-900">Task Analytics</h1>
          <p className="mt-2 text-base text-base-600">
            Track performance and accountability metrics.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-border/60 bg-white/50">
            <button
              onClick={() => setTimeRange("week")}
              className={`px-4 py-2 text-sm font-medium transition ${
                timeRange === "week"
                  ? "bg-primary text-white"
                  : "text-base-600 hover:text-base-900"
              }`}
            >
              Last Week
            </button>
            <button
              onClick={() => setTimeRange("month")}
              className={`px-4 py-2 text-sm font-medium transition ${
                timeRange === "month"
                  ? "bg-primary text-white"
                  : "text-base-600 hover:text-base-900"
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setTimeRange("quarter")}
              className={`px-4 py-2 text-sm font-medium transition ${
                timeRange === "quarter"
                  ? "bg-primary text-white"
                  : "text-base-600 hover:text-base-900"
              }`}
            >
              This Quarter
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">
            Total Tasks
          </p>
          <p className="mt-2 text-3xl font-semibold text-base-900">{tasksInRange.length}</p>
          <p className="mt-2 text-sm text-base-600">In selected period</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">
            Completion Rate
          </p>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {stats?.completionRate || 0}%
          </p>
          <p className="mt-2 text-sm text-base-600">Tasks completed</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">
            Verification Rate
          </p>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {stats?.verificationRate || 0}%
          </p>
          <p className="mt-2 text-sm text-base-600">Tasks verified</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">
            Avg Completion Time
          </p>
          <p className="mt-2 text-3xl font-semibold text-purple-600">
            {Math.round(stats?.averageCompletionTime || 0)}h
          </p>
          <p className="mt-2 text-sm text-base-600">Hours per task</p>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-6">
          <h3 className="font-display text-lg text-base-900 mb-4">Tasks by Category</h3>
          <div className="space-y-3">
            {categoryStats.map(({ category, count, percentage }) => (
              <div key={category} className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded ${categoryColors[category as keyof typeof categoryColors]}`} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-base-900 capitalize">
                      {category.replace("_", " ")}
                    </span>
                    <span className="text-sm text-base-600">{count} tasks ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${categoryColors[category as keyof typeof categoryColors]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-6">
          <h3 className="font-display text-lg text-base-900 mb-4">Tasks by Priority</h3>
          <div className="space-y-3">
            {priorityStats.map(({ priority, count, percentage }) => (
              <div key={priority} className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded ${priorityColors[priority as keyof typeof priorityColors]}`} />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-base-900 capitalize">
                      {priority}
                    </span>
                    <span className="text-sm text-base-600">{count} tasks ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${priorityColors[priority as keyof typeof priorityColors]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Performance */}
      <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-6">
        <h3 className="font-display text-lg text-base-900 mb-4">Team Performance</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teamMemberStats.map(({ member, total, completed, overdue, completionRate }) => (
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
                <div className="grid grid-cols-3 gap-2 text-xs text-base-600">
                  <div className="text-center">
                    <div className="font-medium text-base-900">{total}</div>
                    <div>Total</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-green-600">{completed}</div>
                    <div>Done</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-red-600">{overdue}</div>
                    <div>Overdue</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Period Analysis */}
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-6">
          <h3 className="font-display text-lg text-base-900 mb-4">Time Period Analysis</h3>
          <div className="space-y-3">
            {timePeriodStats.map(({ period, count, percentage }) => (
              <div key={period} className="flex items-center justify-between">
                <span className="text-sm font-medium text-base-900 capitalize">
                  {period === "adhoc" ? "Ad-hoc" : period}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-base-600">{count} tasks</span>
                  <span className="text-sm font-medium text-primary">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion Trend */}
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-6">
          <h3 className="font-display text-lg text-base-900 mb-4">Completion Trend (Last 7 Days)</h3>
          <div className="space-y-2">
            {completionTrend.map(({ date, count }) => (
              <div key={date} className="flex items-center justify-between">
                <span className="text-sm text-base-600">{date}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(count * 20, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-base-900 w-8">{count}</span>
                </div>
              </div>
            ))}
            {completionTrend.length === 0 && (
              <div className="text-center py-4 text-base-600">
                No completions in this period
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accountability Summary */}
      <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-6">
        <h3 className="font-display text-lg text-base-900 mb-4">Accountability Summary</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-base-900">{stats?.totalTasks || 0}</div>
            <div className="text-sm text-base-600">Total Tasks Created</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats?.completedTasks || 0}</div>
            <div className="text-sm text-base-600">Tasks Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats?.verifiedTasks || 0}</div>
            <div className="text-sm text-base-600">Tasks Verified</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{stats?.overdueTasks || 0}</div>
            <div className="text-sm text-base-600">Overdue Tasks</div>
          </div>
        </div>
      </div>
    </div>
  );
}
