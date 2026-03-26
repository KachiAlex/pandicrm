export const metadata = {
  title: "Pandi CRM — Authenticate",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-[100svh]">{children}</div>;
}
