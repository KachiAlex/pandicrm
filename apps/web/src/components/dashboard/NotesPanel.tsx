"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { api, Note } from "@/lib/api";

export default function NotesPanel({ workspaceId }: { workspaceId: string }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    api.notes.list(workspaceId).then((data) => {
      setNotes(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [workspaceId]);

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
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
    </>
  );
}
