import asyncio
import logging
from contextlib import asynccontextmanager
from db.pool import close_pool, init_pool
from agent.tools.web_search import close_web_search 
from agent.llm import close_llm 
from api.chat import router as chat_router

import structlog
from fastapi import FastAPI, Response

from config import settings
from messaging.consumer import run_consumer
from messaging.producer import stop_producer
from pipeline.handler import handle_dead_letter, handle_ingest
from services.embedder import close_embedder

logging.basicConfig(level=settings.LOG_LEVEL, format="%(message)s")
structlog.configure(
    processors=[
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(
        logging.getLevelName(settings.LOG_LEVEL.upper())
    ),
)
log = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    stop = asyncio.Event()
    await init_pool()
    task = asyncio.create_task(
        run_consumer(
            settings.TOPIC_INGEST,
            handle_ingest,
            stop,
            on_dead_letter=handle_dead_letter,
        ),
        name="ingest-consumer",
    )
    app.state.stop = stop
    app.state.consumer_task = task
    log.info("worker.started", port=settings.PORT)

    try:
        yield
    finally:
        log.info("worker.stopping")
        stop.set()
        try:
            await asyncio.wait_for(task, timeout=30)
        except asyncio.TimeoutError:
            log.warning("worker.consumer_stop_timeout")
            task.cancel()
        except Exception as err: 
            log.error("worker.consumer_error", error=str(err))
        await stop_producer()
        await close_embedder()
        await close_web_search()
        await close_llm()
        await close_pool()
        log.info("worker.stopped")


app = FastAPI(title="rightsave ml-worker", lifespan=lifespan)
app.include_router(chat_router)


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/readyz")
async def readyz(response: Response) -> dict[str, str]:
    task: asyncio.Task | None = getattr(app.state, "consumer_task", None)
    if task is None or task.done():
        response.status_code = 503
        return {"status": "consumer_down"}
    return {"status": "ready"}