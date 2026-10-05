from datetime import datetime
from typing import Annotated, Literal, Union

from pydantic import BaseModel, Field, HttpUrl

ContentType = Literal["reel", "post", "screenshot", "tweet", "notion_page"]
MediaType = Literal["image", "video", "carousel"]


class ContentIngest(BaseModel):
    contentId: str
    userId: str
    sourceUrl: HttpUrl
    type: ContentType
    receivedAt: datetime


class Processing(BaseModel):
    contentId: str
    userId: str
    status: Literal["processing"] = "processing"


class Ready(BaseModel):
    contentId: str
    userId: str
    status: Literal["ready"] = "ready"
    mediaType: MediaType | None = None
    creatorUsername: str | None = None
    caption: str | None = None
    hashtags: list[str] = Field(default_factory=list)
    thumbnailUrl: HttpUrl | None = None
    transcript: str | None = None
    ocrText: str | None = None
    visionCaption: str | None = None
    tags: list[str] = Field(default_factory=list)
    embedding: list[float] = Field(min_length=1536, max_length=1536)


class Failed(BaseModel):
    contentId: str
    userId: str
    status: Literal["failed"] = "failed"
    error: str
    retryable: bool


ContentProcessed = Annotated[
    Union[Processing, Ready, Failed], Field(discriminator="status")
]