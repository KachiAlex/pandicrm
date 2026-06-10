"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { api, Account, Contact, Deal } from "@/lib/api";

export default function ListPanel({ workspaceId, type }: { workspaceId: string; type: "accounts" | "contacts" | "deals" }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    const fetcher =
      type === "accounts" ? api.accounts.list(workspaceId) :
      type === "contacts" ? api.contacts.list(workspaceId) :
      api.deals.list(workspaceId);
    fetcher.then((data) => {
      setItems(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [workspaceId, type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-pk-600" />
      </div>
    );
  }

  const headers =
    type === "accounts" ? ["Name", "Industry", "Size", "Domain"] :
    type === "contacts" ? ["Name", "Email", "Title", "Account"] :
    ["Name", "Stage", "Value", "Probability"];

  return (
    <div className="surf overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
            {headers.map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-gray-400">No {type} yet.</td>
            </tr>
          )}
          {items.map((item) => {
            if (type === "accounts") {
              const a = item as Account;
              return (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f9fafb" }}>
                  <td className="px-4 py-3 font-medium text-gray-900">{a.name}</td>
                  <td className="px-4 py-3 text-gray-500">{a.industry || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{a.size || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{a.domain || "—"}</td>
                </tr>
              );
            }
            if (type === "contacts") {
              const c = item as Contact;
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f9fafb" }}>
                  <td className="px-4 py-3 font-medium text-gray-900">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.title || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{c.account?.name || "—"}</td>
                </tr>
              );
            }
            const d = item as Deal;
            return (
              <tr key={d.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f9fafb" }}>
                <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{d.stage}</td>
                <td className="px-4 py-3 text-gray-500">${Number(d.value).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{d.probability}%</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
