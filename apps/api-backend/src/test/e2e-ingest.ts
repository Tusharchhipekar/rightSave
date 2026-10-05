
import { prisma } from "@repo/db-prisma";
import { publishIngest } from "../services/content-ingest";
import { disconnectProducer } from "@repo/kafka";

const REEL_URL =
  process.env.REEL_URL ?? "https://www.instagram.com/reel/DeBRZNxNjRc/";
const BAD = process.env.BAD === "1";
const sourceUrl = BAD
  ? "https://www.instagram.com/reel/DOESNOTEXIST000/"
  : REEL_URL;
const TIMEOUT_MS = 180_000;

const suffix = Date.now();

async function main() {
  const user = await prisma.user.create({
    data: {
      username: `e2e_${suffix}`,
      email: `e2e_${suffix}@test.com`,
      fullName: "E2E Test",
    },
  });

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
  while (Date.now() - started < TIMEOUT_MS) {
    row = await prisma.content.findUnique({ where: { id: content.id } });
    if (row && row.status !== last) {
      last = row.status;
      console.log(`status -> ${row.status} (+${Math.round((Date.now() - started) / 1000)}s)`);
    }
    if (row?.status === "ready" || row?.status === "failed") break;
    await new Promise((r) => setTimeout(r, 1000));
  }

  const [emb] = await prisma.$queryRaw<{ dims: number | null }[]>`
    SELECT vector_dims(embedding) AS dims FROM "Content" WHERE id = ${content.id}`;

  console.log("\nresult:", {
    status: row?.status,
    creator: row?.creatorUsername,
    caption: row?.caption?.slice(0, 60),
    hashtags: row?.hashtags,
    thumbnailUrl: row?.thumbnailUrl,
    transcriptChars: row?.transcript?.length,
    embeddingDims: emb?.dims,
  });

  const expected = BAD ? "failed" : "ready";
  const ok =
    row?.status === expected &&
    (BAD || (emb?.dims === 1024 && !!row?.transcript && !!row?.thumbnailUrl));
  console.log(ok ? "\nPASS" : "\nFAIL");

  await prisma.user.delete({ where: { id: user.id } }); // cascades to Content
  await disconnectProducer();
  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});