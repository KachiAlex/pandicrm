import Link from "next/link";

const stats = [
  {
    label: "Total Accounts",
    value: "24",
    change: "+2",
    trend: "up",
  },
  {
    label: "Active Deals",
    value: "18",
    change: "+4",
    trend: "up",
  },
  {
    label: "Tasks Due",
    value: "7",
    change: "-3",
    trend: "down",
  },
  {
    label: "Notes Today",
    value: "5",
    change: "+2",
    trend: "up",
  },
];

const recentActivity = [
  {
    type: "call",
    title: "Call with Acme Corporation",
    module: "CRM",
    time: "2 hours ago",
  },
  {
    type: "note",
    title: "Meeting transcription completed",
    module: "Notes",
    time: "4 hours ago",
  },
  {
    type: "task",
    title: "Q2 presentation task completed",
    module: "Tasks",
    time: "6 hours ago",
  },
  {
    type: "ritual",
    title: "Morning meditation completed",
    module: "Rituals",
    time: "8 hours ago",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl text-base-900">Dashboard</h1>
        <p className="mt-2 text-base text-base-600">
          Welcome back! Here's what's happening with your Pandi workspace today.
        </p>
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
            <h2 className="font-display text-xl text-base-900">Recent Activity</h2>
            <Link
              href="/dashboard/activity"
              className="text-sm font-medium text-primary hover:text-secondary"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div
                  className={`mt-1 size-2 rounded-full ${
                    activity.type === "call"
                      ? "bg-blue-500"
                      : activity.type === "meeting"
                      ? "bg-purple-500"
                      : activity.type === "note"
                      ? "bg-yellow-500"
                      : activity.type === "task"
                      ? "bg-green-500"
                      : "bg-orange-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-base-900">{activity.title}</p>
                  <p className="text-sm text-base-600">{activity.module}</p>
                </div>
                <p className="text-xs text-muted">{activity.time}</p>
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
              href="/dashboard/crm"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="font-medium text-base-900">CRM</p>
              <p className="text-sm text-base-600">Manage customers</p>
            </Link>

            <Link
              href="/dashboard/notes"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Notes</p>
              <p className="text-sm text-base-600">AI transcription</p>
            </Link>

            <Link
              href="/dashboard/tasks"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Tasks</p>
              <p className="text-sm text-base-600">Track progress</p>
            </Link>

            <Link
              href="/dashboard/rituals"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Rituals</p>
              <p className="text-sm text-base-600">Build habits</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
