"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, X, Calendar, Pencil, Trash2 } from "lucide-react";
import { api, Task, Account, Contact, Deal } from "@/lib/api";

const STATUS_LABELS: Record<string, { label: string; dot: string; bg: string }> = {
  todo: { label: "To Do", dot: "#9ca3af", bg: "#e5e7eb" },
  in_progress: { label: "In Progress", dot: "#ff1a97", bg: "#fff0f7" },
  done: { label: "Done", dot: "#4ade80", bg: "#f0fdf4" },
};

export default function TasksPanel({ workspaceId }: { workspaceId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    api.tasks.list(workspaceId).then((data) => {
      setTasks(data);
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

  const groups = ["todo", "in_progress", "done"] as const;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1f2937" }}>Task Board</h2>
        <button className="btn-p text-xs px-3.5 py-2" onClick={() => setShowCreate(true)}><Plus className="w-3.5 h-3.5" />New Task</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {groups.map((status) => {
          const meta = STATUS_LABELS[status];
          const items = tasks.filter((t) => t.status === status);
          return (
            <div key={status} className="rounded-2xl p-4" style={{ background: "rgba(243,244,246,0.7)" }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: meta.dot }} />
                <p style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: ".05em" }}>{meta.label}</p>
                <span className="ml-auto" style={{ fontSize: 9.5, background: meta.bg, color: meta.dot, padding: "1px 6px", borderRadius: 999 }}>{items.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((item) => {
                  const hot = item.priority === "high" && item.status !== "done";
                  const done = item.status === "done";
                  const due = item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "No due date";
                  return (
                    <div key={item.id} className="surf p-3 cursor-pointer hover:shadow-md transition-shadow" style={hot ? { borderLeft: "3px solid #ff1a97" } : {}} onClick={() => setSelectedTask(item)}>
                      <p style={{ fontSize: 11.5, fontWeight: done ? 400 : 600, color: done ? "#9ca3af" : "#1f2937", textDecoration: done ? "line-through" : "none", marginBottom: 3 }}>{item.title}</p>
                      <p style={{ fontSize: 10, color: done ? "#16a34a" : hot ? "#b80055" : "#9ca3af", fontWeight: hot ? 600 : 400 }}>{done ? "Completed" : due}</p>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-xs">No tasks</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showCreate && <CreateTaskModal workspaceId={workspaceId} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); setRefreshKey((k) => k + 1); }} />}
      {selectedTask && <TaskDetailModal task={selectedTask} workspaceId={workspaceId} onClose={() => setSelectedTask(null)} onMutated={() => setRefreshKey((k) => k + 1)} />}
    </>
  );
}

function TaskDetailModal({ task, workspaceId, onClose, onMutated }: { task: Task; workspaceId: string; onClose: () => void; onMutated: () => void }) {
  const [editMode, setEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.slice(0, 10) : "");
  const [accountId, setAccountId] = useState(task.accountId || "");
  const [contactId, setContactId] = useState(task.contactId || "");
  const [dealId, setDealId] = useState(task.dealId || "");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    Promise.all([
      api.accounts.list(workspaceId).catch(() => []),
      api.contacts.list(workspaceId).catch(() => []),
      api.deals.list(workspaceId).catch(() => []),
    ]).then(([a, c, d]) => {
      setAccounts(a);
      setContacts(c);
      setDeals(d);
    });
  }, [workspaceId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.tasks.update(task.id, {
        title,
        description,
        status,
        priority,
        dueDate: dueDate || undefined,
        accountId: accountId || undefined,
        contactId: contactId || undefined,
        dealId: dealId || undefined,
      });
      setEditMode(false);
      onMutated();
    } catch (err: any) {
      setError(err.message || "Failed to update task");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.tasks.delete(task.id);
      onClose();
      onMutated();
    } catch (err: any) {
      setError(err.message || "Failed to delete task");
      setLoading(false);
    }
  };

  const selClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-pk-500 focus:ring-1 focus:ring-pk-500 transition-colors bg-white";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-900">{editMode ? "Edit Task" : task.title}</h2>
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
            <p className="text-sm text-gray-700 mb-4">Are you sure you want to delete this task? This cannot be undone.</p>
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
              <label className={labelClass}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={selClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={selClass}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className={selClass}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={selClass} />
            </div>
            <div>
              <label className={labelClass}>Related Account</label>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={selClass}>
                <option value="">None</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
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
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditMode(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 btn-p justify-center py-2.5 text-sm disabled:opacity-60">{loading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Status</span><span className="font-medium capitalize">{task.status.replace("_", " ")}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Priority</span><span className="font-medium capitalize">{task.priority}</span></div>
            <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Due Date</span><span className="font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</span></div>
            {task.assignee && <div className="flex justify-between py-2 border-b border-gray-100"><span className="text-gray-500">Assignee</span><span className="font-medium">{task.assignee.name || "—"}</span></div>}
            {task.description && <div className="py-2"><span className="text-gray-500 block mb-1">Description</span><p className="text-gray-800">{task.description}</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateTaskModal({ workspaceId, onClose, onCreated }: { workspaceId: string; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"todo" | "in_progress" | "done">("todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [dueDate, setDueDate] = useState("");
  const [accountId, setAccountId] = useState("");
  const [contactId, setContactId] = useState("");
  const [dealId, setDealId] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    Promise.all([
      api.accounts.list(workspaceId).catch(() => []),
      api.contacts.list(workspaceId).catch(() => []),
      api.deals.list(workspaceId).catch(() => []),
    ]).then(([a, c, d]) => {
      setAccounts(a);
      setContacts(c);
      setDeals(d);
      setFetching(false);
    });
  }, [workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("Title is required"); return; }
    setLoading(true);
    try {
      await api.tasks.create({
        workspaceId,
        title,
        description,
        status,
        priority,
        dueDate: dueDate || undefined,
        accountId: accountId || undefined,
        contactId: contactId || undefined,
        dealId: dealId || undefined,
      });
      onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create task");
      setLoading(false);
    }
  };

  const selClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-pk-500 focus:ring-1 focus:ring-pk-500 transition-colors bg-white";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg text-gray-900">New Task</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
        {fetching ? (
          <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-pk-600" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Title *</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Follow up with prospect" className={selClass} />
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What needs to be done..." rows={3} className={selClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={selClass}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className={selClass}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Due Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={`${selClass} pl-10`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Related Account</label>
              <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={selClass}>
                <option value="">None</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
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
            <button type="submit" disabled={loading} className="btn-p w-full justify-center py-3 text-sm disabled:opacity-60">
              {loading ? "Creating..." : "Create Task"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
