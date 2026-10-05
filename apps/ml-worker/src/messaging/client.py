import ssl
from typing import Any

from config import settings


def connection_kwargs() -> dict[str, Any]:
    """Shared aiokafka connection options, driven by the same env as packages/kafka."""
    kwargs: dict[str, Any] = {
        "bootstrap_servers": settings.kafka_brokers_list,
        "client_id": settings.KAFKA_CLIENT_ID,
    }
    if settings.KAFKA_SSL or settings.KAFKA_SASL_USERNAME:
        kwargs["ssl_context"] = ssl.create_default_context()
        kwargs["security_protocol"] = "SSL"
    if settings.KAFKA_SASL_USERNAME and settings.KAFKA_SASL_PASSWORD:
        kwargs["security_protocol"] = "SASL_SSL"
        kwargs["sasl_mechanism"] = "SCRAM-SHA-256"
        kwargs["sasl_plain_username"] = settings.KAFKA_SASL_USERNAME
        kwargs["sasl_plain_password"] = settings.KAFKA_SASL_PASSWORD.get_secret_value()
    return kwargs