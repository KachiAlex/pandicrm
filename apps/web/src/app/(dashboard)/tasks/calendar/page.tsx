"use client";

import { useState, useEffect } from "react";
import { api, type Task, type TaskFilter } from "../../../../lib/api";

const WORKSPACE_ID = "ws-demo";

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

export default function TaskCalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedFilter, setSelectedFilter] = useState<"all" | "daily" | "weekly" | "monthly">("all");

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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueAt) return false;
      const taskDate = new Date(task.dueAt);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getFilteredTasks = () => {
    if (selectedFilter === "all") return tasks;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return tasks.filter(task => {
      if (!task.dueAt) return false;
      const dueDate = new Date(task.dueAt);
      
      switch (selectedFilter) {
        case "daily":
          return dueDate.toDateString() === today.toDateString();
        case "weekly":
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return dueDate >= weekStart && dueDate <= weekEnd;
        case "monthly":
          return dueDate.getMonth() === today.getMonth() && 
                 dueDate.getFullYear() === today.getFullYear();
        default:
          return true;
      }
    });
  };

  const completeTask = async (taskId: string) => {
    try {
      const response = await api.completeTask(taskId, {
        completedBy: { value: "current-user" },
        actualHours: 1, // This would be user input in a real implementation
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
            <h1 className="font-display text-3xl text-base-900">Task Calendar</h1>
            <p className="mt-2 text-base text-base-600">
              View and manage your tasks in a calendar format.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-8">
          <div className="text-center text-base-600">Loading calendar...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-base-900">Task Calendar</h1>
            <p className="mt-2 text-base text-base-600">
              View and manage your tasks in a calendar format.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-8">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  const monthDays = getDaysInMonth(currentDate);
  const filteredTasks = getFilteredTasks();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-base-900">Task Calendar</h1>
          <p className="mt-2 text-base text-base-600">
            View and manage your tasks in a calendar format.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex rounded-lg border border-border/60 bg-white/50">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-4 py-2 text-sm font-medium transition ${
                selectedFilter === "all"
                  ? "bg-primary text-white"
                  : "text-base-600 hover:text-base-900"
              }`}
            >
              All Tasks
            </button>
            <button
              onClick={() => setSelectedFilter("daily")}
              className={`px-4 py-2 text-sm font-medium transition ${
                selectedFilter === "daily"
                  ? "bg-primary text-white"
                  : "text-base-600 hover:text-base-900"
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedFilter("weekly")}
              className={`px-4 py-2 text-sm font-medium transition ${
                selectedFilter === "weekly"
                  ? "bg-primary text-white"
                  : "text-base-600 hover:text-base-900"
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setSelectedFilter("monthly")}
              className={`px-4 py-2 text-sm font-medium transition ${
                selectedFilter === "monthly"
                  ? "bg-primary text-white"
                  : "text-base-600 hover:text-base-900"
              }`}
            >
              This Month
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">
            Total Tasks
          </p>
          <p className="mt-2 text-3xl font-semibold text-base-900">{filteredTasks.length}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">
            Pending
          </p>
          <p className="mt-2 text-3xl font-semibold text-base-900">
            {filteredTasks.filter(t => t.status === "pending").length}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">
            In Progress
          </p>
          <p className="mt-2 text-3xl font-semibold text-base-900">
            {filteredTasks.filter(t => t.status === "in_progress").length}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">
            Completed
          </p>
          <p className="mt-2 text-3xl font-semibold text-base-900">
            {filteredTasks.filter(t => t.status === "completed").length}
          </p>
        </div>
      </div>

      {/* Calendar View */}
      <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-6">
        {/* Calendar Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateMonth("prev")}
              className="rounded-lg p-2 text-base-600 hover:bg-white/50 hover:text-base-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="font-display text-xl text-base-900">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h2>
            <button
              onClick={() => navigateMonth("next")}
              className="rounded-lg p-2 text-base-600 hover:bg-white/50 hover:text-base-900"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="rounded-lg px-4 py-2 text-sm font-medium text-base-600 hover:bg-white/50 hover:text-base-900"
          >
            Today
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-px bg-border/20">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="bg-white/50 p-3 text-center">
              <span className="text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                {day}
              </span>
            </div>
          ))}
          
          {/* Calendar days */}
          {monthDays.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="bg-white/50 p-3 min-h-[100px]" />;
            }

            const dayTasks = getTasksForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={date.toISOString()}
                className={`bg-white/50 p-3 min-h-[100px] ${
                  isToday ? "bg-primary/5" : ""
                }`}
              >
                <div className={`text-sm font-medium ${
                  isToday ? "text-primary" : "text-base-900"
                }`}>
                  {date.getDate()}
                </div>
                <div className="mt-1 space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <div
                      key={task.id.value}
                      className={`truncate rounded px-1 py-0.5 text-xs font-medium ${
                        priorityColors[task.priority]
                      }`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task List for Selected Filter */}
      <div className="rounded-2xl border border-border/60 bg-white/80 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)] p-6">
        <h3 className="font-display text-lg text-base-900 mb-4">
          {selectedFilter === "all" ? "All Tasks" : 
           selectedFilter === "daily" ? "Today's Tasks" :
           selectedFilter === "weekly" ? "This Week's Tasks" : "This Month's Tasks"}
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
                </div>
                <div className="mt-1 text-sm text-base-600">
                  {task.description}
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-base-600">
                  <span>Category: {task.category}</span>
                  <span>Due: {task.dueAt ? new Date(task.dueAt).toLocaleDateString() : "No due date"}</span>
                  {task.estimatedHours && <span>Est: {task.estimatedHours}h</span>}
                </div>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="text-center py-8 text-base-600">
              No tasks found for the selected period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
