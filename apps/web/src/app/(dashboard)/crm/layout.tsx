export const metadata = {
  title: "Pandi — CRM",
};

export default function CRMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <nav className="w-64 border-r border-border/60 bg-white/80">
        <div className="p-6">
          <h2 className="font-display text-lg text-base-900">CRM</h2>
          <p className="text-sm text-base-600">Customer Relationship Management</p>
        </div>
        <div className="px-4 pb-6">
          <div className="space-y-1">
            <a
              href="/dashboard/crm"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-primary bg-primary/5"
            >
              Overview
            </a>
            <a
              href="/dashboard/crm/accounts"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-base-600 hover:bg-base-50"
            >
              Accounts
            </a>
            <a
              href="/dashboard/crm/contacts"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-base-600 hover:bg-base-50"
            >
              Contacts
            </a>
            <a
              href="/dashboard/crm/deals"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-base-600 hover:bg-base-50"
            >
              Deals
            </a>
            <a
              href="/dashboard/crm/activities"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-base-600 hover:bg-base-50"
            >
              Activities
            </a>
            <a
              href="/dashboard/crm/reports"
              className="block rounded-lg px-3 py-2 text-sm font-medium text-base-600 hover:bg-base-50"
            >
              Reports
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
