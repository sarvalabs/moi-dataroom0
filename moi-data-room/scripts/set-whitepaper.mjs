#!/usr/bin/env node
/**
 * Swap the data-room whitepaper.
 *
 * 1. Uploads the given PDF to storage via the deployed admin API.
 * 2. Creates a new "White Paper" document pinned to the /home "network" hero
 *    slot (this auto-unpins the previous occupant and triggers RAG embedding).
 * 3. Renames the previous whitepaper document to "Litepaper".
 * 4. Waits for the new document's embedding to complete.
 *
 * Usage:
 *   node scripts/set-whitepaper.mjs <path-to-whitepaper.pdf>
 *
 * Env (optional):
 *   DATAROOM_URL  base URL of the deployment (default https://dataroom.moi.technology)
 *   ADMIN_SECRET  sent as x-admin-key when the deployment enforces admin auth
 */
import { readFile } from "node:fs/promises";
import { basename } from "node:path";

const BASE = (process.env.DATAROOM_URL ?? "https://dataroom.moi.technology").replace(/\/$/, "");
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

const pdfPath = process.argv[2];
if (!pdfPath) {
  console.error("Usage: node scripts/set-whitepaper.mjs <path-to-whitepaper.pdf>");
  process.exit(1);
}

const headers = ADMIN_SECRET ? { "x-admin-key": ADMIN_SECRET } : {};

async function api(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers ?? {}) },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} → ${res.status}: ${body?.error ?? "unknown error"}`);
  }
  return body;
}

// ── 1. Find the current whitepaper (pinned to the "network" hero slot) ──
const docs = await api("/api/documents");
const oldDoc =
  docs.find((d) => d.home_hero_slot === "network") ??
  docs.find((d) => /white\s*paper/i.test(d.title));
if (!oldDoc) {
  console.error("Could not find the current whitepaper (no doc pinned to the 'network' slot).");
  process.exit(1);
}
console.log(`Current whitepaper: "${oldDoc.title}" (${oldDoc.id}, category=${oldDoc.category})`);

// ── 2. Upload the new PDF ──
const buf = await readFile(pdfPath);
const form = new FormData();
form.append("file", new Blob([buf], { type: "application/pdf" }), basename(pdfPath));
form.append("category", oldDoc.category);
const { path: storagePath } = await api("/api/upload", { method: "POST", body: form });
console.log(`Uploaded → ${storagePath}`);

// ── 3. Create the new White Paper doc pinned to the hero slot ──
const created = await api("/api/documents", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "White Paper",
    description:
      "The Linear Substrate and the Authority Layer — Participant-Indexed Computation and the MOI Authority Layer (MAL). MOI Foundations v2.1.",
    category: oldDoc.category,
    file_url: storagePath,
    file_type: "PDF",
    status: "published",
    allow_download: oldDoc.allow_download ?? true,
    require_email: oldDoc.require_email ?? false,
    home_hero_slot: "network",
  }),
});
console.log(`Created new whitepaper doc ${created.id} (pinned to 'network' hero slot)`);

// ── 4. Rename the old whitepaper to Litepaper ──
await api(`/api/documents/${oldDoc.id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Litepaper" }),
});
console.log(`Renamed "${oldDoc.title}" → "Litepaper" (stays listed in ${oldDoc.category})`);

// ── 5. Wait for embedding so the chat assistant can cite the new paper ──
process.stdout.write("Waiting for embedding");
const deadline = Date.now() + 5 * 60 * 1000;
let status = "pending";
while (Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 5000));
  const fresh = (await api("/api/documents")).find((d) => d.id === created.id);
  status = fresh?.embedding_status ?? "unknown";
  process.stdout.write(".");
  if (status === "completed" || status === "failed") break;
}
console.log(`\nEmbedding status: ${status}`);
if (status === "failed") {
  console.error("Embedding failed — check admin panel, then use the re-embed action.");
  process.exit(1);
}
console.log("Done. Verify at " + BASE + "/home");
