
/
Claude finished the response
Resolving a naming mismatch before applying the fix.
Resolving a naming mismatch before applying the fix.
dotenv
# apps/ml-worker/.env.example  (commit this)
# apps/ml-worker/.env          (copy it, fill the keys, do NOT commit)

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=rightsave-ml-worker
KAFKA_SSL=false
KAFKA_GROUP_ID=ml-worker-content-ingest
TOPIC_INGEST=content-ingest
TOPIC_PROCESSED=content-processed
TOPIC_INGEST_DLQ=content-ingest.dlq
MAX_ATTEMPTS=3

# Job limits
MAX_JOB_AGE_SECONDS=3600
DOWNLOAD_TIMEOUT_SECONDS=60
MAX_VIDEO_BYTES=104857600
MAX_AUDIO_SECONDS=600

# Whisper (local, English)
WHISPER_MODEL=small
WHISPER_COMPUTE_TYPE=int8
WHISPER_ENGLISH_MIN_PROB=0.9

# Sarvam (Hinglish -> English)
SARVAM_API_KEY=
SARVAM_STT_URL=https://api.sarvam.ai/speech-to-text
SARVAM_STT_MODEL=saaras:v3
SARVAM_STT_MODE=translate
SARVAM_CHUNK_SECONDS=28

# Mistral embeddings (must match pgvector column and zod schema: 1024)
MISTRAL_API_KEY=
MISTRAL_EMBED_MODEL=mistral-embed
EMBED_DIMENSIONS=1024

# oEmbed (optional)
META_OEMBED_TOKEN=

PORT=8000
I fixed the last line to PORT=8000 and left everything else as you pasted it. That includes KAFKA_CLIENT_ID=rightsave-ml-worker. If you'd rather use rightsave, change that one line.

Ready for the pipeline handler and main.py?

config it correct?

Ran a command
Yes, it's correct. I loaded config.py with your exact .env (using a dummy Mistral key) and it started without errors: port 8000, 1024 dims, mistral-embed, 3 attempts.

Before you run the worker:

Real .env: copy .env.example to .env and fill in MISTRAL_API_KEY. A blank value stops the worker at startup. SARVAM_API_KEY can stay blank until you test Hinglish.
Repo changes for 1024: these are still on your side:
schema.prisma, with both vector(1536) columns changed to vector(1024)
the new migration
schemas.ts, with .length(1536) changed to .length(1024)
Until they're done, saving a processed reel will fail.
Next is the pipeline handler and main.py. Should I start?

Screenshot 2026-10-05 at 6.11.35 AM.png
where to add consumer and producr and init and client

Ran a command, shared files
Put all four files (__init__.py, client.py, producer.py, consumer.py) in src/kafka/, but rename that folder to src/messaging/. A folder named kafka can shadow a library of the same name that Kafka tools may import, and my imports use messaging.

ml-worker/
├── .env                      ← stays here
├── .env.example              ← your file is named .env.examole, fix the typo
└── src/
    ├── main.py
    ├── config/
    │   ├── __init__.py       ← new, one line (below)
    │   └── config.py         ← replace with my updated file
    ├── messaging/            ← renamed from kafka
    │   ├── __init__.py       (empty)
    │   ├── client.py
    │   ├── producer.py
    │   └── consumer.py
    ├── schemas/schemas.py
    ├── pipeline/, services/, transcribes/, utils/
The new src/config/__init__.py contains one line:

python
from config.config import settings
With it, every file can use from config import settings.

.env path: I fixed config.py, which was looking for .env next to itself (src/config/). It now goes up to ml-worker/.env, where yours is.
Running: start it from inside src/, for example uvicorn main:app --port 8000. That's what lets config and messaging be found.
Imports: I tested this layout. Both packages import cleanly, once aiokafka and structlog are installed. Add structlog to requirements.txt if it's missing. It isn't in the file you showed me before.
Next is the pipeline code, which goes in src/pipeline/ and src/services/. Should I start?


Config
PY 

init
PY 

Client
PY 

Producer
PY 

Consumer
PY 




Claude is AI and can make mistakes.
Client · PY
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
 







