"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Plus, X, Mic, FileText, Phone, Mail, MessageSquare, Pencil, Trash2, Search, Wand2, Zap, Tag, DollarSign, Calendar, User, Briefcase, Mail as MailIcon, Phone as PhoneIcon, AlertCircle } from "lucide-react";
import { api, Note, NoteType, Contact, Deal } from "@/lib/api";
import { analyzeNote, cognizantEdit, AiInsights } from "@/lib/ai-notes";
import { useSpeechRecognition } from "@/lib/speech";

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
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | NoteType>("all");

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

  const filteredNotes = notes.filter((n) => {
    const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || n.type === filterType;
    return matchesSearch && matchesType;
  });

  const total = notes.length;
  const withAi = notes.filter((n) => n.aiSummary).length;
  const allActionItems = notes.flatMap((n) => analyzeNote(n.content).actionItems);
  const totalProcessedMins = Math.round(notes.reduce((sum, n) => sum + n.content.split(/\s+/).length, 0) / 130); // ~130 wpm

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
          {[
            { v: String(total), l: "Notes this week" },
            { v: String(allActionItems.length), l: "Actions extracted" },
            { v: withAi > 0 ? `${Math.round((withAi / total) * 100)}%` : "0%", l: "With AI Summary", pink: true },
            { v: `${totalProcessedMins}m`, l: "Processed" },
          ].map((s) => (
            <div key={s.l} className="surf p-4 text-center">
              <p style={{ fontSize: 22, fontWeight: 900, color: s.pink ? "#b80055" : "#0d0d12" }}>{s.v}</p>
              <p style={{ fontSize: 10.5, color: "#9ca3af", marginTop: 2 }}>{s.l}</p>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1.5 border border-gray-200" style={{ maxWidth: 180 }}>
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input type="text" placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-transparent text-sm outline-none flex-1 min-w-0" style={{ color: "#374151" }} />
          </div>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="bg-white border border-gray-200 rounded-xl text-xs text-gray-600 px-2.5 py-1.5 outline-none focus:border-pk-500" style={{ height: 33 }}>
            <option value="all">All types</option>
            {NOTE_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button className="btn-p text-xs px-3.5 py-2" onClick={() => setShowCreate(true)}>
            <Plus className="w-3.5 h-3.5" />New Note
          </button>
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="surf p-8 text-center text-gray-500 text-sm">{notes.length === 0 ? "No notes yet." : "No notes match your filters."}</div>
      ) : (
        filteredNotes.map((note) => (
          <div key={note.id} className="surf p-6 mb-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedNote(note)}>
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
      {selectedNote && <NoteDetailModal note={selectedNote} workspaceId={workspaceId} onClose={() => setSelectedNote(null)} onMutated={() => setRefreshKey((k) => k + 1)} />}
    </>
  );
}

function NoteDetailModal({ note, workspaceId, onClose, onMutated }: { note: Note; workspaceId: string; onClose: () => void; onMutated: () => void }) {
  const [editMode, setEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [type, setType] = useState<NoteType>(note.type);
  const [contactId, setContactId] = useState(note.contactId || "");
  const [dealId, setDealId] = useState(note.dealId || "");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    Promise.all([
      api.contacts.list(workspaceId).catch(() => []),
      api.deals.list(workspaceId).catch(() => []),
    ]).then(([c, d]) => { setContacts(c); setDeals(d); });
  }, [workspaceId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.notes.update(note.id, { title, content, type, contactId: contactId || undefined, dealId: dealId || undefined });
      setEditMode(false);
      onMutated();
    } catch (err: any) {
      setError(err.message || "Failed to update note");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.notes.delete(note.id);
      onClose();
      onMutated();
    } catch (err: any) {
      setError(err.message || "Failed to delete note");
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
          <h2 className="font-bold text-lg text-gray-900">{editMode ? "Edit Note" : note.title}</h2>
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
            <p className="text-sm text-gray-700 mb-4">Are you sure you want to delete this note? This cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDelete(false)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={loading} className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-60">Delete</button>
            </div>
          </div>
        ) : editMode ? (
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Title *</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={selClass} />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <div className="flex flex-wrap gap-2">
                {NOTE_TYPE_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setType(opt.value)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${type === opt.value ? "border-pk-500 text-pk-700 bg-pink-50" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                    {opt.icon}{opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className={labelClass}>Content *</label>
              <textarea required value={content} onChange={(e) => setContent(e.target.value)} rows={6} className={selClass} />
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
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditMode(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 btn-p justify-center py-2.5 text-sm disabled:opacity-60">{loading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Type</span><span className="font-medium capitalize">{note.type.replace("_", " ")}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Author</span><span className="font-medium">{note.author?.name || "Unknown"}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Date</span><span className="font-medium">{new Date(note.createdAt).toLocaleDateString()}</span></div>
            {note.contact && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Contact</span><span className="font-medium">{note.contact.firstName} {note.contact.lastName}</span></div>}
            <div className="py-2"><span className="text-gray-500 block mb-1">Content</span><p className="text-gray-800 whitespace-pre-wrap">{note.content}</p></div>
          </div>
        )}
      </div>
    </div>
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
  const [insights, setInsights] = useState<AiInsights | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");
  const speech = useSpeechRecognition();

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

  // Auto-run AI analysis when content changes (debounced)
  useEffect(() => {
    if (!content.trim()) {
      setInsights(null);
      return;
    }
    const timer = setTimeout(() => {
      const result = analyzeNote(content);
      setInsights(result);
    }, 600);
    return () => clearTimeout(timer);
  }, [content]);

  // Sync speech transcript into content
  useEffect(() => {
    if (speech.isListening || speech.transcript || speech.interimTranscript) {
      const full = speech.transcript + speech.interimTranscript;
      setTranscriptText(full);
    }
  }, [speech.transcript, speech.interimTranscript, speech.isListening]);

  const applyTranscript = () => {
    const final = speech.getFinal();
    setContent((prev) => (prev ? prev + " " + final : final).trim());
    setTranscriptText("");
    speech.clear();
    setIsTranscribing(false);
  };

  const handleCognizantEdit = () => {
    if (!content.trim()) return;
    const polished = cognizantEdit(content);
    setContent(polished);
  };

  const autoSuggestTitle = () => {
    if (!content.trim()) return;
    const sentences = content.split(/[.!?]/).map((s) => s.trim()).filter(Boolean);
    if (sentences.length > 0) {
      const first = sentences[0];
      const candidate = first.length > 60 ? first.slice(0, 60) + "..." : first;
      setTitle(candidate);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !content.trim()) { setError("Title and content are required"); return; }
    setLoading(true);
    try {
      const ai = analyzeNote(content);
      await api.notes.create({
        workspaceId,
        title,
        content,
        type,
        contactId: contactId || undefined,
        dealId: dealId || undefined,
        aiSummary: ai.summary,
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
      <div className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-900">New Note</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
        {fetching ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-pk-600" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelClass}>Title *</label>
                  <div className="flex gap-2">
                    <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Q3 Review Call with Acme Corp" className={selClass} />
                    {content.trim() && !title && (
                      <button type="button" onClick={autoSuggestTitle} className="flex-shrink-0 px-3 py-2 rounded-xl border border-pk-200 text-pk-600 text-xs hover:bg-pink-50 transition-colors" title="Auto-suggest from content">
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label className={labelClass}>Content *</label>
                    <div className="flex items-center gap-1.5">
                      {speech.isSupported && (
                        <button
                          type="button"
                          onClick={() => {
                            if (speech.isListening) {
                              speech.stop();
                              applyTranscript();
                              setIsTranscribing(false);
                            } else {
                              speech.start();
                              setIsTranscribing(true);
                            }
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors ${
                            speech.isListening
                              ? "bg-red-50 text-red-600 border border-red-200 animate-pulse"
                              : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-pk-300"
                          }`}
                        >
                          <Mic className="w-3 h-3" />
                          {speech.isListening ? "Stop" : "Record"}
                        </button>
                      )}
                      {content.trim().length > 20 && (
                        <button
                          type="button"
                          onClick={handleCognizantEdit}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-pink-50 text-pk-600 border border-pink-200 hover:bg-pink-100 transition-colors"
                          title="Clean up grammar, remove filler words, structure sentences"
                        >
                          <Wand2 className="w-3 h-3" />
                          Cognizant Edit
                        </button>
                      )}
                    </div>
                  </div>

                  {isTranscribing && (
                    <div className="mb-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Recording...</span>
                      </div>
                      <p className="text-sm text-gray-700 italic">{transcriptText || "Listening..."}</p>
                    </div>
                  )}

                  <textarea required value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your notes here, or click Record to transcribe speech..." rows={6} className={selClass} />
                  {speech.error && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />{speech.error}
                    </p>
                  )}
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
              </div>

              {/* AI Insights Panel */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Insights</p>
                  {insights && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      insights.sentiment === "positive" ? "bg-green-50 text-green-600" :
                      insights.sentiment === "negative" ? "bg-red-50 text-red-600" :
                      "bg-gray-100 text-gray-500"
                    }`}>
                      {insights.sentiment}
                    </span>
                  )}
                </div>

                {!insights ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-gray-50 border border-gray-100">
                    <Sparkles className="w-6 h-6 text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400">Start typing to see AI insights</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 overflow-y-auto max-h-[420px]">
                    {/* Summary */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Summary</p>
                      <p className="text-xs text-gray-700 leading-relaxed">{insights.summary}</p>
                    </div>

                    {/* Action Items */}
                    {insights.actionItems.length > 0 && (
                      <div className="bg-pink-50 rounded-xl p-3 border border-pink-100">
                        <p className="text-[10px] font-bold text-pk-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Zap className="w-3 h-3" />Action Items ({insights.actionItems.length})
                        </p>
                        <ul className="flex flex-col gap-1.5">
                          {insights.actionItems.map((item, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-700">
                              <span className="w-4 h-4 rounded bg-white border border-pink-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[8px] font-bold text-pk-600">{i + 1}</span>
                              </span>
                              <span className="leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Entities */}
                    {insights.entities.length > 0 && (
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Detected</p>
                        <div className="flex flex-wrap gap-1.5">
                          {insights.entities.map((e, i) => {
                            const icons: Record<string, React.ReactNode> = {
                              email: <MailIcon className="w-2.5 h-2.5" />,
                              phone: <PhoneIcon className="w-2.5 h-2.5" />,
                              amount: <DollarSign className="w-2.5 h-2.5" />,
                              date: <Calendar className="w-2.5 h-2.5" />,
                              person: <User className="w-2.5 h-2.5" />,
                              company: <Briefcase className="w-2.5 h-2.5" />,
                            };
                            return (
                              <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white border border-gray-200 text-[10px] text-gray-600">
                                {icons[e.type] || <Tag className="w-2.5 h-2.5" />}
                                <span className="font-medium">{e.value}</span>
                                <span className="text-gray-300 capitalize">{e.type}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {insights.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {insights.tags.map((t) => (
                          <span key={t} className="px-2.5 py-1 rounded-lg bg-pink-50 border border-pink-100 text-[10px] font-semibold text-pk-600">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
