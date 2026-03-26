import Link from "next/link";

const stats = [
  {
    label: "Total Tasks",
    value: "47",
    change: "+8",
    trend: "up",
  },
  {
    label: "Completed Today",
    value: "12",
    change: "+3",
    trend: "up",
  },
  {
    label: "In Progress",
    value: "15",
    change: "-2",
    trend: "down",
  },
  {
    label: "Overdue",
    value: "3",
    change: "-1",
    trend: "down",
  },
];

const recentTasks = [
  {
    title: "Follow up with Acme Corp on proposal",
    priority: "high",
    dueDate: "Today",
    status: "in-progress",
    assignee: "You",
  },
  {
    title: "Prepare Q2 sales presentation",
    priority: "medium",
    dueDate: "Tomorrow",
    status: "todo",
    assignee: "You",
  },
  {
    title: "Review contract with Global Industries",
    priority: "high",
    dueDate: "Mar 28",
    status: "todo",
    assignee: "Sarah J.",
  },
  {
    title: "Update CRM documentation",
    priority: "low",
    dueDate: "Mar 30",
    status: "in-progress",
    assignee: "You",
  },
];

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const statusColors = {
  todo: "bg-gray-100 text-gray-800",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

export default function TasksPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-base-900">Tasks</h1>
          <p className="mt-2 text-base text-base-600">
            Manage your tasks and stay on top of your priorities.
          </p>
        </div>
        <Link
          href="/dashboard/tasks/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-white shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-primary/90"
        >
          + New Task
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]"
          >
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-muted">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-base-900">{stat.value}</p>
            <p
              className={`mt-2 text-sm ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}
            >
              {stat.change} from last week
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-base-900">Recent Tasks</h2>
            <Link
              href="/dashboard/tasks/all"
              className="text-sm font-medium text-primary hover:text-secondary"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {recentTasks.map((task, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-border/40 bg-white/50 hover:bg-white transition">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  checked={task.status === "completed"}
                  readOnly
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/tasks/${index + 1}`}
                      className="font-medium text-base-900 hover:text-primary"
                    >
                      {task.title}
                    </Link>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                      {task.priority}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[task.status as keyof typeof statusColors]}`}>
                      {task.status.replace("-", " ")}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-base-600">
                    <span>Due: {task.dueDate}</span>
                    <span>Assigned to: {task.assignee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 shadow-[0_20px_60px_-44px_rgba(11,13,42,0.6)]">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-base-900">Quick Actions</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link
              href="/dashboard/tasks/new"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Create Task</p>
              <p className="text-sm text-base-600">Add new task</p>
            </Link>

            <Link
              href="/dashboard/tasks/calendar"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Calendar View</p>
              <p className="text-sm text-base-600">See timeline</p>
            </Link>

            <Link
              href="/dashboard/tasks/kanban"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary-to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Kanban Board</p>
              <p className="text-sm text-base-600">Drag & drop tasks</p>
            </Link>

            <Link
              href="/dashboard/tasks/team"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Team Tasks</p>
              <p className="text-sm text-base-600">Collaborative work</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
