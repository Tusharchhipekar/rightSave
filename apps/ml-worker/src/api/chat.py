import hmac
from typing import Any, Literal

import structlog
from fastapi import APIRouter, BackgroundTasks, Header, HTTPException
from pydantic import BaseModel, Field

from agent.context import ToolContext
from agent.runner import FALLBACK_ANSWER, run_agent
from config import settings
from services import memory

log = structlog.get_logger()

router = APIRouter()


class HistoryMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(max_length=4000)


class ChatRequest(BaseModel):
    userId: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=1, max_length=4000)
    history: list[HistoryMessage] = Field(default_factory=list, max_length=20)
    contentId: str | None = Field(default=None, max_length=100)


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict[str, Any]]
    toolsUsed: list[str]
    limitHit: bool


def _check_secret(provided: str | None) -> None:
    expected = settings.INTERNAL_SECRET.get_secret_value()
    if not expected:
      
        raise HTTPException(status_code=503, detail="chat not configured")
    if not provided or not hmac.compare_digest(provided, expected):
        raise HTTPException(status_code=401, detail="unauthorized")


def _flatten_sources(sources: dict[str, list[dict[str, Any]]]) -> list[dict[str, Any]]:
    """Agent sources -> the flat list the api-backend schema expects."""
    out: list[dict[str, Any]] = []
    for s in sources.get("saved", []):
        if s.get("id"):
            out.append({"type": "saved", "contentId": s["id"]})
    for w in sources.get("web", []):
        if w.get("url"):
            item: dict[str, Any] = {"type": "web", "url": w["url"]}
            if w.get("title"):
                item["title"] = w["title"]
            out.append(item)
    return out


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    background: BackgroundTasks,
    x_internal_secret: str | None = Header(default=None),
) -> ChatResponse:
    _check_secret(x_internal_secret)

    ctx = ToolContext(user_id=body.userId, content_id=body.contentId)
    history = [m.model_dump() for m in body.history]

    try:
        result = await run_agent(ctx, body.message, history)
    except Exception as err:  # noqa: BLE001
        log.error("chat.failed", error=repr(err), exc_info=True)
        detail = f"agent failed: {err!r}" if settings.EXPOSE_ERRORS else "agent failed"
        raise HTTPException(status_code=502, detail=detail) from err

    if result.answer != FALLBACK_ANSWER:
        background.add_task(memory.add, body.userId, body.message, result.answer)

    return ChatResponse(
        answer=result.answer,
        sources=_flatten_sources(result.sources),
        toolsUsed=result.tools_used,
        limitHit=result.limit_hit,
    )