"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, X, Building2, Mail, Phone, Globe, Users, Tag, Briefcase } from "lucide-react";
import { api, Account, Contact, Deal } from "@/lib/api";

export default function ListPanel({ workspaceId, type }: { workspaceId: string; type: "accounts" | "contacts" | "deals" }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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
  }, [workspaceId, type, refreshKey]);

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

  const typeLabel = type === "accounts" ? "Account" : type === "contacts" ? "Contact" : "Deal";

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </h2>
        {type !== "deals" && (
          <button className="btn-p text-xs px-3.5 py-2" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5" />New {typeLabel}
          </button>
        )}
      </div>
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

      {showCreate && type === "accounts" && (
        <CreateAccountModal workspaceId={workspaceId} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); setRefreshKey((k) => k + 1); }} />
      )}
      {showCreate && type === "contacts" && (
        <CreateContactModal workspaceId={workspaceId} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); setRefreshKey((k) => k + 1); }} />
      )}
    </>
  );
}

function CreateAccountModal({ workspaceId, onClose, onCreated }: { workspaceId: string; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [domain, setDomain] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Company name is required"); return; }
    setLoading(true);
    try {
      await api.accounts.create({
        workspaceId,
        name,
        industry: industry || undefined,
        size: size || undefined,
        domain: domain || undefined,
        website: website || undefined,
        phone: phone || undefined,
        description: description || undefined,
      });
      onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create account");
      setLoading(false);
    }
  };

  const selClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-pk-500 focus:ring-1 focus:ring-pk-500 transition-colors bg-white";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-900">New Account</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>Company Name *</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." className={`${selClass} pl-10`} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Industry</label>
              <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="SaaS" className={selClass} />
            </div>
            <div>
              <label className={labelClass}>Size</label>
              <select value={size} onChange={(e) => setSize(e.target.value)} className={selClass}>
                <option value="">Select size</option>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="500+">500+</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Domain</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="acme.com" className={`${selClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" className={`${selClass} pl-10`} />
              </div>
            </div>
          </div>
          <div>
            <label className={labelClass}>Website</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://acme.com" className={selClass} />
          </div>
          <div>
            <label className={labelClass}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={3} className={selClass} />
          </div>
          <button type="submit" disabled={loading} className="btn-p w-full justify-center py-3 text-sm disabled:opacity-60">
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CreateContactModal({ workspaceId, onClose, onCreated }: { workspaceId: string; onClose: () => void; onCreated: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    api.accounts.list(workspaceId).then((a) => { setAccounts(a); setFetching(false); }).catch(() => setFetching(false));
  }, [workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim()) { setError("First and last name are required"); return; }
    setLoading(true);
    try {
      await api.contacts.create({
        workspaceId,
        firstName,
        lastName,
        email: email || undefined,
        phone: phone || undefined,
        title: title || undefined,
        department: department || undefined,
        accountId: accountId || undefined,
      });
      onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create contact");
      setLoading(false);
    }
  };

  const selClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-pk-500 focus:ring-1 focus:ring-pk-500 transition-colors bg-white";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-900">New Contact</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
        {fetching ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-pk-600" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name *</label>
                <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className={selClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className={selClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@acme.com" className={`${selClass} pl-10`} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 000 0000" className={`${selClass} pl-10`} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VP Sales" className={`${selClass} pl-10`} />
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Sales" className={selClass} />
            </div>
            <div>
              <label className={labelClass}>Account</label>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={selClass}>
                <option value="">None</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn-p w-full justify-center py-3 text-sm disabled:opacity-60">
              {loading ? "Creating..." : "Create Contact"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
