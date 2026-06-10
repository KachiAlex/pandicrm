"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Plus, X, Mic, FileText, Phone, Mail, MessageSquare } from "lucide-react";
import { api, Note, NoteType, Contact, Deal } from "@/lib/api";

const NOTE_TYPE_OPTIONS: { value: NoteType; label: string; icon: React.ReactNode }[] = [
  { value: "manual", label: "Manual", icon: <FileText className="w-3.5 h-3.5" /> },
  { value: "meeting", label: "Meeting", icon: <Mic className="w-3.5 h-3.5" /> },
  { value: "call", label: "Call", icon: <Phone className="w-3.5 h-3.5" /> },
  { value: "email", label: "Email", icon: <Mail className="w-3.5 h-3.5" /> },
  { value: "document", label: "Document", icon: <FileText className="w-3.5 h-3.5" /> },
  { value: "voice_memo", label: "Voice Memo", icon: <MessageSquare className="w-3.5 h-3.5" /> },
];

export default function NotesPanel({ workspaceId }: { workspaceId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    api.notes.list(workspaceId).then((data) => {
      setNotes(data);
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

  const total = notes.length;
  const withAi = notes.filter((n) => n.aiSummary).length;

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
          {[
            { v: String(total), l: "Notes this week" },
            { v: "0", l: "Actions extracted" },
            { v: withAi > 0 ? `${Math.round((withAi / total) * 100)}%` : "0%", l: "With AI Summary", pink: true },
            { v: "4.2h", l: "Processed" },
          ].map((s) => (
            <div key={s.l} className="surf p-4 text-center">
              <p style={{ fontSize: 22, fontWeight: 900, color: s.pink ? "#b80055" : "#0d0d12" }}>{s.v}</p>
              <p style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 2 }}>{s.l}</p>
            </div>
          ))}
        </div>
        <button className="btn-p text-xs px-3.5 py-2 ml-4 flex-shrink-0" onClick={() => setShowCreate(true)}>
          <Plus className="w-3.5 h-3.5" />New Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="surf p-8 text-center text-gray-500 text-sm">No notes yet.</div>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="surf p-6 mb-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg,#ff1a97,#b80055)" }}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#1f2937" }}>{note.title}</p>
                <p style={{ fontSize: 11, color: "#9ca3af" }}>
                  {new Date(note.createdAt).toLocaleDateString()} &middot; {note.author?.name || "Unknown"}
                </p>
              </div>
              <span className="ml-auto" style={{ fontSize: 10, fontWeight: 700, color: "#b80055", background: "#fff0f7", padding: "5px 11px", borderRadius: 999, border: "1px solid rgba(184,0,85,0.1)" }}>
                {note.type}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p style={{ fontSize: 9.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>Summary</p>
                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.65 }}>{note.aiSummary || note.content.slice(0, 200) + (note.content.length > 200 ? "..." : "")}</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <p style={{ fontSize: 9.5, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>Content</p>
                <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.65 }}>{note.content}</p>
              </div>
            </div>
          </div>
        ))
      )}

      {showCreate && <CreateNoteModal workspaceId={workspaceId} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); setRefreshKey((k) => k + 1); }} />}
    </>
  );
}

function CreateNoteModal({ workspaceId, onClose, onCreated }: { workspaceId: string; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<NoteType>("manual");
  const [contactId, setContactId] = useState("");
  const [dealId, setDealId] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      api.contacts.list(workspaceId).catch(() => []),
      api.deals.list(workspaceId).catch(() => []),
    ]).then(([c, d]) => {
      setContacts(c);
      setDeals(d);
      setFetching(false);
    });
  }, [workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !content.trim()) { setError("Title and content are required"); return; }
    setLoading(true);
    try {
      await api.notes.create({
        workspaceId,
        title,
        content,
        type,
        contactId: contactId || undefined,
        dealId: dealId || undefined,
      });
      onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create note");
      setLoading(false);
    }
  };

  const selClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-pk-500 focus:ring-1 focus:ring-pk-500 transition-colors bg-white";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-900">New Note</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
        {fetching ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-pk-600" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Title *</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Q3 Review Call with Acme Corp" className={selClass} />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <div className="flex flex-wrap gap-2">
                {NOTE_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                      type === opt.value
                        ? "border-pk-500 text-pk-700 bg-pink-50"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {opt.icon}{opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Content *</label>
              <textarea required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your notes here..." rows={6} className={selClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Related Contact</label>
                <select value={contactId} onChange={(e) => setContactId(e.target.value)} className={selClass}>
                  <option value="">None</option>
                  {contacts.map((c) => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Related Deal</label>
                <select value={dealId} onChange={(e) => setDealId(e.target.value)} className={selClass}>
                  <option value="">None</option>
                  {deals.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-p w-full justify-center py-3 text-sm disabled:opacity-60">
              {loading ? "Creating..." : "Create Note"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
