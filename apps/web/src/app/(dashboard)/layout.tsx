export const metadata = {
  title: "Pandi — Dashboard",
};

import { AuthProvider } from "../../hooks/useAuth";
import { NotificationCenter } from "../../components/Notifications/NotificationCenter";
import { NotificationToastContainer } from "../../components/Notifications/NotificationToast";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-base-50">
        <nav className="border-b border-border/50 bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <h1 className="font-display text-2xl text-base-900">Pandi</h1>
                <div className="hidden sm:flex sm:gap-6">
                  <a href="/crm" className="text-sm font-medium text-primary">
                    Dashboard
                  </a>
                  <a href="/crm" className="text-sm font-medium text-base-600 hover:text-base-900">
                    CRM
                  </a>
                  <a href="/notes" className="text-sm font-medium text-base-600 hover:text-base-900">
                    Notes
                  </a>
                  <a href="/tasks" className="text-sm font-medium text-base-600 hover:text-base-900">
                    Tasks
                  </a>
                  <a href="/rituals" className="text-sm font-medium text-base-600 hover:text-base-900">
                    Rituals
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <NotificationCenter />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                    JD
                  </div>
                  <span className="text-sm font-medium text-base-900">John Doe</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
      <NotificationToastContainer />
    </AuthProvider>
  );
}
