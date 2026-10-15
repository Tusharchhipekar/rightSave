import { prisma, IngestSource } from "@repo/db-prisma";

const API_BACKEND = `http://localhost:${process.env.API_BACKEND_PORT ?? "4002"}`;
const API_URL = `${API_BACKEND}/api/v1`;
const AUTH_URL = `${process.env.AUTH_URL ?? "http://localhost:4001"}/api/v1/auth`;
const ML_URL = new URL(process.env.ML_WORKER_URL ?? "http://localhost:8000");
const SECRET = process.env.INTERNAL_SECRET ?? "change-me";

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, extra?: unknown) {
  if (cond) {
    passed++;
    console.log(`PASS  ${name}`);
  } else {
    failed++;
    console.log(`FAIL  ${name}`, extra ?? "");
  }
}

// ---- stub ml-worker ----
type Recorded = { secret: string | null; body: any };
const calls: Recorded[] = [];
let mode: "ok" | "fail" | "reject" = "ok";

const stub = Bun.serve({
  port: Number(ML_URL.port || 8000),
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method !== "POST" || url.pathname !== "/chat") {
      return new Response("not found", { status: 404 });
    }
    const secret = req.headers.get("x-internal-secret");
    const body: any = await req.json().catch(() => null);
    calls.push({ secret, body });
    if (mode === "reject" || secret !== SECRET) {
      return new Response("forbidden", { status: 401 });
    }
    if (mode === "fail") return new Response("boom", { status: 500 });
    return Response.json({
      answer: `stub answer to: ${body?.message}`,
      sources: [{ type: "saved", contentId: "c-1" }],
      toolsUsed: ["search_saved_content"],
    });
  },
});

// ---- helpers ----
const suffix = Date.now();

async function makeUser(tag: string) {
  const email = `chat_${tag}_${suffix}@test.com`;
  const res = await fetch(`${AUTH_URL}/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      username: `chat_${tag}_${suffix}`,
      email,
      password: "password123",
      fullName: `Chat ${tag}`,
    }),
  });
  const j: any = await res.json().catch(() => ({}));
  if (!j.accessToken) {
    throw new Error(`signup failed: ${res.status} ${JSON.stringify(j)}`);
  }
  const user = await prisma.user.findFirstOrThrow({ where: { email } });
  return { id: user.id, token: j.accessToken as string };
}

async function seedContent(userId: string, n: number) {
  return prisma.content.create({
    data: {
      userId,
      type: "reel",
      sourceUrl: `https://www.instagram.com/reel/test-${suffix}-${n}/`,
      ingestSource: Object.values(IngestSource)[0],
    } as any,
  });
}

async function chat(token: string | null, body: unknown) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json: any = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

// ---- tests ----
async function main() {
  const A = await makeUser("a");
  const B = await makeUser("b");
  const contentA = await seedContent(A.id, 1);
  const contentB = await seedContent(B.id, 2);

  console.log("1. new chat");
  calls.length = 0;
  const msg1 = "x".repeat(80);
  const r1 = await chat(A.token, { message: msg1 });
  check("200 + conversationId", r1.status === 200 && !!r1.json.conversationId, r1);
  const convId: string = r1.json.conversationId;
  const msgs1 = await prisma.message.findMany({
    where: { conversationId: convId },
    orderBy: { createdAt: "asc" },
  });
  check("2 messages saved", msgs1.length === 2, msgs1.length);
  check("order user -> assistant", msgs1[0]?.role === "user" && msgs1[1]?.role === "assistant");
  check(
    "assistant has sources + toolsUsed",
    Array.isArray(msgs1[1]?.sources) && Array.isArray(msgs1[1]?.toolsUsed),
  );
  const conv = await prisma.conversation.findUniqueOrThrow({ where: { id: convId } });
  check("title truncated to 60", conv.title === msg1.slice(0, 60), conv.title);
  check("lastMessageText set", !!conv.lastMessageText && !!conv.lastMessageAt);
  check("stub got empty history", calls[0]?.body?.history?.length === 0);
  check("stub got userId", calls[0]?.body?.userId === A.id);

  console.log("2. follow-up passes history");
  calls.length = 0;
  const r2 = await chat(A.token, { conversationId: convId, message: "second" });
  check("200", r2.status === 200, r2);
  const h = calls[0]?.body?.history ?? [];
  check(
    "history has 2 items oldest-first",
    h.length === 2 && h[0].role === "user" && h[1].role === "assistant",
    h,
  );

  console.log("3. contentId forwarded");
  calls.length = 0;
  const r3 = await chat(A.token, { message: "about this reel", contentId: contentA.id });
  check("200", r3.status === 200, r3);
  check("stub got contentId", calls[0]?.body?.contentId === contentA.id);

  console.log("4. foreign contentId");
  calls.length = 0;
  const r4 = await chat(A.token, { message: "hi", contentId: contentB.id });
  check("404", r4.status === 404, r4);
  check("stub not called", calls.length === 0);

  console.log("5. foreign conversationId");
  const r5 = await chat(B.token, { conversationId: convId, message: "hi" });
  check("404", r5.status === 404, r5);

  console.log("6. bad body");
  const r6a = await chat(A.token, { message: "" });
  const r6b = await chat(A.token, { message: "hi", contentId: "not-a-uuid" });
  check("empty message 400", r6a.status === 400, r6a);
  check("bad contentId 400", r6b.status === 400, r6b);

  console.log("7. no token");
  const r7 = await chat(null, { message: "hi" });
  check("401", r7.status === 401, r7);

  console.log("8. ml-worker failure");
  mode = "fail";
  const before = await prisma.message.count({ where: { conversationId: convId } });
  const r8 = await chat(A.token, { conversationId: convId, message: "will fail" });
  const after = await prisma.message.count({ where: { conversationId: convId } });
  check("502", r8.status === 502, r8);
  check("nothing saved", before === after, { before, after });

  console.log("9. ml-worker rejects secret");
  mode = "reject";
  const r9 = await chat(A.token, { conversationId: convId, message: "rejected" });
  check("502", r9.status === 502, r9);
  mode = "ok";

  console.log(`\n${passed} passed, ${failed} failed`);
}

main()
  .catch((e) => {
    console.error("Test run crashed:", e);
    failed++;
  })
  .finally(async () => {
    stub.stop(true);
    await prisma.$disconnect();
    process.exit(failed ? 1 : 0);
  });