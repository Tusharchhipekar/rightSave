from functools import lru_cache
from pathlib import Path

from pydantic import SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Service ---
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    # --- Kafka (same env names as packages/kafka) ---
    KAFKA_BROKERS: str = "localhost:9092"
    KAFKA_CLIENT_ID: str = "rightsave-ml-worker"
    KAFKA_SSL: bool = False
    KAFKA_SASL_USERNAME: str | None = None
    KAFKA_SASL_PASSWORD: SecretStr | None = None
    KAFKA_GROUP_ID: str = "ml-worker-content-ingest"
    TOPIC_INGEST: str = "content-ingest"
    TOPIC_PROCESSED: str = "content-processed"
    TOPIC_INGEST_DLQ: str = "content-ingest.dlq"
    MAX_ATTEMPTS: int = 3
    RETRY_BACKOFF_BASE_S: float = 2.0

    # --- Job limits ---
    MAX_JOB_AGE_SECONDS: int = 3600  # skip older jobs (CDN link likely expired)
    DOWNLOAD_TIMEOUT_SECONDS: int = 60
    MAX_VIDEO_BYTES: int = 104857600
    MAX_AUDIO_SECONDS: int = 600

    # --- Whisper (local, English) ---
    WHISPER_MODEL: str = "base"
    WHISPER_COMPUTE_TYPE: str = "int8"
    WHISPER_ENGLISH_MIN_PROB: float = 0.9

    # --- Sarvam (Hinglish -> English) ---
    SARVAM_API_KEY: SecretStr = SecretStr("")
    SARVAM_STT_URL: str = "https://api.sarvam.ai/speech-to-text"
    SARVAM_STT_MODEL: str = "saaras:v3"
    SARVAM_STT_MODE: str = "translate"
    SARVAM_CHUNK_SECONDS: int = 28

    # --- Mistral (embeddings + RAG chat) ---
    MISTRAL_API_KEY: SecretStr
    MISTRAL_EMBED_MODEL: str = "mistral-embed"
    EMBED_DIMENSIONS: int = 1024  # must equal the pgvector column and the zod schema

    # --- oEmbed (optional; blank = no token) ---
    META_OEMBED_TOKEN: SecretStr | None = None


    # --- ImageKit (thumbnail storage) ---
    IMAGEKIT_PRIVATE_KEY: SecretStr = SecretStr("")
    IMAGEKIT_URL_ENDPOINT: str = ""

    @field_validator("MISTRAL_API_KEY")
    @classmethod
    def _key_not_blank(cls, v: SecretStr) -> SecretStr:
        if not v.get_secret_value().strip():
            raise ValueError("MISTRAL_API_KEY is empty")
        return v

    @property
    def kafka_brokers_list(self) -> list[str]:
        return [b.strip() for b in self.KAFKA_BROKERS.split(",") if b.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()