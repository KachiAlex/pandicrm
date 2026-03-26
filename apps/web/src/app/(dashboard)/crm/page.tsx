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
    label: "Pipeline Value",
    value: "$2.4M",
    change: "+$320K",
    trend: "up",
  },
  {
    label: "Contacts",
    value: "87",
    change: "+12",
    trend: "up",
  },
];

const recentActivity = [
  {
    type: "call",
    title: "Call with Acme Corporation",
    account: "Acme Corporation",
    time: "2 hours ago",
  },
  {
    type: "meeting",
    title: "Product Demo - Global Industries",
    account: "Global Industries",
    time: "4 hours ago",
  },
  {
    type: "note",
    title: "Follow-up on proposal",
    account: "Acme Corporation",
    time: "6 hours ago",
  },
  {
    type: "email",
    title: "Intro email sent",
    account: "Tech Startup Inc",
    time: "1 day ago",
  },
];

export default function CRMPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-base-900">CRM</h1>
          <p className="mt-2 text-base text-base-600">
            Manage your customer relationships, deals, and pipeline.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/crm/accounts"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-white shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-primary/90"
          >
            + New Account
          </Link>
          <Link
            href="/dashboard/crm/deals"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-base-900 shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-base-50"
          >
            + New Deal
          </Link>
        </div>
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
              href="/dashboard/crm/activities"
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
                      : "bg-green-500"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-base-900">{activity.title}</p>
                  <p className="text-sm text-base-600">{activity.account}</p>
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
              href="/dashboard/crm/accounts"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="font-medium text-base-900">View Accounts</p>
              <p className="text-sm text-base-600">Manage customer accounts</p>
            </Link>

            <Link
              href="/dashboard/crm/contacts"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="font-medium text-base-900">View Contacts</p>
              <p className="text-sm text-base-600">Browse contact directory</p>
            </Link>

            <Link
              href="/dashboard/crm/deals"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="font-medium text-base-900">View Pipeline</p>
              <p className="text-sm text-base-600">Track sales opportunities</p>
            </Link>

            <Link
              href="/dashboard/crm/activities"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-medium text-base-900">View Activities</p>
              <p className="text-sm text-base-600">Recent interactions</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
