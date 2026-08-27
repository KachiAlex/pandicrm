/**
 * Smoke test for follow-up endpoints.
 * Run from the server with: BASE_URL=http://localhost:3000 node scripts/test-followups.js
 * Unauthenticated endpoints are expected to return JSON even when they 401/403.
 */

const BASE = process.env.BASE_URL || "http://localhost:3000";

const tests = [
  { method: "GET", path: "/api/follow-ups", name: "list follow-ups" },
  { method: "GET", path: "/api/follow-ups/activity", name: "follow-up activity feed" },
  { method: "POST", path: "/api/contacts/000000000000000000000000/follow-up", name: "create contact follow-up" },
];

async function runTest({ method, path, name }) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
    });
    let body;
    try {
      body = await res.json();
    } catch {
      body = await res.text();
    }
    const ok = res.status < 500;
    console.log(`${ok ? "✓" : "✗"} [${res.status}] ${name}: ${path}`);
    if (!ok) {
      console.log("  response:", typeof body === "string" ? body.slice(0, 200) : body);
    }
    return ok;
  } catch (err) {
    console.error(`✗ [ERROR] ${name}: ${err.message}`);
    return false;
  }
}

(async () => {
  console.log(`Smoke testing follow-up endpoints at ${BASE}`);
  const results = [];
  for (const t of tests) {
    results.push(await runTest(t));
  }
  const allOk = results.every(Boolean);
  console.log(allOk ? "\nAll follow-up smoke tests passed" : "\nSome follow-up smoke tests failed");
  process.exit(allOk ? 0 : 1);
})();
