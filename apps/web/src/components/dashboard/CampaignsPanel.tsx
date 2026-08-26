"use client";

import { useState, useEffect } from "react";
import { Mail, Plus, Loader2, Send, BarChart3, Trash2, CheckCircle, XCircle, Clock, Eye, MousePointerClick } from "lucide-react";
import { api, EmailCampaign, CampaignStats } from "@/lib/api";
import CampaignEmailEditor from "./CampaignEmailEditor";

export default function CampaignsPanel({ workspaceId }: { workspaceId: string }) {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await api.campaigns.list(workspaceId);
      setCampaigns(data);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [workspaceId]);

  if (selectedCampaign) {
    return <CampaignDetail campaignId={selectedCampaign} workspaceId={workspaceId} onBack={() => setSelectedCampaign(null)} />;
  }

  if (showCreate) {
    return <CreateCampaign workspaceId={workspaceId} onCreated={() => { setShowCreate(false); loadCampaigns(); }} onCancel={() => setShowCreate(false)} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">Email Campaigns</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="btn-p text-xs px-3 py-2 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> New Campaign
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-pk-600" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="surf p-8 text-center max-w-md mx-auto">
          <Mail className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">No campaigns yet</h3>
          <p className="text-sm text-gray-500 mb-4">Create your first email campaign to reach out to contacts.</p>
          <button onClick={() => setShowCreate(true)} className="btn-p text-xs px-4 py-2.5 inline-flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Create Campaign
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="surf p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedCampaign(c.id)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#fff0f7" }}>
                  <Mail className="w-4 h-4 text-pk-600" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-900 truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 truncate">{c.subject}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {c._count?.recipients || c.totalRecipients} recipients
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={c.status} />
                {c.status === "sent" && (
                  <span className="text-[10px] text-gray-400">{c.sentCount} sent</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    draft: { bg: "#f3f4f6", text: "#6b7280", label: "Draft" },
    scheduled: { bg: "#fef3c7", text: "#92400e", label: "Scheduled" },
    sending: { bg: "#dbeafe", text: "#1e40af", label: "Sending" },
    sent: { bg: "#d1fae5", text: "#065f46", label: "Sent" },
    failed: { bg: "#fee2e2", text: "#991b1b", label: "Failed" },
  };
  const s = styles[status] || styles.draft;
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

function CreateCampaign({ workspaceId, onCreated, onCancel }: { workspaceId: string; onCreated: () => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [htmlContent, setHtmlContent] = useState("<p>Hello {{firstName}},</p>\n<p>This is a test email from PandiCRM.</p>\n<p>Best regards,<br/>{{senderName}}</p>");
  const [textContent, setTextContent] = useState("");
  const [signature, setSignature] = useState("Best regards,\nPandiCRM Team");
  const [contacts, setContacts] = useState<{ id: string; firstName: string; lastName: string; email?: string }[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [templates, setTemplates] = useState<{ id: string; name: string; subject: string; htmlContent: string }[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.contacts.list(workspaceId).then((data) => {
      setContacts(data.filter((c) => c.email));
    }).catch(() => {});
    api.emailTemplates.list(workspaceId).then(setTemplates).catch(() => {});
  }, [workspaceId]);

  const toggleContact = (id: string) => {
    setSelectedContacts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedContacts.size === contacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(contacts.map((c) => c.id)));
    }
  };

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!templateId) return;
    const t = templates.find((t) => t.id === templateId);
    if (t) {
      setSubject(t.subject);
      setHtmlContent(t.htmlContent);
      setTextContent("");
    }
  };

  const escapeHtmlEntities = (text: string) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const signatureToHtml = (sig: string) => escapeHtmlEntities(sig).replace(/\n/g, "<br/>");

  const handleSubmit = async () => {
    if (!name || !subject || !senderName || !senderEmail || selectedContacts.size === 0) {
      setError("Please fill in all required fields and select at least one contact");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const signatureHtml = signatureToHtml(signature);
      const signaturePlain = signature;

      const finalHtml = htmlContent
        .replaceAll("{{signature}}", signatureHtml)
        .replaceAll("{{ signature }}", signatureHtml);
      const finalText = textContent
        .replaceAll("{{signature}}", signaturePlain)
        .replaceAll("{{ signature }}", signaturePlain);

      await api.campaigns.create({
        workspaceId,
        name,
        subject,
        senderName,
        senderEmail,
        replyTo: replyTo || undefined,
        htmlContent: finalHtml,
        textContent: finalText || undefined,
        contactIds: Array.from(selectedContacts),
        templateId: selectedTemplate || undefined,
      });
      onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">New Campaign</h2>
        <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-700">&larr; Back</button>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      <div className="surf p-5 space-y-4">
        {templates.length > 0 && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Template (optional)</label>
            <select
              value={selectedTemplate}
              onChange={(e) => applyTemplate(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500"
            >
              <option value="">No template</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Campaign Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subject *</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sender Name *</label>
            <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sender Email *</label>
            <input type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} placeholder="noreply@pandacrm.com.ng"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reply-To (optional)</label>
          <input type="email" value={replyTo} onChange={(e) => setReplyTo(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Content *</label>
          <CampaignEmailEditor
            htmlContent={htmlContent}
            textContent={textContent}
            signature={signature}
            senderName={senderName}
            senderEmail={senderEmail}
            onChange={({ htmlContent, textContent, signature: sig }) => {
              setHtmlContent(htmlContent);
              setTextContent(textContent);
              setSignature(sig);
            }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-gray-700">Recipients * ({selectedContacts.size} selected)</label>
            <button onClick={toggleAll} className="text-[10px] font-semibold text-pk-600 hover:text-pk-700">
              {selectedContacts.size === contacts.length ? "Deselect all" : "Select all"}
            </button>
          </div>
          {contacts.length === 0 ? (
            <p className="text-xs text-gray-400 p-3 bg-gray-50 rounded-xl">No contacts with email addresses found.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200">
              {contacts.map((c) => (
                <label key={c.id} className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0">
                  <input type="checkbox" checked={selectedContacts.has(c.id)} onChange={() => toggleContact(c.id)} className="rounded text-pk-600" />
                  <span className="text-sm text-gray-700">{c.firstName} {c.lastName}</span>
                  <span className="text-xs text-gray-400 ml-auto">{c.email}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button onClick={handleSubmit} disabled={loading} className="btn-p text-sm px-4 py-2.5 flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Create Campaign
          </button>
          <button onClick={onCancel} className="text-sm text-gray-500 px-4 py-2.5 hover:text-gray-700">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function CampaignDetail({ campaignId, workspaceId, onBack }: { campaignId: string; workspaceId: string; onBack: () => void }) {
  const [campaign, setCampaign] = useState<EmailCampaign | null>(null);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [c, s] = await Promise.all([
        api.campaigns.get(campaignId),
        api.campaigns.stats(campaignId),
      ]);
      setCampaign(c);
      setStats(s);
    } catch {
      setError("Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [campaignId]);

  const handleSend = async () => {
    if (!confirm("Send this campaign to all pending recipients?")) return;
    setSending(true);
    setError("");
    try {
      await api.campaigns.send(campaignId);
      await load();
    } catch (err: any) {
      setError(err.message || "Failed to send campaign");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    try {
      await api.campaigns.delete(campaignId);
      onBack();
    } catch (err: any) {
      setError(err.message || "Failed to delete campaign");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-pk-600" />
      </div>
    );
  }

  if (!campaign) return <p className="text-sm text-gray-500">Campaign not found</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-700 mb-2">&larr; Back to campaigns</button>
          <h2 className="text-lg font-bold text-gray-900">{campaign.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          {campaign.status === "draft" && (
            <button onClick={handleSend} disabled={sending} className="btn-p text-xs px-3 py-2 flex items-center gap-1.5">
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              {sending ? "Sending..." : "Send Now"}
            </button>
          )}
          <button onClick={handleDelete} className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      {stats && campaign.status === "sent" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard icon={<CheckCircle className="w-4 h-4 text-green-600" />} label="Sent" value={stats.sentCount} bg="#d1fae5" />
          <StatCard icon={<XCircle className="w-4 h-4 text-red-500" />} label="Failed" value={stats.failedCount} bg="#fee2e2" />
          <StatCard icon={<Eye className="w-4 h-4 text-blue-600" />} label="Opened" value={stats.openCount} bg="#dbeafe" />
          <StatCard icon={<MousePointerClick className="w-4 h-4 text-purple-600" />} label="Clicked" value={stats.clickCount} bg="#f3e8ff" />
        </div>
      )}

      <div className="surf p-5 space-y-3">
        <DetailRow label="Subject" value={campaign.subject} />
        <DetailRow label="Sender" value={`${campaign.senderName} <${campaign.senderEmail}>`} />
        {campaign.replyTo && <DetailRow label="Reply-To" value={campaign.replyTo} />}
        <DetailRow label="Status" value={<StatusBadge status={campaign.status} />} />
        <DetailRow label="Recipients" value={String(campaign.totalRecipients)} />
        {campaign.sentAt && <DetailRow label="Sent At" value={new Date(campaign.sentAt).toLocaleString()} />}

        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1.5">Email Preview</p>
          <div className="bg-white border border-gray-200 rounded-xl p-4 max-h-96 overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: campaign.htmlContent }} />
          </div>
        </div>

        {campaign.recipients && campaign.recipients.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1.5">Recipient Status</p>
            <div className="max-h-60 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200">
              {campaign.recipients.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-3 py-2 border-b border-gray-100 last:border-0">
                  <div className="min-w-0">
                    <span className="text-sm text-gray-700">{r.contact?.firstName} {r.contact?.lastName}</span>
                    <span className="text-xs text-gray-400 ml-2">{r.email}</span>
                  </div>
                  <RecipientStatusBadge status={r.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number; bg: string }) {
  return (
    <div className="surf p-3 flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs font-semibold text-gray-500 w-24 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

function RecipientStatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: "#f3f4f6", text: "#6b7280", label: "Pending" },
    sent: { bg: "#d1fae5", text: "#065f46", label: "Sent" },
    failed: { bg: "#fee2e2", text: "#991b1b", label: "Failed" },
    opened: { bg: "#dbeafe", text: "#1e40af", label: "Opened" },
    clicked: { bg: "#f3e8ff", text: "#6b21a8", label: "Clicked" },
    bounced: { bg: "#fef3c7", text: "#92400e", label: "Bounced" },
    unsubscribed: { bg: "#fce7f3", text: "#9d174d", label: "Unsubscribed" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0" style={{ background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}
