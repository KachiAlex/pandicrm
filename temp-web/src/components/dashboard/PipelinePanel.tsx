"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, X, DollarSign, Pencil, Trash2, Search, ArrowRight } from "lucide-react";
import { api, Deal, DealStage, Account, Contact, ContactCategory } from "@/lib/api";

const STAGES: { key: DealStage; label: string; dot: string }[] = [
  { key: "lead", label: "Lead", dot: "#9ca3af" },
  { key: "qualify", label: "Qualify", dot: "#ffadd9" },
  { key: "propose", label: "Propose", dot: "#f59e0b" },
  { key: "negotiate", label: "Negotiate", dot: "#a78bfa" },
  { key: "won", label: "Won", dot: "#4ade80" },
  { key: "lost", label: "Lost", dot: "#ef4444" },
];

const PIPELINE_STAGES: { key: string; label: string; dot: string; type: "contact" | "deal" }[] = [
  { key: "new", label: "New", dot: "#9ca3af", type: "contact" },
  { key: "qualified", label: "Qualified", dot: "#3b82f6", type: "contact" },
  { key: "opportunity", label: "Opportunity", dot: "#ff1a97", type: "contact" },
  { key: "lead", label: "Lead", dot: "#9ca3af", type: "deal" },
  { key: "qualify", label: "Qualify", dot: "#ffadd9", type: "deal" },
  { key: "propose", label: "Propose", dot: "#f59e0b", type: "deal" },
  { key: "negotiate", label: "Negotiate", dot: "#a78bfa", type: "deal" },
  { key: "won", label: "Won", dot: "#4ade80", type: "deal" },
  { key: "lost", label: "Lost", dot: "#ef4444", type: "deal" },
];

const VIEWS = ["contacts", "opportunities", "deals"] as const;

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  qualified: "Qualified",
  opportunity: "Opportunity",
  customer: "Customer",
  lost: "Lost",
};

export default function PipelinePanel({ workspaceId }: { workspaceId: string }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<ContactCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [view, setView] = useState<typeof VIEWS[number]>("contacts");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"valueDesc" | "valueAsc" | "closeDate" | "created">("valueDesc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    Promise.all([
      api.deals.list(workspaceId).catch(() => []),
      api.contacts.list(workspaceId).catch(() => []),
      api.contactCategories.list(workspaceId).catch(() => []),
    ]).then(([d, c, cat]) => {
      setDeals(d);
      setContacts(c);
      setCategories(cat);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [workspaceId, refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-pk-600" />
      </div>
    );
  }

  const q = search.toLowerCase();

  const filteredContacts = contacts
    .filter((c) => {
      if (!search) return true;
      const name = `${c.firstName} ${c.lastName}`.toLowerCase();
      return name.includes(q) || (c.email || "").toLowerCase().includes(q) || (c.title || "").toLowerCase().includes(q);
    })
    .filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (categoryFilter && !c.categoryIds.includes(categoryFilter)) return false;
      return true;
    })
    .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

  const opportunityContacts = contacts
    .filter((c) => c.status === "opportunity")
    .filter((c) => {
      if (!search) return true;
      const name = `${c.firstName} ${c.lastName}`.toLowerCase();
      return name.includes(q) || (c.email || "").toLowerCase().includes(q) || (c.title || "").toLowerCase().includes(q);
    })
    .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));

  const filteredDeals = deals
    .filter((d) => {
      const matchesSearch = !search || d.name.toLowerCase().includes(q) || (d.description || "").toLowerCase().includes(q);
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "valueDesc") return Number(b.value) - Number(a.value);
      if (sortBy === "valueAsc") return Number(a.value) - Number(b.value);
      if (sortBy === "closeDate") {
        if (!a.closeDate && !b.closeDate) return 0;
        if (!a.closeDate) return 1;
        if (!b.closeDate) return -1;
        return new Date(a.closeDate).getTime() - new Date(b.closeDate).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const total = filteredDeals.reduce((sum, d) => sum + Number(d.value), 0);

  const handleBulkStatus = async (status: Contact["status"]) => {
    if (selectedIds.size === 0) return;
    setBulkLoading(true);
    try {
      await api.contacts.bulk({ ids: Array.from(selectedIds), status });
      setSelectedIds(new Set());
      setRefreshKey((k) => k + 1);
    } finally {
      setBulkLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const visible = filteredContacts.map((c) => c.id);
    const allSelected = visible.every((id) => selectedIds.has(id));
    setSelectedIds(new Set(allSelected ? [] : visible));
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Pipeline</h2>
          {view === "deals" && (
            <p style={{ fontSize: 11, color: "#9ca3af" }}>
              Total: <span style={{ fontWeight: 600, color: "#374151" }}>${(total / 1000).toFixed(0)}K</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-gray-200" style={{ maxWidth: 200 }}>
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none flex-1 min-w-0" style={{ color: "#374151" }} />
          </div>
          <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => { setView(v); setSelectedIds(new Set()); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${view === v ? "bg-pk-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {v}
              </button>
            ))}
          </div>
          {view === "deals" && (
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="bg-white border border-gray-200 rounded-xl text-xs text-gray-600 px-2.5 py-1.5 outline-none focus:border-pk-500" style={{ height: 33 }}>
              <option value="valueDesc">Sort: Value ↓</option>
              <option value="valueAsc">Sort: Value ↑</option>
              <option value="closeDate">Sort: Close Date</option>
              <option value="created">Sort: Newest</option>
            </select>
          )}
          {view === "deals" && (
            <button className="btn-p text-xs px-3.5 py-2" onClick={() => setShowCreate(true)}><Plus className="w-3.5 h-3.5" />Add Deal</button>
          )}
        </div>
      </div>

      {view === "contacts" && (
        <ContactsView
          contacts={filteredContacts}
          categories={categories}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          selectedIds={selectedIds}
          onToggle={toggleSelection}
          onSelectAll={selectAll}
          bulkLoading={bulkLoading}
          onBulkStatus={handleBulkStatus}
        />
      )}

      {view === "opportunities" && (
        <OpportunitiesView
          contacts={opportunityContacts}
          categories={categories}
          onMutated={() => setRefreshKey((k) => k + 1)}
        />
      )}

      {view === "deals" && (
        <DealsView deals={filteredDeals} onSelectDeal={setSelectedDeal} />
      )}

      {showCreate && <CreateDealModal workspaceId={workspaceId} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); setRefreshKey((k) => k + 1); }} />}
      {selectedDeal && <DealDetailModal deal={selectedDeal} workspaceId={workspaceId} onClose={() => setSelectedDeal(null)} onMutated={() => setRefreshKey((k) => k + 1)} />}
    </>
  );
}

function ContactsView({
  contacts,
  categories,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  selectedIds,
  onToggle,
  onSelectAll,
  bulkLoading,
  onBulkStatus,
}: {
  contacts: Contact[];
  categories: ContactCategory[];
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  categoryFilter: string;
  setCategoryFilter: (s: string) => void;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  bulkLoading: boolean;
  onBulkStatus: (status: Contact["status"]) => void;
}) {
  const allSelected = contacts.length > 0 && contacts.every((c) => selectedIds.has(c.id));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-gray-200 rounded-xl text-xs text-gray-600 px-2.5 py-1.5 outline-none focus:border-pk-500" style={{ height: 33 }}>
          <option value="all">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="bg-white border border-gray-200 rounded-xl text-xs text-gray-600 px-2.5 py-1.5 outline-none focus:border-pk-500" style={{ height: 33 }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 ml-auto bg-pk-50 border border-pk-200 rounded-xl px-3 py-1.5">
            <span className="text-xs text-pk-700 font-medium">{selectedIds.size} selected</span>
            <button disabled={bulkLoading} onClick={() => onBulkStatus("qualified")} className="text-[10px] px-2 py-1 rounded bg-white text-pk-700 border border-pk-200 hover:bg-pk-100 disabled:opacity-60">Mark Qualified</button>
            <button disabled={bulkLoading} onClick={() => onBulkStatus("opportunity")} className="text-[10px] px-2 py-1 rounded bg-pk-600 text-white hover:bg-pk-700 disabled:opacity-60">Mark as Opportunity</button>
            <button disabled={bulkLoading} onClick={() => onBulkStatus("new")} className="text-[10px] px-2 py-1 rounded bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 disabled:opacity-60">Reset to New</button>
          </div>
        )}
      </div>

      <div className="surf overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allSelected} onChange={onSelectAll} className="rounded text-pk-600" />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Title</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No contacts found.</td></tr>
            )}
            {contacts.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: "1px solid #f9fafb" }}>
                <td className="px-4 py-3 w-10">
                  <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => onToggle(c.id)} className="rounded text-pk-600" />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{c.firstName} {c.lastName}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize ${c.status === "new" ? "bg-gray-100 text-gray-600" : c.status === "qualified" ? "bg-blue-50 text-blue-600" : c.status === "opportunity" ? "bg-pk-50 text-pk-600" : c.status === "customer" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{c.email || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{c.title || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{c.account?.name || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OpportunitiesView({ contacts, categories, onMutated }: { contacts: Contact[]; categories: ContactCategory[]; onMutated: () => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {contacts.length === 0 && (
        <div className="col-span-full surf p-8 text-center text-gray-400 text-sm">No opportunities yet.</div>
      )}
      {contacts.map((c) => (
        <OpportunityCard key={c.id} contact={c} categories={categories} onMutated={onMutated} />
      ))}
    </div>
  );
}

function OpportunityCard({ contact, categories, onMutated }: { contact: Contact; categories: ContactCategory[]; onMutated: () => void }) {
  const [loading, setLoading] = useState(false);
  const cats = categories.filter((cat) => contact.categoryIds?.includes(cat.id));

  const handleConvert = async () => {
    setLoading(true);
    try {
      await api.contacts.convertToDeal(contact.id);
      onMutated();
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="surf p-4 flex flex-col gap-3">
      <div>
        <p className="font-semibold text-sm text-gray-900">{contact.firstName} {contact.lastName}</p>
        <p className="text-xs text-gray-500">{contact.title || "—"} · {contact.account?.name || "No account"}</p>
      </div>
      {contact.email && <p className="text-xs text-gray-400 truncate">{contact.email}</p>}
      <div className="flex flex-wrap gap-1">
        {cats.map((cat) => (
          <span key={cat.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: (cat.color || "#ff1a97") + "20", color: cat.color || "#ff1a97" }}>
            {cat.name}
          </span>
        ))}
      </div>
      <button onClick={handleConvert} disabled={loading} className="btn-p mt-auto text-xs py-2 flex items-center justify-center gap-1 disabled:opacity-60">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
        Convert to Deal
      </button>
    </div>
  );
}

function DealsView({ deals, onSelectDeal }: { deals: Deal[]; onSelectDeal: (d: Deal) => void }) {
  return (
    <div className="flex gap-3 overflow-x-auto noscroll pb-3">
      {STAGES.map((stage) => {
        const items = deals.filter((d) => d.stage === stage.key);
        const stageTotal = items.reduce((sum, d) => sum + Number(d.value), 0);
        const won = stage.key === "won";
        return (
          <div key={stage.key} style={{ minWidth: 155, flexShrink: 0 }}>
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="w-2 h-2 rounded-full" style={{ background: stage.dot }} />
              <p style={{ fontSize: 9.5, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".05em" }}>{stage.label}</p>
              <span className="ml-auto" style={{ fontSize: 9, color: won ? "#16a34a" : "#9ca3af", fontWeight: won ? 600 : 400 }}>${(stageTotal / 1000).toFixed(0)}K</span>
            </div>
            {items.map((item) => {
              const hot = item.probability >= 50 && item.stage !== "won" && item.stage !== "lost";
              return (
                <div key={item.id} className={`pkc cursor-pointer hover:shadow-md transition-shadow ${won ? "border-green-100" : ""}`} style={hot ? { borderColor: "rgba(255,26,151,0.18)" } : {}} onClick={() => onSelectDeal(item)}>
                  <p style={{ fontWeight: 600, fontSize: 11, color: "#1f2937" }}>{item.name}</p>
                  <p style={{ color: hot ? "#b80055" : won ? "#16a34a" : "#9ca3af", fontSize: 10, marginTop: 2, fontWeight: hot || won ? 600 : 400 }}>
                    ${Number(item.value).toLocaleString()} {item.probability > 0 ? `· ${item.probability}%` : ""}
                  </p>
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="pkc text-center text-gray-400 text-xs py-2">No deals</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DealDetailModal({ deal, workspaceId, onClose, onMutated }: { deal: Deal; workspaceId: string; onClose: () => void; onMutated: () => void }) {
  const [editMode, setEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(deal.name);
  const [stage, setStage] = useState<DealStage>(deal.stage);
  const [value, setValue] = useState(String(deal.value));
  const [probability, setProbability] = useState(String(deal.probability));
  const [closeDate, setCloseDate] = useState(deal.closeDate ? deal.closeDate.slice(0, 10) : "");
  const [description, setDescription] = useState(deal.description || "");
  const [accountId, setAccountId] = useState(deal.accountId || "");
  const [contactId, setContactId] = useState(deal.contactId || "");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    Promise.all([
      api.accounts.list(workspaceId).catch(() => []),
      api.contacts.list(workspaceId).catch(() => []),
    ]).then(([a, c]) => { setAccounts(a); setContacts(c); });
  }, [workspaceId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.deals.update(deal.id, {
        name,
        stage,
        value: value ? Number(value) : 0,
        probability: probability ? Number(probability) : 0,
        closeDate: closeDate || undefined,
        description: description || undefined,
        accountId: accountId || undefined,
        contactId: contactId || undefined,
      });
      setEditMode(false);
      onMutated();
    } catch (err: any) {
      setError(err.message || "Failed to update deal");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deals.delete(deal.id);
      onClose();
      onMutated();
    } catch (err: any) {
      setError(err.message || "Failed to delete deal");
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
          <h2 className="font-bold text-lg text-gray-900">{editMode ? "Edit Deal" : deal.name}</h2>
          <div className="flex items-center gap-1">
            {!editMode && (
              <>
                <button onClick={() => setEditMode(true)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500" title="Edit"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setConfirmDelete(true)} className="p-2 rounded-full hover:bg-red-50 text-red-500" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
          </div>
        </div>
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}

        {confirmDelete ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-700 mb-4">Are you sure you want to delete this deal? This cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={loading} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60">Delete</button>
            </div>
          </div>
        ) : editMode ? (
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Deal Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={selClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Stage</label>
                <select value={stage} onChange={(e) => setStage(e.target.value as DealStage)} className={selClass}>
                  {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Value</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} className={`${selClass} pl-10`} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Probability (%)</label>
                <input type="number" min="0" max="100" value={probability} onChange={(e) => setProbability(e.target.value)} className={selClass} />
              </div>
              <div>
                <label className={labelClass}>Close Date</label>
                <input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} className={selClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Account</label>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={selClass}>
                <option value="">None</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Contact</label>
              <select value={contactId} onChange={(e) => setContactId(e.target.value)} className={selClass}>
                <option value="">None</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={selClass} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditMode(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 btn-p justify-center py-2.5 text-sm disabled:opacity-60">{loading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Stage</span><span className="font-medium capitalize">{deal.stage}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Value</span><span className="font-medium">${Number(deal.value).toLocaleString()}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Probability</span><span className="font-medium">{deal.probability}%</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Close Date</span><span className="font-medium">{deal.closeDate ? new Date(deal.closeDate).toLocaleDateString() : "—"}</span></div>
            {deal.account && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Account</span><span className="font-medium">{deal.account.name}</span></div>}
            {deal.contact && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Contact</span><span className="font-medium">{deal.contact.firstName} {deal.contact.lastName}</span></div>}
            {deal.description && <div className="py-2"><span className="text-gray-500 block mb-1">Description</span><p className="text-gray-800">{deal.description}</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateDealModal({ workspaceId, onClose, onCreated }: { workspaceId: string; onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("");
  const [stage, setStage] = useState<DealStage>("lead");
  const [value, setValue] = useState("");
  const [probability, setProbability] = useState("");
  const [closeDate, setCloseDate] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [contactId, setContactId] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      api.accounts.list(workspaceId).catch(() => []),
      api.contacts.list(workspaceId).catch(() => []),
    ]).then(([a, c]) => {
      setAccounts(a);
      setContacts(c);
      setFetching(false);
    });
  }, [workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Deal name is required"); return; }
    setLoading(true);
    try {
      await api.deals.create({
        workspaceId,
        name,
        stage,
        value: value ? Number(value) : 0,
        currency: "USD",
        probability: probability ? Number(probability) : 0,
        closeDate: closeDate || undefined,
        description,
        accountId: accountId || undefined,
        contactId: contactId || undefined,
      });
      onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create deal");
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
          <h2 className="font-bold text-lg text-gray-900">New Deal</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
        {fetching ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-pk-600" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Deal Name *</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp - Q3 Expansion" className={selClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Stage</label>
                <select value={stage} onChange={(e) => setStage(e.target.value as DealStage)} className={selClass}>
                  {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Value</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" className={`${selClass} pl-10`} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Probability (%)</label>
                <input type="number" min="0" max="100" value={probability} onChange={(e) => setProbability(e.target.value)} placeholder="0-100" className={selClass} />
              </div>
              <div>
                <label className={labelClass}>Close Date</label>
                <input type="date" value={closeDate} onChange={(e) => setCloseDate(e.target.value)} className={selClass} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Account</label>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={selClass}>
                <option value="">None</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Contact</label>
              <select value={contactId} onChange={(e) => setContactId(e.target.value)} className={selClass}>
                <option value="">None</option>
                {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Notes about this deal..." rows={3} className={selClass} />
            </div>
            <button type="submit" disabled={loading} className="btn-p w-full justify-center py-3 text-sm disabled:opacity-60">
              {loading ? "Creating..." : "Create Deal"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
