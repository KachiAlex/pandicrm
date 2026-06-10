import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "pandicrm | Customer Relations has never been this easy",
  description: "pandicrm is the AI-powered CRM for sales teams and customer success. AI note taker, task manager, pipeline tracking, and reporting in one beautiful platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
