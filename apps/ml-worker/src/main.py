import asyncio
import logging
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI, Response

from config import settings
from messaging.consumer import run_consumer
from messaging.producer import stop_producer
from pipeline.handler import handle_ingest  # next file: async def handle_ingest(payload: dict) -> None
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
    task = asyncio.create_task(
        run_consumer(settings.TOPIC_INGEST, handle_ingest, stop),
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
        except Exception as err:  # noqa: BLE001
            log.error("worker.consumer_error", error=str(err))
        await stop_producer()
        await close_embedder()
        log.info("worker.stopped")


app = FastAPI(title="rightsave ml-worker", lifespan=lifespan)


@app.get("/healthz")
async def healthz() -> dict[str, str]:
    # liveness: the process is up
    return {"status": "ok"}


@app.get("/readyz")
async def readyz(response: Response) -> dict[str, str]:
    # readiness: the consumer loop is still running
    task: asyncio.Task | None = getattr(app.state, "consumer_task", None)
    if task is None or task.done():
        response.status_code = 503
        return {"status": "consumer_down"}
    return {"status": "ready"}