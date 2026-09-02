"use client";

import { useState, useEffect } from "react";
import { X, Mail, Phone, Briefcase, Loader2, Plus, Check } from "lucide-react";
import { api, Account, Contact, ContactCategory } from "@/lib/api";

interface CreateContactModalProps {
  workspaceId: string;
  onClose: () => void;
  onCreated?: (contact?: Contact) => void;
}

export default function CreateContactModal({ workspaceId, onClose, onCreated }: CreateContactModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [accountId, setAccountId] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<ContactCategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#ff1a97");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);

  useEffect(() => {
    Promise.all([
      api.accounts.list(workspaceId),
      api.contactCategories.list(workspaceId),
    ])
      .then(([a, c]) => {
        setAccounts(a);
        setCategories(c);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, [workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!firstName.trim() || !lastName.trim()) {
      setError("First and last name are required");
      return;
    }
    setLoading(true);
    try {
      const contact = await api.contacts.create({
        workspaceId,
        firstName,
        lastName,
        email: email || undefined,
        phone: phone || undefined,
        title: title || undefined,
        department: department || undefined,
        accountId: accountId || undefined,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      });
      onCreated?.(contact);
    } catch (err: any) {
      setError(err.message || "Failed to create contact");
      setLoading(false);
    }
  };

  const selClass =
    "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-pk-500 focus:ring-1 focus:ring-pk-500 transition-colors bg-white";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-900">New Contact</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>
        )}
        {fetching ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-pk-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className={selClass}
                />
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className={selClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@acme.com"
                  className={`${selClass} pl-10`}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 555 000 0000"
                    className={`${selClass} pl-10`}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Title</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="VP Sales"
                    className={`${selClass} pl-10`}
                  />
                </div>
              </div>
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Sales"
                className={selClass}
              />
            </div>
            <div>
              <label className={labelClass}>Account</label>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={selClass}>
                <option value="">None</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Categories <span className="text-gray-400 normal-case font-normal">(optional)</span></label>
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {categories.map((cat) => {
                    const selected = selectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryIds((prev) =>
                            prev.includes(cat.id)
                              ? prev.filter((id) => id !== cat.id)
                              : [...prev, cat.id]
                          );
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          selected
                            ? "text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        style={selected ? { backgroundColor: cat.color || "#ff1a97" } : undefined}
                      >
                        {selected && <Check className="w-3 h-3" />}
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              )}
              {showNewCategory ? (
                <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Category name"
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:border-pk-500"
                    />
                    <input
                      type="color"
                      value={newCategoryColor}
                      onChange={(e) => setNewCategoryColor(e.target.value)}
                      className="w-10 h-9 rounded-lg border border-gray-200 cursor-pointer bg-white"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={creatingCategory || !newCategoryName.trim()}
                      onClick={async () => {
                        setCreatingCategory(true);
                        try {
                          const cat = await api.contactCategories.create({
                            workspaceId,
                            name: newCategoryName.trim(),
                            color: newCategoryColor,
                          });
                          setCategories((prev) => [...prev, cat]);
                          setSelectedCategoryIds((prev) => [...prev, cat.id]);
                          setNewCategoryName("");
                          setShowNewCategory(false);
                        } catch (err: any) {
                          setError(err.message || "Failed to create category");
                        }
                        setCreatingCategory(false);
                      }}
                      className="btn-p px-3 py-1.5 text-xs disabled:opacity-60"
                    >
                      {creatingCategory ? "Adding..." : "Add Category"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategory(false);
                        setNewCategoryName("");
                      }}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-pk-600 hover:text-pk-700 font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Create new category
                </button>
              )}
            </div>
            <button type="submit" disabled={loading} className="btn-p w-full justify-center py-3 text-sm disabled:opacity-60">
              {loading ? "Creating..." : "Create Contact"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
