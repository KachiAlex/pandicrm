export const metadata = {
  title: "Pandi CRM — Authenticate",
};

import { AuthProvider } from "../../hooks/useAuth";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-[100svh]">{children}</div>
    </AuthProvider>
  );
}
