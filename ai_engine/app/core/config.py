"""
ai_engine/app/core/config.py
Centralized configuration — reads from environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ── Server ────────────────────────────────────────────────────────────────────
PORT: int = int(os.getenv("PORT", "8000"))

# ── Logging ───────────────────────────────────────────────────────────────────
LOG_PATH: str = os.getenv("AI_ENGINE_LOG_PATH", "logs/ai_engine.log")

# ── Internal Auth ─────────────────────────────────────────────────────────────
INTERNAL_API_KEY: str = os.getenv("INTERNAL_API_KEY", "")

# ── Gemini Embedding ──────────────────────────────────────────────────────────
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "models/gemini-embedding-001")
EMBEDDING_TASK_TYPE: str = "RETRIEVAL_DOCUMENT"       # optimised for semantic retrieval
EMBEDDING_BATCH_SIZE: int = int(os.getenv("EMBEDDING_BATCH_SIZE", "100"))
EMBEDDING_INTER_BATCH_DELAY: float = float(os.getenv("EMBEDDING_INTER_BATCH_DELAY", "0.6"))
EMBEDDING_MAX_RETRIES: int = int(os.getenv("EMBEDDING_MAX_RETRIES", "3"))
EMBEDDING_RETRY_BASE_DELAY: float = float(os.getenv("EMBEDDING_RETRY_BASE_DELAY", "1.0"))

# ── Embedding Cache ───────────────────────────────────────────────────────────
EMBEDDING_CACHE_ENABLED: bool = os.getenv("EMBEDDING_CACHE_ENABLED", "true").lower() in (
	"1",
	"true",
	"yes",
	"on",
)
REDIS_URL: str = os.getenv("REDIS_URL", "")
EMBEDDING_CACHE_TTL_SECONDS: int = int(os.getenv("EMBEDDING_CACHE_TTL_SECONDS", "2592000"))

# ── Qdrant Cloud ──────────────────────────────────────────────────────────────
QDRANT_URL: str = os.getenv("QDRANT_URL", "")
QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
QDRANT_COLLECTION: str = os.getenv("QDRANT_COLLECTION", "documents_collection")
VECTOR_SIZE: int = int(os.getenv("VECTOR_SIZE", "768"))

# ── Chunker ───────────────────────────────────────────────────────────────────
DEFAULT_CHUNK_SIZE: int = 500    # words per chunk
DEFAULT_OVERLAP: int = 50        # overlapping words between consecutive chunks

# ── Retriever ─────────────────────────────────────────────────────────────────
# Documents with <= SMALL_DOC_THRESHOLD chunks are sent in full (no vector search)
SMALL_DOC_THRESHOLD: int = 10
