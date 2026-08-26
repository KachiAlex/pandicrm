"use client";

import { useEffect, useState } from "react";
import { api, Integration } from "@/lib/api";
import { Mail, MessageSquare, Calendar, Loader2, Plus, Pencil, Trash2, RefreshCw, Check, X, Plug } from "lucide-react";

const typeOptions = [
  { id: "email", label: "Email", icon: <Mail className="w-4 h-4" /> },
  { id: "sms", label: "SMS", icon: <MessageSquare className="w-4 h-4" /> },
  { id: "calendar", label: "Calendar", icon: <Calendar className="w-4 h-4" /> },
];

const providerDefaults: Record<string, string> = {
  email: "smtp",
  sms: "twilio",
  calendar: "google",
};

interface IntegrationsPanelProps {
  workspaceId: string;
}

export default function IntegrationsPanel({ workspaceId }: IntegrationsPanelProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editing, setEditing] = useState<Integration | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    type: "email",
    provider: "smtp",
    label: "",
    isActive: true,
    config: {
      host: "",
      port: "",
      user: "",
      pass: "",
      secure: false,
      accountSid: "",
      authToken: "",
      fromNumber: "",
      testNumber: "",
      clientId: "",
      clientSecret: "",
      redirectUri: "",
    } as Record<string, any>,
  });

  const load = () => {
    api.integrations.list(workspaceId).then((data) => {
      setIntegrations(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [workspaceId]);

  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setForm({
      type: "email",
      provider: "smtp",
      label: "",
      isActive: true,
      config: {
        host: "", port: "", user: "", pass: "", secure: false,
        accountSid: "", authToken: "", fromNumber: "", testNumber: "",
        clientId: "", clientSecret: "", redirectUri: "",
      },
    });
    setMessage(null);
  };

  const startEdit = (i: Integration) => {
    setEditing(i);
    setForm({
      type: i.type,
      provider: i.provider,
      label: i.label || "",
      isActive: i.isActive,
      config: { ...i.config } as Record<string, any>,
    });
    setShowForm(true);
    setMessage(null);
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        workspaceId,
        type: form.type as any,
        provider: form.provider,
        label: form.label,
        isActive: form.isActive,
        config: Object.fromEntries(
          Object.entries(form.config).filter(([_, v]) => v !== "" && v !== false && v !== null && v !== undefined)
        ) as any,
      };
      if (editing) {
        await api.integrations.update(editing.id, payload as any);
      } else {
        await api.integrations.create(payload as any);
      }
      resetForm();
      load();
    } catch (err: any) {
      setMessage(err.message || "Failed to save integration");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (i: Integration) => {
    try {
      await api.integrations.update(i.id, { isActive: !i.isActive });
      load();
    } catch {}
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this integration?")) return;
    try {
      await api.integrations.delete(id);
      load();
    } catch {}
  };

  const test = async (id: string) => {
    setTesting(id);
    setMessage(null);
    try {
      const res = await api.integrations.test(id);
      setMessage(res.message);
      if (res.authUrl) window.open(res.authUrl, "_blank");
    } catch (err: any) {
      setMessage(err.message || "Test failed");
    } finally {
      setTesting(null);
    }
  };

  const updateConfig = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, config: { ...prev.config, [key]: value } }));
  };

  const renderEmailFields = () => (
    <>
      <input className="input" placeholder="SMTP host" value={form.config.host || ""} onChange={(e) => updateConfig("host", e.target.value)} />
      <input className="input" placeholder="SMTP port (e.g. 587)" value={form.config.port || ""} onChange={(e) => updateConfig("port", e.target.value)} />
      <input className="input" placeholder="Username" value={form.config.user || ""} onChange={(e) => updateConfig("user", e.target.value)} />
      <input className="input" type="password" placeholder="Password" value={form.config.pass || ""} onChange={(e) => updateConfig("pass", e.target.value)} />
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={!!form.config.secure} onChange={(e) => updateConfig("secure", e.target.checked)} /> Use SSL/TLS (port 465)
      </label>
    </>
  );

  const renderSmsFields = () => (
    <>
      <input className="input" placeholder="Twilio Account SID" value={form.config.accountSid || ""} onChange={(e) => updateConfig("accountSid", e.target.value)} />
      <input className="input" type="password" placeholder="Twilio Auth Token" value={form.config.authToken || ""} onChange={(e) => updateConfig("authToken", e.target.value)} />
      <input className="input" placeholder="From phone number" value={form.config.fromNumber || ""} onChange={(e) => updateConfig("fromNumber", e.target.value)} />
      <input className="input" placeholder="Test phone number" value={form.config.testNumber || ""} onChange={(e) => updateConfig("testNumber", e.target.value)} />
    </>
  );

  const renderCalendarFields = () => (
    <>
      <input className="input" placeholder="Google Client ID" value={form.config.clientId || ""} onChange={(e) => updateConfig("clientId", e.target.value)} />
      <input className="input" type="password" placeholder="Google Client Secret" value={form.config.clientSecret || ""} onChange={(e) => updateConfig("clientSecret", e.target.value)} />
      <input className="input" placeholder="Redirect URI" value={form.config.redirectUri || ""} onChange={(e) => updateConfig("redirectUri", e.target.value)} />
    </>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-pk-600" />
      </div>
    );
  }

  return (
    <div className="surf p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-lg text-gray-900">Integrations</h2>
          <p className="text-sm text-gray-500">Connect email, SMS, and calendar providers.</p>
        </div>
        {!showForm && (
          <button onClick={() => { setShowForm(true); setMessage(null); }} className="btn-p text-xs px-3 py-2 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-4">
            {typeOptions.map((t) => (
              <button
                key={t.id}
                onClick={() => setForm((prev) => ({ ...prev, type: t.id, provider: providerDefaults[t.id] }))}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${form.type === t.id ? "bg-pk-600 text-white border-pk-600" : "bg-white text-gray-600 border-gray-200"}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <input className="input" placeholder="Label" value={form.label} onChange={(e) => setForm((prev) => ({ ...prev, label: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))} /> Active
            </label>
            {form.type === "email" && renderEmailFields()}
            {form.type === "sms" && renderSmsFields()}
            {form.type === "calendar" && renderCalendarFields()}
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={save} disabled={saving} className="btn-p text-xs px-3 py-2">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (editing ? "Update" : "Save")}
            </button>
            <button onClick={resetForm} className="btn-s text-xs px-3 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {integrations.length === 0 && !showForm && (
          <p className="text-sm text-gray-400 text-center py-10">No integrations yet. Add one to get started.</p>
        )}
        {integrations.map((i) => (
          <div key={i.id} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-pk-50 flex items-center justify-center text-pk-600">
                {i.type === "email" ? <Mail className="w-4 h-4" /> : i.type === "sms" ? <MessageSquare className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{i.label || `${i.provider} ${i.type}`}</p>
                <p className="text-[10px] text-gray-500 capitalize">{i.provider} · {i.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => toggleActive(i)} className={`text-[10px] px-2 py-1 rounded ${i.isActive ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                {i.isActive ? "Active" : "Inactive"}
              </button>
              <button onClick={() => test(i.id)} disabled={testing === i.id} className="p-1.5 rounded hover:bg-gray-100 text-pk-600" title="Test">
                {testing === i.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => startEdit(i)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600" title="Edit">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => remove(i.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500" title="Delete">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
