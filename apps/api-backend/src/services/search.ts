import { prisma } from "@repo/db-prisma";
 
export const CONTENT_TYPES = [
  "reel",
  "post",
  "screenshot",
  "tweet",
  "notion_page",
] as const;
export type ContentTypeName = (typeof CONTENT_TYPES)[number];
 
const EMBED_URL = "https://api.mistral.ai/v1/embeddings";
// cosine similarity cutoff for semantic hits. TUNE THIS: check the semanticScore
// values returned for relevant vs irrelevant queries and adjust via env.
const MIN_SCORE = Number(process.env.SEARCH_MIN_SCORE ?? 0.5);
 
type ContentRow = {
  id: string;
  type: string;
  mediaType: string | null;
  sourceUrl: string;
  creatorUsername: string | null;
  caption: string | null;
  thumbnailUrl: string | null;
  hashtags: string[];
  createdAt: Date;
  keywordMatch: boolean;
  semanticScore: number | null;
};
 
// Fail-open: if embedding fails we still return keyword results.
async function embedQuery(q: string): Promise<number[] | null> {
  try {
    const res = await fetch(EMBED_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.MISTRAL_EMBED_MODEL ?? "mistral-embed",
        input: [q],
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("[search] embed failed", res.status);
      return null;
    }
    const json = (await res.json()) as { data?: { embedding?: number[] }[] };
    const vec = json.data?.[0]?.embedding;
    return vec && vec.length === 1024 ? vec : null;
  } catch (err) {
    console.error("[search] embed error", err);
    return null;
  }
}
 
// escape LIKE wildcards so "100%" or "a_b" match literally
const likePattern = (q: string) => `%${q.replace(/[\\%_]/g, "\\$&")}%`;
 
export async function searchAll(
  userId: string,
  opts: { q: string; type: ContentTypeName | null; limit: number },
) {
  const { q, type, limit } = opts;
  const like = likePattern(q);
 
  const [folders, vec] = await Promise.all([
    prisma.collection.findMany({
      where: { userId, name: { contains: q, mode: "insensitive" } },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: { select: { contents: true } },
      },
    }),
    embedQuery(q),
  ]);
 
  const vecStr = vec ? `[${vec.join(",")}]` : null;
 
  // One query: keyword CTE + semantic CTE, merged. Keyword hits rank first,
  // then semantic hits by similarity. With vecStr = null, only keyword runs.
  const rows = await prisma.$queryRaw<ContentRow[]>`
    WITH kw AS (
      SELECT c.id
      FROM "Content" c
      WHERE c."userId" = ${userId}
        AND c."deletedAt" IS NULL
        AND c.status = 'ready'
        AND (${type}::"ContentType" IS NULL OR c.type = ${type}::"ContentType")
        AND (
          c.caption ILIKE ${like}
          OR c.transcript ILIKE ${like}
          OR c."ocrText" ILIKE ${like}
          OR c."visionCaption" ILIKE ${like}
          OR c."creatorUsername" ILIKE ${like}
          OR EXISTS (SELECT 1 FROM unnest(c.hashtags) h WHERE h ILIKE ${like})
          OR EXISTS (SELECT 1 FROM unnest(c.tags) t WHERE t ILIKE ${like})
        )
    ),
    sem AS (
      SELECT c.id, 1 - (c.embedding <=> ${vecStr}::vector) AS score
      FROM "Content" c
      WHERE ${vecStr}::vector IS NOT NULL
        AND c."userId" = ${userId}
        AND c."deletedAt" IS NULL
        AND c.status = 'ready'
        AND c.embedding IS NOT NULL
        AND (${type}::"ContentType" IS NULL OR c.type = ${type}::"ContentType")
      ORDER BY c.embedding <=> ${vecStr}::vector
      LIMIT ${limit}
    )
    SELECT c.id, c.type::text AS type, c."mediaType"::text AS "mediaType",
           c."sourceUrl", c."creatorUsername", c.caption, c."thumbnailUrl",
           c.hashtags, c."createdAt",
           (kw.id IS NOT NULL) AS "keywordMatch",
           sem.score AS "semanticScore"
    FROM "Content" c
    LEFT JOIN kw ON kw.id = c.id
    LEFT JOIN sem ON sem.id = c.id
    WHERE kw.id IS NOT NULL OR (sem.score IS NOT NULL AND sem.score >= ${MIN_SCORE})
    ORDER BY (kw.id IS NOT NULL) DESC, sem.score DESC NULLS LAST, c."createdAt" DESC
    LIMIT ${limit}`;
 
  return {
    query: q,
    semantic: vec !== null, // false = embedding failed, keyword results only
    folders: folders.map((f) => ({
      id: f.id,
      name: f.name,
      createdAt: f.createdAt,
      contentCount: f._count.contents,
    })),
    content: rows.map((r) => ({
      ...r,
      semanticScore:
        r.semanticScore === null ? null : Math.round(r.semanticScore * 1000) / 1000,
    })),
  };
}
 