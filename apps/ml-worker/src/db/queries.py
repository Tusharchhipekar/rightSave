from typing import Any

import numpy as np

from db.pool import get_pool

SNIPPET_CHARS = 500


def _vec(embedding: list[float]) -> np.ndarray:
    return np.asarray(embedding, dtype=np.float32)


async def search_content(
    user_id: str,
    embedding: list[float],
    limit: int = 5,
    collection: str | None = None,
) -> list[dict[str, Any]]:
    """Top-k saved items for this user by cosine similarity (snippet only)."""
    vec = _vec(embedding)
    params: list[Any] = [vec, user_id]

    collection_sql = ""
    if collection:
        collection_sql = """
          AND EXISTS (
            SELECT 1
            FROM "ContentCollection" cc
            JOIN "Collection" col ON col.id = cc."collectionId"
            WHERE cc."contentId" = c.id
              AND col."userId" = c."userId"
              AND col.name = %s
          )"""
        params.append(collection)

    params += [vec, limit]

    sql = f"""
        SELECT c.id,
               c."type"::text        AS type,
               c."creatorUsername"   AS creator,
               c.caption,
               left(c.transcript, {SNIPPET_CHARS}) AS snippet,
               c.hashtags,
               c.tags,
               c."thumbnailUrl"      AS thumbnail_url,
               c."sourceUrl"         AS source_url,
               c."createdAt"         AS created_at,
               1 - (c.embedding <=> %s) AS similarity
        FROM "Content" c
        WHERE c."userId" = %s
          AND c.status = 'ready'
          AND c."deletedAt" IS NULL
          AND c.embedding IS NOT NULL
          {collection_sql}
        ORDER BY c.embedding <=> %s
        LIMIT %s
    """
    async with get_pool().connection() as conn:
        cur = await conn.execute(sql, params)
        return await cur.fetchall()


async def get_content(user_id: str, content_id: str) -> dict[str, Any] | None:
    """Full details of one saved item (only if it belongs to this user)."""
    sql = """
        SELECT c.id,
               c."type"::text        AS type,
               c."creatorUsername"   AS creator,
               c.caption,
               c.transcript,
               c."ocrText"           AS ocr_text,
               c."visionCaption"     AS vision_caption,
               c.hashtags,
               c.tags,
               c."thumbnailUrl"      AS thumbnail_url,
               c."sourceUrl"         AS source_url,
               c."createdAt"         AS created_at
        FROM "Content" c
        WHERE c.id = %s
          AND c."userId" = %s
          AND c."deletedAt" IS NULL
    """
    async with get_pool().connection() as conn:
        cur = await conn.execute(sql, [content_id, user_id])
        return await cur.fetchone()


async def search_memories(
    user_id: str,
    embedding: list[float],
    limit: int = 5,
    memory_type: str | None = None, 
) -> list[dict[str, Any]]:
    """Top-k active long-term memories for this user by cosine similarity."""
    vec = _vec(embedding)
    params: list[Any] = [vec, user_id]

    type_sql = ""
    if memory_type:
        type_sql = "AND m.type::text = %s"
        params.append(memory_type)

    params += [vec, limit]

    sql = f"""
        SELECT m.id,
               m.content,
               m.source::text   AS source,
               m."createdAt"    AS created_at,
               1 - (m.embedding <=> %s) AS similarity
        FROM "UserMemory" m
        WHERE m."userId" = %s
          AND m."isActive" = true
          AND m.embedding IS NOT NULL
          {type_sql}
        ORDER BY m.embedding <=> %s
        LIMIT %s
    """
    async with get_pool().connection() as conn:
        cur = await conn.execute(sql, params)
        return await cur.fetchall()