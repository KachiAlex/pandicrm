export function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map((row) =>
    row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAccounts(accounts: any[]) {
  const rows = [
    ["ID", "Name", "Description", "Domain", "Industry", "Size", "Website", "Phone", "Created At"],
    ...accounts.map((a) => [
      a.id,
      a.name,
      a.description ?? "",
      a.domain ?? "",
      a.industry ?? "",
      a.size ?? "",
      a.website ?? "",
      a.phone ?? "",
      a.createdAt,
    ]),
  ];
  downloadCSV("accounts.csv", rows);
}

export function exportContacts(contacts: any[]) {
  const rows = [
    ["ID", "First Name", "Last Name", "Email", "Phone", "Title", "Department", "Account", "Created At"],
    ...contacts.map((c) => [
      c.id,
      c.firstName,
      c.lastName,
      c.email ?? "",
      c.phone ?? "",
      c.title ?? "",
      c.department ?? "",
      c.account?.name ?? "",
      c.createdAt,
    ]),
  ];
  downloadCSV("contacts.csv", rows);
}

export function exportDeals(deals: any[]) {
  const rows = [
    ["ID", "Name", "Stage", "Value", "Currency", "Probability", "Close Date", "Account", "Contact", "Created At"],
    ...deals.map((d) => [
      d.id,
      d.name,
      d.stage,
      d.value ?? 0,
      d.currency ?? "",
      d.probability ?? 0,
      d.closeDate ?? "",
      d.account?.name ?? "",
      d.contact ? `${d.contact.firstName} ${d.contact.lastName}` : "",
      d.createdAt,
    ]),
  ];
  downloadCSV("deals.csv", rows);
}

export function exportTasks(tasks: any[]) {
  const rows = [
    ["ID", "Title", "Status", "Priority", "Due Date", "Assignee", "Created At"],
    ...tasks.map((t) => [
      t.id,
      t.title,
      t.status,
      t.priority,
      t.dueDate ?? "",
      t.assignee?.name ?? "",
      t.createdAt,
    ]),
  ];
  downloadCSV("tasks.csv", rows);
}
