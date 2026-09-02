"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { api, Contact, ContactCategory, TimelineEvent } from "@/lib/api";
import {
  ArrowLeft,
  Loader2,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  CheckCircle,
  Download,
  Filter,
  User,
  Building2,
  Clock,
  X,
  Plus,
  Search,
  UserPlus,
} from "lucide-react";
import CreateContactModal from "@/components/CreateContactModal";

type FollowUpEventMetadata = { outcome?: string; response?: string; nextCadence?: string };

const filters = ["today", "overdue", "upcoming", "all"] as const;

type Filter = (typeof filters)[number];

type LogForm = {
  type: string;
  outcome: string;
  notes: string;
  response: string;
  occurredAt: string;
  nextCadence: string;
  customDays: number;
  reminder: boolean;
  reminderDate: string;
};

const cadenceOptions = [
  { value: "same_day", label: "Same day" },
  { value: "1_day", label: "1 day" },
  { value: "2_days", label: "2 days" },
  { value: "3_days", label: "3 days" },
  { value: "1_week", label: "1 week" },
  { value: "2_weeks", label: "2 weeks" },
  { value: "1_month", label: "1 month" },
  { value: "custom", label: "Custom" },
];

const activityTypes = [
  { value: "call", label: "Call", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "meeting", label: "Meeting", icon: Calendar },
  { value: "note", label: "Note", icon: FileText },
];

const outcomes = [
  "interested",
  "callback_later",
  "no_answer",
  "not_interested",
  "voicemail",
  "other",
];

export default function FollowUpsPage() {
  const [tab, setTab] = useState<"inbox" | "sheet">("inbox");
  const [filter, setFilter] = useState<Filter>("today");
  const [workspaceId, setWorkspaceId] = useState<string>("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [activities, setActivities] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<Contact | null>(null);
  const [categories, setCategories] = useState<ContactCategory[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [candidatePage, setCandidatePage] = useState(0);
  const candidatePageSize = 20;

  const filteredCandidates = useMemo(() => {
    return allContacts.filter((c) => {
      const matchesCategory = !categoryId || (c.categoryIds || []).includes(categoryId);
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q);
      const matchesStatus = !statusFilter || c.status === statusFilter;
      return matchesCategory && matchesSearch && matchesStatus;
    });
  }, [allContacts, categoryId, search, statusFilter]);

  const totalCandidatePages = Math.ceil(filteredCandidates.length / candidatePageSize);
  const paginatedCandidates = filteredCandidates.slice(
    candidatePage * candidatePageSize,
    (candidatePage + 1) * candidatePageSize
  );

  useEffect(() => setCandidatePage(0), [categoryId, search, statusFilter]);

  const [form, setForm] = useState<LogForm>({
    type: "call",
    outcome: "other",
    notes: "",
    response: "",
    occurredAt: new Date().toISOString().slice(0, 16),
    nextCadence: "3_days",
    customDays: 3,
    reminder: false,
    reminderDate: "",
  });

  const [from, setFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [to, setTo] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [sheetType, setSheetType] = useState<string>("");
  const [sheetOutcome, setSheetOutcome] = useState<string>("");
  const [sheetContactId, setSheetContactId] = useState<string>("");

  useEffect(() => {
    fetch("/api/workspaces")
      .then((r) => (r.ok ? r.json() : []))
      .then((list: any[]) => {
        if (list.length > 0) {
          setWorkspaceId(list[0].id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!workspaceId) return;
    loadContacts();
    api.contacts.list(workspaceId).then(setAllContacts).catch(() => {});
    api.contactCategories.list(workspaceId).then(setCategories).catch(() => {});
  }, [workspaceId, filter]);

  useEffect(() => {
    if (!workspaceId || tab !== "sheet") return;
    loadSheet();
  }, [workspaceId, tab, from, to, sheetType, sheetOutcome, sheetContactId]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const list = await api.followUps.list(workspaceId, filter);
      setContacts(list);
    } catch {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSheet = async () => {
    setLoading(true);
    try {
      const list = await api.followUps.activity(workspaceId, {
        from,
        to,
        type: sheetType,
        outcome: sheetOutcome,
        contactId: sheetContactId,
      });
      setActivities(list);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const openLog = (contact: Contact, type: string) => {
    setSelected(contact);
    setForm({
      type,
      outcome: "other",
      notes: "",
      response: "",
      occurredAt: new Date().toISOString().slice(0, 16),
      nextCadence: contact.followUpCadence || "3_days",
      customDays: 3,
      reminder: false,
      reminderDate: "",
    });
  };

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await api.contacts.followUp(selected.id, {
        type: form.type,
        outcome: form.outcome,
        notes: form.notes,
        response: form.response,
        occurredAt: form.occurredAt,
        nextCadence: form.nextCadence,
        customDays: form.nextCadence === "custom" ? Number(form.customDays) : undefined,
        reminder: form.reminder,
        reminderDate: form.reminder ? form.reminderDate : undefined,
      });
      setSelected(null);
      await loadContacts();
      if (tab === "sheet") await loadSheet();
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = async () => {
    if (!workspaceId) return;
    setExporting(true);
    try {
      const blob = await api.followUps.exportCsv(workspaceId, {
        from,
        to,
        type: sheetType,
        outcome: sheetOutcome,
        contactId: sheetContactId,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `follow-ups-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const statusBadge = (c: Contact) => {
    if (!c.nextFollowUpAt) return <span className="text-[10px] text-gray-400">No follow-up set</span>;
    const next = new Date(c.nextFollowUpAt);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(next);
    start.setHours(0, 0, 0, 0);
    const end = new Date(next);
    end.setHours(23, 59, 59, 999);
    const now = new Date();
    if (now > end) return <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">Overdue</span>;
    if (now >= start && now <= end) return <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">Today</span>;
    return <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Upcoming</span>;
  };

  const quickButtons = (c: Contact) => (
    <div className="flex gap-1.5">
      {activityTypes.map((t) => (
        <button
          key={t.value}
          onClick={() => openLog(c, t.value)}
          className="p-1.5 rounded-md bg-gray-100 hover:bg-pk-100 text-gray-600 hover:text-pk-600 transition-colors"
          title={t.label}
        >
          <t.icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );

  if (loading && !workspaceId) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#f5f5f7" }}>
        <Loader2 className="w-6 h-6 animate-spin text-pk-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f7" }}>
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-200 transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </Link>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "#0d0d12" }}>Follow-ups</h1>
          </div>
          <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200">
            {(["inbox", "sheet"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                  tab === t ? "bg-pk-600 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t === "inbox" ? "Inbox" : "Sheet"}
              </button>
            ))}
          </div>
        </div>

        {tab === "inbox" ? (
          <>
            <div className="flex gap-2 mb-6 overflow-x-auto">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-colors border ${
                    filter === f
                      ? "bg-pk-600 text-white border-pk-600"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            <div className="surf p-4 mb-6">
              <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-pk-600" />
                Start a follow-up
              </h2>
              <div className="flex flex-wrap gap-3 items-end mb-4">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none min-w-[160px]"
                  >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">Find contact</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name or email"
                      className="bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs outline-none w-56"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none min-w-[140px]"
                  >
                    <option value="">All statuses</option>
                    <option value="new">New</option>
                    <option value="qualified">Qualified</option>
                    <option value="opportunity">Opportunity</option>
                    <option value="customer">Customer</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <button
                  onClick={() => setShowCreate(true)}
                  className="btn-p text-xs px-3 py-2.5 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New contact
                </button>
              </div>
              {paginatedCandidates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paginatedCandidates.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate">{c.email || c.phone || "-"}</p>
                      </div>
                      <button
                        onClick={() => openLog(c, "call")}
                        className="text-xs px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:border-pk-500 hover:text-pk-600"
                      >
                        Log
                      </button>
                    </div>
                  ))}
                </div>
              ) : search || categoryId || statusFilter ? (
                <p className="text-xs text-gray-500">No matching contacts.</p>
              ) : (
                <p className="text-xs text-gray-500">Select a category or search to find a contact to follow up.</p>
              )}
              {totalCandidatePages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Page {candidatePage + 1} of {totalCandidatePages} ({filteredCandidates.length} contacts)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCandidatePage((p) => Math.max(0, p - 1))}
                      disabled={candidatePage === 0}
                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-700 hover:border-pk-500 hover:text-pk-600 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCandidatePage((p) => Math.min(totalCandidatePages - 1, p + 1))}
                      disabled={candidatePage === totalCandidatePages - 1}
                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs text-gray-700 hover:border-pk-500 hover:text-pk-600 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-pk-600" />
              </div>
            ) : contacts.length === 0 ? (
              <div className="surf p-8 text-center">
                <p className="text-sm text-gray-500">No follow-ups for this filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contacts.map((c) => (
                  <div key={c.id} className="surf p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-pk-100 text-pk-700 flex items-center justify-center text-sm font-semibold">
                          {c.firstName[0]?.toUpperCase() || c.email?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {c.firstName} {c.lastName}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">{c.email}</p>
                        </div>
                      </div>
                      {statusBadge(c)}
                    </div>
                    <div className="space-y-1.5 mb-4">
                      {c.account?.name && (
                        <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                          <Building2 className="w-3 h-3" />
                          {c.account.name}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Next: {c.nextFollowUpAt ? new Date(c.nextFollowUpAt).toISOString().split("T")[0] : "-"}
                      </p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3" />
                        Last: {c.lastFollowUpAt ? new Date(c.lastFollowUpAt).toISOString().split("T")[0] : "-"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      {quickButtons(c)}
                      <button
                        onClick={() => openLog(c, "call")}
                        className="btn-p text-xs px-3 py-2"
                      >
                        Log follow-up
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="surf p-4 mb-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">Type</label>
                  <select
                    value={sheetType}
                    onChange={(e) => setSheetType(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="">All types</option>
                    {activityTypes.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">Outcome</label>
                  <select
                    value={sheetOutcome}
                    onChange={(e) => setSheetOutcome(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="">All outcomes</option>
                    {outcomes.map((o) => (
                      <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-gray-500 mb-1">Contact</label>
                  <select
                    value={sheetContactId}
                    onChange={(e) => setSheetContactId(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                  >
                    <option value="">All contacts</option>
                    {allContacts.map((c) => (
                      <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="btn-p text-xs px-4 py-2.5 flex items-center gap-2 ml-auto"
                >
                  {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  Export CSV
                </button>
              </div>
            </div>

            <div className="surf p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Contact</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Account</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Type</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Outcome</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Cadence</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Next</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Owner</th>
                      <th className="px-4 py-3 font-medium text-gray-500">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center">
                          <Loader2 className="w-5 h-5 animate-spin text-pk-600 mx-auto" />
                        </td>
                      </tr>
                    ) : activities.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-gray-400">No follow-up activities found.</td>
                      </tr>
                    ) : (
                      activities.map((e) => (
                        <tr key={e.id} className="border-b border-gray-50 last:border-0">
                          <td className="px-4 py-3 text-gray-500">{new Date(e.occurredAt).toISOString().split("T")[0]}</td>
                          <td className="px-4 py-3 font-medium text-gray-900">{e.contact ? `${e.contact.firstName} ${e.contact.lastName}` : "-"}</td>
                          <td className="px-4 py-3 text-gray-500">{e.account?.name || "-"}</td>
                          <td className="px-4 py-3 capitalize text-gray-700">{e.type}</td>
                          <td className="px-4 py-3 text-gray-500 capitalize">{((e.metadata as unknown as FollowUpEventMetadata).outcome || "-").replace(/_/g, " ")}</td>
                          <td className="px-4 py-3 text-gray-500">{(e.metadata as unknown as FollowUpEventMetadata).nextCadence || "-"}</td>
                          <td className="px-4 py-3 text-gray-500">{e.contact?.nextFollowUpAt ? new Date(e.contact.nextFollowUpAt).toISOString().split("T")[0] : "-"}</td>
                          <td className="px-4 py-3 text-gray-500">{e.author?.name || "-"}</td>
                          <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{e.description || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Log follow-up</h2>
              <button onClick={() => setSelected(null)} className="p-1 rounded-md hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              {selected.firstName} {selected.lastName}
            </p>
            <form onSubmit={handleLog} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Activity type</label>
                <div className="grid grid-cols-4 gap-2">
                  {activityTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t.value }))}
                      className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-[10px] font-medium transition-colors ${
                        form.type === t.value ? "bg-pk-50 border-pk-500 text-pk-600" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <t.icon className="w-3.5 h-3.5" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Outcome</label>
                <select
                  value={form.outcome}
                  onChange={(e) => setForm((f) => ({ ...f, outcome: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                >
                  {outcomes.map((o) => (
                    <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Date & time</label>
                <input
                  type="datetime-local"
                  required
                  value={form.occurredAt}
                  onChange={(e) => setForm((f) => ({ ...f, occurredAt: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Observation / notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                  placeholder="What happened?"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Response from contact</label>
                <textarea
                  value={form.response}
                  onChange={(e) => setForm((f) => ({ ...f, response: e.target.value }))}
                  rows={2}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                  placeholder="What did the contact say?"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Next follow-up cadence</label>
                <select
                  value={form.nextCadence}
                  onChange={(e) => setForm((f) => ({ ...f, nextCadence: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                >
                  {cadenceOptions.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              {form.nextCadence === "custom" && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Custom days</label>
                  <input
                    type="number"
                    min={0}
                    value={form.customDays}
                    onChange={(e) => setForm((f) => ({ ...f, customDays: Number(e.target.value) }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  id="reminder"
                  type="checkbox"
                  checked={form.reminder}
                  onChange={(e) => setForm((f) => ({ ...f, reminder: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="reminder" className="text-xs text-gray-600">Set reminder</label>
              </div>
              {form.reminder && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Reminder date</label>
                  <input
                    type="date"
                    required
                    value={form.reminderDate}
                    onChange={(e) => setForm((f) => ({ ...f, reminderDate: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none"
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-p text-xs px-4 py-2.5 flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  Save follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showCreate && workspaceId && (
        <CreateContactModal
          workspaceId={workspaceId}
          onClose={() => setShowCreate(false)}
          onCreated={(contact) => {
            setShowCreate(false);
            if (contact) {
              setAllContacts((prev) => [contact, ...prev]);
              openLog(contact, "call");
            }
          }}
        />
      )}
    </div>
  );
}
