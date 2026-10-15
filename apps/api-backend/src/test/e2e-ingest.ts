import { createHmac } from "node:crypto";
import { prisma } from "@repo/db-prisma";
import { publishIngest } from "../services/content-ingest";
import { disconnectProducer } from "@repo/kafka";

// ---- config (env) ----
const REEL_URL =
  process.env.REEL_URL ?? "https://www.instagram.com/reel/DX4vcECNFwG/?xtok=MTlzanBzc202cDRsZg==";
const BAD = process.env.BAD === "1"; // bad URL -> expect dead-letter -> failed
const CHAT = process.env.CHAT === "1"; // enable chat section
const KEEP = process.env.KEEP === "1"; // keep rows for psql inspection
const API_URL = process.env.API_URL ?? "http://localhost:4002";
const CHAT_PATH = process.env.CHAT_PATH ?? "/api/v1/chat"; // ASSUMPTION
// AUTH_TOKEN: access token from auth-service signin. When set, the script runs
// as that existing user (no new user is created or deleted).
const AUTH_TOKEN = process.env.AUTH_TOKEN;
// Only needed when AUTH_TOKEN is not set: HS256 secret shared with auth-service
const JWT_SECRET = process.env.JWT_ACCESS_SECRET ?? process.env.JWT_SECRET;

const sourceUrl = BAD
  ? "https://www.instagram.com/reel/DOESNOTEXIST000/"
  : REEL_URL;
const INGEST_TIMEOUT_MS = 180_000;
const suffix = Date.now();

// ---- helpers ----
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const results: { name: string; ok: boolean }[] = [];
function check(name: string, ok: boolean) {
  results.push({ name, ok });
  console.log(`${ok ? "  ok  " : " FAIL "} ${name}`);
}

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");

// HS256 JWT without extra deps
function signJwt(payload: Record<string, unknown>, secret: string, ttlSec: number) {
  const now = Math.floor(Date.now() / 1000);
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64({ ...payload, iat: now, exp: now + ttlSec });
  const sig = createHmac("sha256", secret)
    .update(`${head}.${body}`)
    .digest("base64url");
  return `${head}.${body}.${sig}`;
}

function subOf(token: string): string {
  const part = token.split(".")[1];
  if (!part) throw new Error("AUTH_TOKEN is not a JWT");
  const sub = JSON.parse(Buffer.from(part, "base64url").toString()).sub;
  if (!sub) throw new Error("AUTH_TOKEN has no sub claim");
  return sub;
}

// auth-service access token claims: { sub, type: "access", iat, exp (10 min) }
function tokenFor(userId: string): string {
  if (AUTH_TOKEN) return AUTH_TOKEN;
  if (!JWT_SECRET) {
    throw new Error(
      "CHAT=1 needs AUTH_TOKEN, or JWT_ACCESS_SECRET / JWT_SECRET in env",
    );
  }
  return signJwt({ sub: userId, type: "access" }, JWT_SECRET, 600);
}

type ChatRes = { ok: boolean; status: number; json: any; text: string };

// ASSUMPTION: POST { conversationId, message, contentId? } -> JSON with reply/answer
async function chat(
  token: string,
  conversationId: string,
  message: string,
  contentId?: string,
): Promise<ChatRes> {
  const res = await fetch(`${API_URL}${CHAT_PATH}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId, message, contentId }),
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { ok: res.ok, status: res.status, json, text };
}

// only returns a reply on success, so error bodies never count as replies
const replyOf = (r: ChatRes): string =>
  r.ok ? (r.json?.reply ?? r.json?.answer ?? "") : "";

// ---- main ----
async function main() {
  const user = AUTH_TOKEN
    ? await prisma.user.findUniqueOrThrow({ where: { id: subOf(AUTH_TOKEN) } })
    : await prisma.user.create({
        data: {
          username: `e2e_${suffix}`,
          email: `e2e_${suffix}@test.com`,
          fullName: "E2E Test",
        },
      });
  console.log("running as user", user.id, user.username);

  const convoIds: string[] = [];

  // ===== 1. INGEST =====
  console.log("\n[1] ingest");
  // (userId, sourceUrl) is unique, so clear leftovers from a previous KEEP=1 run
  await prisma.content.deleteMany({ where: { userId: user.id, sourceUrl } });

  const content = await prisma.content.create({
    data: {
      userId: user.id,
      type: "reel",
      sourceUrl,
      ingestSource: "manual_upload",
      status: "pending",
    },
    select: {
      id: true,
      userId: true,
      sourceUrl: true,
      type: true,
      createdAt: true,
    },
  });
  console.log("created", content.id, sourceUrl);

  await publishIngest(content);
  console.log("published content-ingest");

  const started = Date.now();
  let last = "pending";
  let row;
  while (Date.now() - started < INGEST_TIMEOUT_MS) {
    row = await prisma.content.findUnique({ where: { id: content.id } });
    if (row && row.status !== last) {
      last = row.status;
      console.log(
        `status -> ${row.status} (+${Math.round((Date.now() - started) / 1000)}s)`,
      );
    }
    if (row?.status === "ready" || row?.status === "failed") break;
    await sleep(1000);
  }

  const [emb] = await prisma.$queryRaw<{ dims: number | null }[]>`
    SELECT vector_dims(embedding) AS dims FROM "Content" WHERE id = ${content.id}`;

  console.log("result:", {
    status: row?.status,
    creator: row?.creatorUsername,
    caption: row?.caption?.slice(0, 60),
    hashtags: row?.hashtags,
    thumbnailUrl: row?.thumbnailUrl,
    transcriptChars: row?.transcript?.length,
    embeddingDims: emb?.dims,
  });

  // full transcript (the row is deleted at the end unless KEEP=1)
  console.log("\nTRANSCRIPT:\n" + (row?.transcript ?? "(none)"));
  if (row?.summary) console.log("\nSUMMARY:\n" + row.summary);

  if (BAD) {
    check("bad url ends in failed", row?.status === "failed");
  } else {
    check("status is ready", row?.status === "ready");
    check("embedding is 1024 dims", emb?.dims === 1024);
    check("transcript saved", !!row?.transcript);
    check("thumbnail saved", !!row?.thumbnailUrl);
  }

  // ===== 2. CHAT =====
  if (CHAT && !BAD && row?.status === "ready") {
    const token = tokenFor(user.id);

    console.log("\n[2] chat");
    const convo = await prisma.conversation.create({
      data: { userId: user.id },
    });
    convoIds.push(convo.id);

    // contentId loads this reel's details into the agent's context
    const r1 = await chat(
      token,
      convo.id,
      "What is this reel about?",
      content.id,
    );
    console.log("chat status", r1.status, "body:", r1.text.slice(0, 200));
    check("chat route returns 2xx", r1.ok);
    check("chat reply is non-empty", replyOf(r1).trim().length > 0);
    check(
      "response references this reel",
      JSON.stringify(r1.json ?? r1.text).includes(content.id),
    );

    const msgs = await prisma.message.findMany({
      where: { conversationId: convo.id },
    });
    check("user message saved", msgs.some((m) => m.role === "user"));
    check("assistant message saved", msgs.some((m) => m.role === "assistant"));
  } else if (CHAT) {
    console.log("\n[2] chat skipped (reel not ready or BAD=1)");
  }

  // ===== summary =====
  const ok = results.every((r) => r.ok);
  console.log(
    `\n${results.filter((r) => r.ok).length}/${results.length} checks passed`,
  );
  console.log(ok ? "PASS" : "FAIL");

  // ===== cleanup =====
  if (KEEP) {
    console.log("KEEP=1, left rows for user", user.id);
  } else if (AUTH_TOKEN) {
    // existing user: remove only what this run created
    await prisma.content.deleteMany({ where: { id: content.id } });
    await prisma.conversation.deleteMany({ where: { id: { in: convoIds } } });
  } else {
    await prisma.user.delete({ where: { id: user.id } }); // cascades to everything
  }

  await disconnectProducer();
  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});