// Integration test for the Instagram flow: webhook signature, link code,
// multi-reel folder filing, and (optionally) the bot's DM replies.
//
// Needs running: auth-service, api-backend, Postgres, Redis, Kafka.
// Run from apps/api-backend (bun loads .env automatically):
//   bun run test:ig
//
// To also check DM replies, start api-backend with
//   IG_GRAPH_BASE=http://localhost:4999
// and run the test with FAKE_META=1. The test then runs a fake Meta server.

import { createHmac } from "node:crypto";

const ROOT = `http://localhost:${process.env.API_BACKEND_PORT ?? "4002"}`;
const BASE = `${ROOT}/api/v1`;
const WEBHOOK = `${ROOT}/webhooks/instagram`;
const AUTH_BASE = `${process.env.AUTH_URL ?? "http://localhost:4001"}/api/v1/auth`;
const APP_SECRET = process.env.IG_APP_SECRET ?? "";
const VERIFY_TOKEN = process.env.IG_VERIFY_TOKEN ?? "";
const FAKE_META = process.env.FAKE_META === "1";
const FAKE_META_PORT = Number(process.env.FAKE_META_PORT ?? 4999);

const suffix = Date.now();
const user = {
  username: `igtest_${suffix}`,
  email: `igtest_${suffix}@test.com`,
  password: "password123",
  fullName: "IG Test",
};
const igUserId = String(suffix); // fake Instagram-scoped id
const otherIgUserId = String(suffix + 1);

let passed = 0;
let failed = 0;
let midCounter = 0;

const check = (name: string, ok: boolean, extra?: unknown) => {
  if (ok) {
    passed++;
    console.log(`PASS  ${name}`);
  } else {
    failed++;
    console.log(`FAIL  ${name}`, extra ?? "");
  }
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const waitFor = async (fn: () => Promise<boolean>, timeoutMs = 8000) => {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) {
    try {
      if (await fn()) return true;
    } catch {
      // keep polling
    }
    await sleep(250);
  }
  return false;
};

// ---------- fake Meta server (records DM replies) ----------
type SentDm = { to: string; text: string; auth: string | null };
const sent: SentDm[] = [];

declare const Bun: any;

const startFakeMeta = () =>
  Bun.serve({
    port: FAKE_META_PORT,
    async fetch(req: Request) {

      const body: any = await req.json().catch(() => ({}));
      sent.push({
        to: body?.recipient?.id,
        text: body?.message?.text,
        auth: req.headers.get("authorization"),
      });
      return Response.json({ recipient_id: body?.recipient?.id, message_id: "fake" });
    },
  });

// ---------- webhook helpers ----------
const sign = (raw: string) =>
  "sha256=" + createHmac("sha256", APP_SECRET).update(raw).digest("hex");

const postWebhook = (payload: unknown, signature?: string | null) => {
  const raw = JSON.stringify(payload);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (signature !== null) headers["x-hub-signature-256"] = signature ?? sign(raw);
  return fetch(WEBHOOK, { method: "POST", headers, body: raw });
};

const dm = (senderId: string, message: Record<string, unknown>) => ({
  object: "instagram",
  entry: [
    {
      id: "bot",
      time: Date.now(),
      messaging: [{ sender: { id: senderId }, recipient: { id: "bot" }, message }],
    },
  ],
});

const nextMid = () => `mid_${suffix}_${++midCounter}`;

const sendText = (senderId: string, text: string, mid = nextMid()) =>
  postWebhook(dm(senderId, { mid, text }));

const sendReel = (senderId: string, id: string, mid = nextMid()) =>
  postWebhook(
    dm(senderId, {
      mid,
      attachments: [
        { type: "ig_reel", payload: { url: `https://example.com/reel/${suffix}-${id}/` } },
      ],
    }),
  );

// ---------- API helpers ----------
let token = "";
const api = (path: string, init: RequestInit = {}) =>
  fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init.headers as Record<string, string>),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

const getJson = async (path: string): Promise<any> => (await api(path)).json();
const contentCount = async () => (await getJson("/content?limit=50")).items.length as number;
const isLinked = async () => (await getJson("/instagram/status")).linked === true;
const findFolder = async (name: string) =>
  (await getJson("/collections")).items.find((c: any) => c.name === name);

const run = async () => {
  if (!APP_SECRET || !VERIFY_TOKEN) {
    console.log("IG_APP_SECRET and IG_VERIFY_TOKEN must be set (run from apps/api-backend).");
    process.exit(1);
  }

  const fakeMeta = FAKE_META ? startFakeMeta() : null;

  // ===== 1. webhook verification + signature =====
  const verifyOk = await fetch(
    `${WEBHOOK}?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(VERIFY_TOKEN)}&hub.challenge=12345`,
  );
  check(
    "GET verify with right token returns the challenge",
    verifyOk.status === 200 && (await verifyOk.text()) === "12345",
  );

  const verifyBad = await fetch(
    `${WEBHOOK}?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345`,
  );
  check("GET verify with wrong token returns 403", verifyBad.status === 403);

  const emptyPayload = { object: "instagram", entry: [] };
  check("POST with valid signature returns 200", (await postWebhook(emptyPayload)).status === 200);
  check(
    "POST with bad signature returns 401",
    (await postWebhook(emptyPayload, "sha256=deadbeef")).status === 401,
  );
  check("POST with no signature returns 401", (await postWebhook(emptyPayload, null)).status === 401);

  // ===== sign up a user =====
  const signup = await fetch(`${AUTH_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });
  const signupBody: any = await signup.json().catch(() => ({}));
  token = signupBody.accessToken ?? "";
  if (!token) {
    console.log("SKIP  link-code and folder tests (auth-service unreachable or signup failed)");
    console.log(`\n${passed} passed, ${failed} failed`);
    fakeMeta?.stop(true);
    process.exit(failed ? 1 : 0);
  }

  // ===== 2. link-code flow =====
  check("status is not linked before linking", !(await isLinked()));

  const codeRes = await api("/instagram/link-code", { method: "POST" });
  const codeBody: any = await codeRes.json();
  check(
    "link-code returns a code like RS-XXXXXX",
    codeRes.status === 201 && /^RS-[A-Z0-9]{6}$/.test(codeBody.code),
    codeBody,
  );

  await sendText(igUserId, codeBody.code);
  check("DM with the code links the account", await waitFor(isLinked));

  // same code again from a different Instagram user must not link or work
  await sendText(otherIgUserId, codeBody.code);
  await sendReel(otherIgUserId, "other");
  await sleep(1500);
  check("code is one-time: second sender is not linked", (await contentCount()) === 0);

  // ===== 3. multi-reel folder filing =====
  await sendReel(igUserId, "a");
  await sendReel(igUserId, "b");
  const dupMid = nextMid();
  await sendReel(igUserId, "c", dupMid);
  await sendReel(igUserId, "c", dupMid); // same mid again: Meta redelivery
  check("3 reels saved; repeated mid saved only once", await waitFor(async () => (await contentCount()) === 3));
  await sleep(1000);
  check("repeated mid did not create a 4th item", (await contentCount()) === 3);

  await sendText(igUserId, "Digg");
  check(
    "folder 'Digg' holds all 3 reels",
    await waitFor(async () => (await findFolder("Digg"))?.contentCount === 3),
    await getJson("/collections"),
  );

  await sendText(igUserId, "Ghost");
  await sleep(1500);
  check("text with no reels waiting creates no folder", !(await findFolder("Ghost")));

  // ===== 4. DM replies (fake Meta) =====
  if (fakeMeta) {
    const to = sent.filter((s) => s.to === igUserId).map((s) => s.text);
    check("reply: linked", to.some((t) => t.startsWith("Linked")), to);
    check("reply: 'Saved' sent once for the batch", to.filter((t) => t.startsWith("Saved")).length === 1, to);
    check("reply: folder confirmation", to.includes('Added 3 to "Digg" ✅'), to);
    check(
      "reply: reused code gets an error message",
      sent.some((s) => s.to === otherIgUserId && s.text.includes("didn't work")),
      sent,
    );
    check(
      "replies carry the Bearer token",
      sent.length > 0 && sent.every((s) => s.auth?.startsWith("Bearer ")),
    );
  } else {
    console.log("SKIP  DM reply checks (set FAKE_META=1 and start the API with IG_GRAPH_BASE=http://localhost:4999)");
  }

  // ===== 5. link-code rate limit (5 per 10 minutes) =====
  // one code was already created above, so 4 more are allowed
  let allOk = true;
  for (let i = 0; i < 4; i++) {
    const r = await api("/instagram/link-code", { method: "POST" });
    if (r.status !== 201) allOk = false;
  }
  check("codes 2-5 are allowed", allOk);
  const sixth = await api("/instagram/link-code", { method: "POST" });
  check(
    "6th code in 10 minutes returns 429 with Retry-After",
    sixth.status === 429 && !!sixth.headers.get("retry-after"),
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  fakeMeta?.stop(true);
  process.exit(failed ? 1 : 0);
};

run().catch((err) => {
  console.error("Test run crashed:", err);
  process.exit(1);
});