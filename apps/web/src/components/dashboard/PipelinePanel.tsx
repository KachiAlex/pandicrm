"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, X, DollarSign } from "lucide-react";
import { api, Deal, DealStage, Account, Contact } from "@/lib/api";

const STAGES: { key: DealStage; label: string; dot: string }[] = [
  { key: "lead", label: "Lead", dot: "#9ca3af" },
  { key: "qualify", label: "Qualify", dot: "#ffadd9" },
  { key: "propose", label: "Propose", dot: "#f59e0b" },
  { key: "negotiate", label: "Negotiate", dot: "#a78bfa" },
  { key: "won", label: "Won", dot: "#4ade80" },
  { key: "lost", label: "Lost", dot: "#ef4444" },
];

export default function PipelinePanel({ workspaceId }: { workspaceId: string }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    api.deals.list(workspaceId).then((data) => {
      setDeals(data);
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

  const total = deals.reduce((sum, d) => sum + Number(d.value), 0);

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Sales Pipeline</h2>
          <p style={{ fontSize: 11, color: "#9ca3af" }}>
            Total: <span style={{ fontWeight: 600, color: "#374151" }}>${(total / 1000).toFixed(0)}K</span>
          </p>
        </div>
        <button className="btn-p text-xs px-3.5 py-2" onClick={() => setShowCreate(true)}><Plus className="w-3.5 h-3.5" />Add Deal</button>
      </div>
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
                  <div key={item.id} className={`pkc ${won ? "border-green-100" : ""}`} style={hot ? { borderColor: "rgba(255,26,151,0.18)" } : {}}>
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

      {showCreate && <CreateDealModal workspaceId={workspaceId} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); setRefreshKey((k) => k + 1); }} />}
    </>
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
