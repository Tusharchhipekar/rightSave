import structlog
from pgvector.psycopg import register_vector_async
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool

from config import settings

log = structlog.get_logger()

_pool: AsyncConnectionPool | None = None


async def _configure(conn) -> None:
    await register_vector_async(conn)


async def init_pool() -> AsyncConnectionPool:
    global _pool
    if _pool is not None:
        return _pool

    url = settings.DATABASE_URL_READONLY.get_secret_value().strip()
    if not url:
        raise RuntimeError("DATABASE_URL_READONLY is empty")

    _pool = AsyncConnectionPool(
        conninfo=url,
        min_size=1,
        max_size=settings.DB_POOL_MAX,
        kwargs={
            "row_factory": dict_row,
            "autocommit": True,
            "prepare_threshold": None,  # safe behind Neon's pooler / pgbouncer
        },
        configure=_configure,
        open=False,
    )
    await _pool.open(wait=True, timeout=15)
    log.info("db.pool_ready", max_size=settings.DB_POOL_MAX)
    return _pool


def get_pool() -> AsyncConnectionPool:
    if _pool is None:
        raise RuntimeError("db pool not initialised")
    return _pool


async def close_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None
        log.info("db.pool_closed")