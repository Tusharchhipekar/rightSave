from dataclasses import dataclass


@dataclass(frozen=True)
class ToolContext:
    """Set by the /chat endpoint, never by the model."""

    user_id: str
    content_id: str | None = None 