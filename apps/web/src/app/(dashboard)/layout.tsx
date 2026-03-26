export const metadata = {
  title: "Pandi — Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-base-50">
      <nav className="border-b border-border/50 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="font-display text-2xl text-base-900">Pandi</h1>
              <div className="hidden sm:flex sm:gap-6">
                <a href="/dashboard" className="text-sm font-medium text-primary">
                  Dashboard
                </a>
                <a href="/dashboard/crm" className="text-sm font-medium text-base-600 hover:text-base-900">
                  CRM
                </a>
                <a href="/dashboard/notes" className="text-sm font-medium text-base-600 hover:text-base-900">
                  Notes
                </a>
                <a href="/dashboard/tasks" className="text-sm font-medium text-base-600 hover:text-base-900">
                  Tasks
                </a>
                <a href="/dashboard/rituals" className="text-sm font-medium text-base-600 hover:text-base-900">
                  Rituals
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                + New
              </button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-secondary" />
            </div>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
