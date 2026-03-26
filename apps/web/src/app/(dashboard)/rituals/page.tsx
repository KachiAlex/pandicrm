import Link from "next/link";

const stats = [
  {
    label: "Active Rituals",
    value: "8",
    change: "+2",
    trend: "up",
  },
  {
    label: "Completed Today",
    value: "5",
    change: "+1",
    trend: "up",
  },
  {
    label: "Streak",
    value: "12 days",
    change: "+3",
    trend: "up",
  },
  {
    label: "Health Score",
    value: "92%",
    change: "+5%",
    trend: "up",
  },
];

const todayRituals = [
  {
    title: "Morning Meditation",
    time: "6:30 AM",
    duration: "15 min",
    completed: true,
    category: "mindfulness",
  },
  {
    title: "Sales Pipeline Review",
    time: "9:00 AM",
    duration: "30 min",
    completed: true,
    category: "business",
  },
  {
    title: "Customer Check-ins",
    time: "2:00 PM",
    duration: "45 min",
    completed: false,
    category: "business",
  },
  {
    title: "Evening Reflection",
    time: "8:00 PM",
    duration: "10 min",
    completed: false,
    category: "mindfulness",
  },
];

const categoryColors = {
  mindfulness: "bg-purple-100 text-purple-800",
  business: "bg-blue-100 text-blue-800",
  health: "bg-green-100 text-green-800",
  learning: "bg-yellow-100 text-yellow-800",
};

export default function RitualsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-base-900">Rituals</h1>
          <p className="mt-2 text-base text-base-600">
            Build consistent habits and track your daily routines.
          </p>
        </div>
        <Link
          href="/dashboard/rituals/new"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-white shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-primary/90"
        >
          + New Ritual
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
            <h2 className="font-display text-xl text-base-900">Today's Rituals</h2>
            <Link
              href="/dashboard/rituals/calendar"
              className="text-sm font-medium text-primary hover:text-secondary"
            >
              View calendar
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {todayRituals.map((ritual, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-border/40 bg-white/50 hover:bg-white transition">
                <input
                  type="checkbox"
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                  checked={ritual.completed}
                  readOnly
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-medium ${ritual.completed ? "text-base-600 line-through" : "text-base-900"}`}>
                      {ritual.title}
                    </h3>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${categoryColors[ritual.category as keyof typeof categoryColors]}`}>
                      {ritual.category}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-base-600">
                    <span>{ritual.time}</span>
                    <span>{ritual.duration}</span>
                  </div>
                </div>
                {!ritual.completed && (
                  <button className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary/90">
                    Start
                  </button>
                )}
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
              href="/dashboard/rituals/new"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Create Ritual</p>
              <p className="text-sm text-base-600">New habit</p>
            </Link>

            <Link
              href="/dashboard/rituals/templates"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Templates</p>
              <p className="text-sm text-base-600">Browse rituals</p>
            </Link>

            <Link
              href="/dashboard/rituals/analytics"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Analytics</p>
              <p className="text-sm text-base-600">View progress</p>
            </Link>

            <Link
              href="/dashboard/rituals/streaks"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Streaks</p>
              <p className="text-sm text-base-600">Track consistency</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
