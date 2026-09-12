"use client";

import { Loader2, Plus, Trash2, Mail } from "lucide-react";
import type { SenderIdentity } from "./SendingDomainsPanel";

interface Props {
  senders: SenderIdentity[];
  busy: string | null;
  form: { name: string; email: string; replyTo: string };
  setForm: (v: { name: string; email: string; replyTo: string }) => void;
  onAdd: () => void;
  onRemove: (id: string, email: string) => void;
  onSetDefault: (id: string) => void;
}

export default function SenderIdentitiesCard(p: Props) {
  return (
    <div className="surf p-5">
      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-1"><Mail className="w-4 h-4 text-pk-600" /> Sender identities</h3>
      <p className="text-xs text-gray-500 mb-4">Each From address must sit on a registered domain. Replies can go to your normal inbox.</p>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
        <input className="input" placeholder="Kreatix Marketing" value={p.form.name} onChange={(e) => p.setForm({ ...p.form, name: e.target.value })} />
        <input className="input" placeholder="hello@mail.kreatixtech.com" value={p.form.email} onChange={(e) => p.setForm({ ...p.form, email: e.target.value })} />
        <input className="input" placeholder="Reply-To (optional)" value={p.form.replyTo} onChange={(e) => p.setForm({ ...p.form, replyTo: e.target.value })} />
        <button onClick={p.onAdd} disabled={p.busy === "add-sender" || !p.form.email.trim() || !p.form.name.trim()} className="btn-p text-xs px-3 py-2">
          {p.busy === "add-sender" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="inline-flex items-center"><Plus className="w-3.5 h-3.5 mr-1" />Add sender</span>}
        </button>
      </div>
      <div className="space-y-2">
        {p.senders.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No senders yet.</p>}
        {p.senders.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-pk-50 flex items-center justify-center text-pk-600 shrink-0"><Mail className="w-4 h-4" /></div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{s.name} <span className="font-normal text-gray-500">&lt;{s.email}&gt;</span></p>
                <p className="text-[10px] text-gray-500">{s.domain ? `${s.domain.domain} — ${s.domain.status}` : "legacy"}{s.replyTo ? ` — replies to ${s.replyTo}` : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {s.isVerified
                ? <span className="text-[10px] px-2 py-1 rounded bg-green-50 text-green-600 font-semibold">Verified</span>
                : <span className="text-[10px] px-2 py-1 rounded bg-amber-50 text-amber-700 font-semibold">Unverified</span>}
              {s.isDefault && <span className="text-[10px] px-2 py-1 rounded bg-pk-50 text-pk-700 font-semibold">Default</span>}
              {!s.isDefault && <button onClick={() => p.onSetDefault(s.id)} className="text-[11px] px-2 py-1 rounded hover:bg-gray-100 text-gray-600">Set default</button>}
              <button onClick={() => p.onRemove(s.id, s.email)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
