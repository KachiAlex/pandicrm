"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Loader2, Save, Lock, User, CheckCircle, Building2 } from "lucide-react";
import { api, User as ApiUser, Workspace } from "@/lib/api";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [workspaceMessage, setWorkspaceMessage] = useState("");

  useEffect(() => {
    api.user.get().then((data) => {
      setUser(data);
      setName(data.name || "");
      setFirstName(data.firstName || "");
      setLastName(data.lastName || "");
      setCompany(data.company || "");
      setPhone(data.phone || "");
    }).catch(() => {});
    // Fetch workspace from local hook isn't available here, use a simple fetch
    fetch("/api/workspaces").then((r) => r.ok ? r.json() : []).then((data: Workspace[]) => {
      if (data.length > 0) {
        setWorkspace(data[0]);
        setWorkspaceName(data[0].name);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const updated = await api.user.update({ name, firstName, lastName, company, phone });
      setUser(updated);
      await update({ name: updated.name });
      setMessage("Profile updated successfully.");
    } catch (err: any) {
      setMessage(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword.length < 6) { setPasswordError("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match."); return; }
    setChangingPassword(true);
    try {
      await api.user.changePassword(currentPassword, newPassword);
      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#f5f5f7" }}>
        <Loader2 className="w-6 h-6 animate-spin text-pk-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f7" }}>
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </Link>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: "#0d0d12" }}>Settings</h1>
        </div>

        <div className="surf p-6 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-pk-600" />
            <h2 style={{ fontSize: 13.5, fontWeight: 700, color: "#1f2937" }}>Profile</h2>
          </div>
          <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Display Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
              <input type="email" value={user?.email || ""} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-400 cursor-not-allowed" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Company</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500 transition-colors" />
              </div>
            </div>
            {message && (
              <p className={`text-xs ${message.includes("success") ? "text-green-600" : "text-red-500"}`}>{message}</p>
            )}
            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-p text-xs px-4 py-2.5 flex items-center gap-2">
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Profile
              </button>
            </div>
          </form>
        </div>

        <div className="surf p-6 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <Building2 className="w-4 h-4 text-pk-600" />
            <h2 style={{ fontSize: 13.5, fontWeight: 700, color: "#1f2937" }}>Workspace</h2>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!workspace) return;
              setSavingWorkspace(true);
              setWorkspaceMessage("");
              try {
                const updated = await api.workspaces.update(workspace.id, { name: workspaceName });
                setWorkspace(updated);
                setWorkspaceMessage("Workspace updated successfully.");
              } catch (err: any) {
                setWorkspaceMessage(err.message || "Failed to update workspace.");
              } finally {
                setSavingWorkspace(false);
              }
            }}
            className="flex flex-col gap-4"
          >
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Workspace Name</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                disabled={!workspace}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500 transition-colors disabled:opacity-50"
              />
            </div>
            {workspaceMessage && (
              <p className={`text-xs ${workspaceMessage.includes("success") ? "text-green-600" : "text-red-500"}`}>{workspaceMessage}</p>
            )}
            <div className="flex justify-end">
              <button type="submit" disabled={savingWorkspace || !workspace} className="btn-p text-xs px-4 py-2.5 flex items-center gap-2">
                {savingWorkspace ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Workspace
              </button>
            </div>
          </form>
        </div>

        <div className="surf p-6">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-pk-600" />
            <h2 style={{ fontSize: 13.5, fontWeight: 700, color: "#1f2937" }}>Change Password</h2>
          </div>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Current Password</label>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500 transition-colors" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-pk-500 transition-colors" />
              </div>
            </div>
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            {passwordSuccess && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />{passwordSuccess}</p>}
            <div className="flex justify-end">
              <button type="submit" disabled={changingPassword} className="btn-p text-xs px-4 py-2.5 flex items-center gap-2">
                {changingPassword ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
