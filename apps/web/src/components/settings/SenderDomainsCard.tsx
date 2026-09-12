"use client";

import { Loader2, Plus, Trash2, CheckCircle, AlertTriangle, Clock, Copy, Globe } from "lucide-react";
import type { SenderDomain } from "./SendingDomainsPanel";

interface Props {
  domains: SenderDomain[];
  busy: string | null;
  newDomain: string;
  setNewDomain: (v: string) => void;
  expanded: string | null;
  detail: any;
  onAdd: () => void;
  onVerify: (id: string) => void;
  onRemove: (id: string, domain: string) => void;
  onSetDefault: (id: string) => void;
  onCopy: (text: string) => void;
}

function badge(status: string) {
  if (status === "verified") {
    return <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold"><CheckCircle className="w-3 h-3" /> Verified</span>;
  }
  if (status === "failed") {
    return <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-semibold"><AlertTriangle className="w-3 h-3" /> Failed</span>;
  }
  return <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-semibold"><Clock className="w-3 h-3" /> Pending</span>;
}

export default function SenderDomainsCard(p: Props) {
  return (
    <div className="surf p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Globe className="w-4 h-4 text-pk-600" /> Sending domains</h3>
        <span className="text-[11px] text-gray-400">e.g. mail.kreatixtech.com</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">Bulk mail is isolated on a subdomain so complaints never burn your root domain reputation.</p>
      <div className="flex gap-2 mb-4">
        <input className="input flex-1" placeholder="mail.kreatixtech.com" value={p.newDomain} onChange={(e) => p.setNewDomain(e.target.value)} />
        <button onClick={p.onAdd} disabled={p.busy === "add-domain" || !p.newDomain.trim()} className="btn-p text-xs px-3 py-2">
          {p.busy === "add-domain" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span className="inline-flex items-center"><Plus className="w-3.5 h-3.5 mr-1" />Add</span>}
        </button>
      </div>
      <div className="space-y-2">
        {p.domains.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No sending domains yet.</p>}
        {p.domains.map((d) => (
          <div key={d.id} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between gap-2 p-3 bg-white">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-semibold text-gray-800 truncate">{d.domain}</span>
                {badge(d.status)}
                {d.isDefault && <span className="text-[10px] px-2 py-0.5 rounded-full bg-pk-50 text-pk-700 font-semibold">Default</span>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!d.isDefault && <button onClick={() => p.onSetDefault(d.id)} className="text-[11px] px-2 py-1 rounded hover:bg-gray-100 text-gray-600">Set default</button>}
                <button onClick={() => p.onVerify(d.id)} disabled={p.busy === `verify-${d.id}`} className="text-[11px] px-2 py-1 rounded bg-pk-50 text-pk-700 hover:bg-pk-100 font-semibold">
                  {p.busy === `verify-${d.id}` ? "Checking..." : "Verify DNS"}
                </button>
                <button onClick={() => p.onRemove(d.id, d.domain)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            {d.lastError && <p className="px-3 py-1.5 text-[11px] text-amber-700 bg-amber-50 border-t border-amber-100">{d.lastError}</p>}
            {p.expanded === d.id && p.detail && p.detail.domain && p.detail.domain.id === d.id && (
              <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-2">
                <CheckRow ok={p.detail.checks.spfOk} text={p.detail.checks.spfDetail} />
                <CheckRow ok={p.detail.checks.dkimOk} text={p.detail.checks.dkimDetail} />
                <CheckRow ok={p.detail.checks.dmarcOk} text={p.detail.checks.dmarcDetail} />
                <div className="mt-2">
                  <p className="text-[11px] font-bold text-gray-700 mb-1">DNS records to add:</p>
                  {p.detail.dnsRecords.map((r: { type: string; host: string; value: string; purpose: string }, i: number) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-2 mb-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-gray-800">{r.type} — {r.host}</span>
                        <button onClick={() => p.onCopy(r.value)} className="p-1 rounded hover:bg-gray-100 text-gray-500"><Copy className="w-3 h-3" /></button>
                      </div>
                      <p className="font-mono text-gray-600 break-all mt-0.5">{r.value}</p>
                      <p className="text-gray-400 mt-0.5">{r.purpose}</p>
                    </div>
                  ))}
                  <p className="text-[11px] text-gray-500 mt-1">{p.detail.dkimInstructions}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      {ok ? <CheckCircle className="w-3.5 h-3.5 text-green-600 mt-0.5" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5" />}
      <span className="text-gray-600">{text}</span>
    </div>
  );
}
