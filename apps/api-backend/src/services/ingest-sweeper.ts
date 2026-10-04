import { prisma } from "@repo/db-prisma";
import { setNX } from "@repo/redis";
import { publishIngest } from "./content-ingest";

const INTERVAL_MS = 60_000;
const MIN_AGE_MS = 2 * 60_000;
const MAX_AGE_MS = 60 * 60_000;
const REPUBLISH_COOLDOWN_S = 5 * 60;
const BATCH = 50;

async function sweep() {
  if (!(await setNX("lock:ingest-sweeper", 50))) return;

  const now = Date.now();

  await prisma.content.updateMany({
    where: {
      status: "pending",
      deletedAt: null,
      createdAt: { lt: new Date(now - MAX_AGE_MS) },
    },
    data: { status: "failed" },
  });

  const stuck = await prisma.content.findMany({
    where: {
      status: "pending",
      deletedAt: null,
      createdAt: {
        lt: new Date(now - MIN_AGE_MS),
        gte: new Date(now - MAX_AGE_MS),
      },
    },
    select: {
      id: true,
      userId: true,
      sourceUrl: true,
      type: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
    take: BATCH,
  });

  for (const c of stuck) {
    if (!(await setNX(`ingest:republished:${c.id}`, REPUBLISH_COOLDOWN_S))) continue;
    try {
      await publishIngest(c);
      console.log("[ingest-sweeper] republished", c.id);
    } catch (err) {
      console.error("[ingest-sweeper] publish failed", (err as Error).message);
      break;
    }
  }
}

export const startIngestSweeper = () => {
  const t = setInterval(() => {
    sweep().catch((err) =>
      console.error("[ingest-sweeper] sweep failed", (err as Error).message),
    );
  }, INTERVAL_MS);
  t.unref();
  return t;
};