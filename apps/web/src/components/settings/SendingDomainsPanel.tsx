"use client";

import { useEffect, useState } from "react";
import { api, DnsCheckResult, DnsRecord } from "@/lib/api";
import SenderDomainsCard from "./SenderDomainsCard";
import SenderIdentitiesCard from "./SenderIdentitiesCard";
import { Loader2, ShieldCheck } from "lucide-react";

export interface SenderDomain {
  id: string;
  domain: string;
  status: "pending" | "verified" | "failed";
  spfOk: boolean;
  dkimOk: boolean;
  dmarcOk: boolean;
  isDefault: boolean;
  lastError?: string | null;
}

export interface SenderIdentity {
  id: string;
  name: string;
  email: string;
  replyTo?: string | null;
  isDefault: boolean;
  isVerified: boolean;
  domain?: SenderDomain | null;
}

export interface SenderDomainDetail {
  domain: SenderDomain;
  checks: DnsCheckResult;
  dnsRecords: DnsRecord[];
  dkimInstructions: string;
}

interface Props {
  workspaceId: string;
  role?: string;
}

export default function SendingDomainsPanel({ workspaceId, role }: Props) {
  const [domains, setDomains] = useState<SenderDomain[]>([]);
  const [senders, setSenders] = useState<SenderIdentity[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [newDomain, setNewDomain] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [detail, setDetail] = useState<SenderDomainDetail | null>(null);
  const [senderForm, setSenderForm] = useState({ name: "", email: "", replyTo: "" });

  const isAdmin = role === "owner" || role === "admin";

  const load = async () => {
    try {
      const [d, s] = await Promise.all([
        api.senderDomains.list(workspaceId),
        api.senderIdentities.list(workspaceId),
      ]);
      setDomains(d);
      setSenders(s);
    } catch (err: any) {
      setMessage({ kind: "err", text: err.message || "Failed to load sending setup" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const addDomain = async () => {
    if (!newDomain.trim()) return;
    setBusy("add-domain");
    setMessage(null);
    try {
      const res = await api.senderDomains.create({ workspaceId, domain: newDomain.trim() });
      setNewDomain("");
      setExpanded((d) => d === res.id || d === "" ? res.id : d);
      setDetail({
        domain: res,
        checks: {
          spfOk: false,
          spfDetail: "SPF record not verified",
          dkimOk: false,
          dkimDetail: "DKIM record not verified",
          dmarcOk: false,
          dmarcDetail: "DMARC record not verified",
          allOk: false,
        },
        dnsRecords: res.dnsRecords,
        dkimInstructions: res.dkimInstructions,
      });
      setMessage({ kind: "ok", text: `Domain added. Add the DNS records shown, then click Verify DNS.` });
      await load();
    } catch (err: any) {
      setMessage({ kind: "err", text: err.message || "Failed to add domain" });
    } finally {
      setBusy(null);
    }
  };

  const verifyDomain = async (id: string) => {
    setBusy(`verify-${id}`);
    setMessage(null);
    try {
      const res = await api.senderDomains.verify(id);
      setExpanded(res.domain.id);
      setDetail(res);
      setMessage(
        res.domain.status === "verified"
          ? { kind: "ok", text: "Domain verified — senders on this domain are now unblocked." }
          : { kind: "err", text: "DNS check incomplete — see the missing records below." }
      );
      await load();
    } catch (err: any) {
      setMessage({ kind: "err", text: err.message || "Verification failed" });
    } finally {
      setBusy(null);
    }
  };

  const removeDomain = async (id: string, domain: string) => {
    if (!confirm(`Remove sending domain "${domain}"?`)) return;
    setBusy(`del-${id}`);
    try {
      await api.senderDomains.remove(id);
      await load();
    } catch (err: any) {
      setMessage({ kind: "err", text: err.message || "Failed to remove domain" });
    } finally {
      setBusy(null);
    }
  };

  const setDefaultDomain = async (id: string) => {
    setBusy(`def-${id}`);
    try {
      await api.senderDomains.setDefault(id);
      await load();
    } catch (err: any) {
      setMessage({ kind: "err", text: err.message || "Failed to set default" });
    } finally {
      setBusy(null);
    }
  };

  const addSender = async () => {
    if (!senderForm.email.trim() || !senderForm.name.trim()) return;
    setBusy("add-sender");
    setMessage(null);
    try {
      const res: any = await api.senderIdentities.create({ workspaceId, ...senderForm });
      setSenderForm({ name: "", email: "", replyTo: "" });
      if (res.warning) setMessage({ kind: "err", text: res.warning });
      else setMessage({ kind: "ok", text: "Sender added." });
      await load();
    } catch (err: any) {
      setMessage({ kind: "err", text: err.message || "Failed to add sender" });
    } finally {
      setBusy(null);
    }
  };

  const removeSender = async (id: string, email: string) => {
    if (!confirm(`Remove sender "${email}"?`)) return;
    setBusy(`sdel-${id}`);
    try {
      await api.senderIdentities.remove(id);
      await load();
    } catch (err: any) {
      setMessage({ kind: "err", text: err.message || "Failed to remove sender" });
    } finally {
      setBusy(null);
    }
  };

  const setDefaultSender = async (id: string) => {
    setBusy(`sdef-${id}`);
    try {
      await api.senderIdentities.setDefault(id);
      await load();
    } catch (err: any) {
      setMessage({ kind: "err", text: err.message || "Failed to set default" });
    } finally {
      setBusy(null);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
  };

  if (loading) {
    return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-pk-600" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="surf p-6 text-center">
        <ShieldCheck className="w-8 h-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Only workspace owners and admins can manage sending domains.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {message && (
        <div className={`rounded-xl border px-3 py-2 text-sm ${message.kind === "ok" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
          {message.text}
        </div>
      )}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs text-blue-800">
        Register a subdomain such as <span className="font-semibold">mail.kreatixtech.com</span>, verify the DNS records, then create a sender identity like <span className="font-semibold">hello@mail.kreatixtech.com</span>. If your admin has configured the platform default sender in the server environment, campaigns can send without adding a workspace identity.
      </div>
      <SenderDomainsCard
        domains={domains}
        busy={busy}
        newDomain={newDomain}
        setNewDomain={setNewDomain}
        expanded={expanded}
        detail={detail}
        onAdd={addDomain}
        onVerify={verifyDomain}
        onRemove={removeDomain}
        onSetDefault={setDefaultDomain}
        onCopy={copy}
      />
      <SenderIdentitiesCard
        senders={senders}
        busy={busy}
        form={senderForm}
        setForm={setSenderForm}
        onAdd={addSender}
        onRemove={removeSender}
        onSetDefault={setDefaultSender}
      />
    </div>
  );
}
