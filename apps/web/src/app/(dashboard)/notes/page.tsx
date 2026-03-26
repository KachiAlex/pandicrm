import Link from "next/link";

const stats = [
  {
    label: "Total Notes",
    value: "142",
    change: "+18",
    trend: "up",
  },
  {
    label: "This Week",
    value: "23",
    change: "+4",
    trend: "up",
  },
  {
    label: "AI Transcribed",
    value: "89",
    change: "+12",
    trend: "up",
  },
  {
    label: "Shared",
    value: "34",
    change: "+2",
    trend: "up",
  },
];

const recentNotes = [
  {
    title: "Meeting with Acme Corp - Product Requirements",
    type: "meeting",
    duration: "45 min",
    date: "2 hours ago",
    aiTranscribed: true,
  },
  {
    title: "Customer Feedback Session - Global Industries",
    type: "call",
    duration: "30 min",
    date: "4 hours ago",
    aiTranscribed: true,
  },
  {
    title: "Project Planning Notes",
    type: "manual",
    date: "1 day ago",
    aiTranscribed: false,
  },
  {
    title: "Sales Strategy Discussion",
    type: "meeting",
    duration: "60 min",
    date: "2 days ago",
    aiTranscribed: true,
  },
];

export default function NotesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-base-900">Notes</h1>
          <p className="mt-2 text-base text-base-600">
            Capture and organize your thoughts with AI-powered transcription.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/notes/new"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-white shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-primary/90"
          >
            + New Note
          </Link>
          <button className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.26em] text-base-900 shadow-[0_30px_70px_-40px_rgba(9,11,32,0.75)] transition hover:bg-base-50">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Start Recording
          </button>
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
            <h2 className="font-display text-xl text-base-900">Recent Notes</h2>
            <Link
              href="/dashboard/notes/all"
              className="text-sm font-medium text-primary hover:text-secondary"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {recentNotes.map((note, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg border border-border/40 bg-white/50 hover:bg-white transition">
                <div
                  className={`mt-1 size-2 rounded-full ${
                    note.type === "meeting"
                      ? "bg-purple-500"
                      : note.type === "call"
                      ? "bg-blue-500"
                      : "bg-gray-500"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/notes/${index + 1}`}
                      className="font-medium text-base-900 hover:text-primary"
                    >
                      {note.title}
                    </Link>
                    {note.aiTranscribed && (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                        AI Transcribed
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-base-600">
                    <span className="capitalize">{note.type}</span>
                    {note.duration && <span>{note.duration}</span>}
                    <span>{note.date}</span>
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
            <button className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Voice Recording</p>
              <p className="text-sm text-base-600">Start audio capture</p>
            </button>

            <Link
              href="/dashboard/notes/new"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Write Note</p>
              <p className="text-sm text-base-600">Create manual note</p>
            </Link>

            <Link
              href="/dashboard/notes/upload"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Upload Audio</p>
              <p className="text-sm text-base-600">Import audio file</p>
            </Link>

            <Link
              href="/dashboard/notes/search"
              className="rounded-xl border border-border/60 bg-white/50 p-4 text-center transition hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(11,13,42,0.3)]"
            >
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="font-medium text-base-900">Search Notes</p>
              <p className="text-sm text-base-600">Find content quickly</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
