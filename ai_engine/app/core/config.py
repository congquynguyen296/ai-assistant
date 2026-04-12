"""
ai_engine/app/core/config.py
Centralized configuration — reads from environment variables.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# ── Server ────────────────────────────────────────────────────────────────────
PORT: int = int(os.getenv("PORT", "8000"))

# ── Internal Auth ─────────────────────────────────────────────────────────────
INTERNAL_API_KEY: str = os.getenv("INTERNAL_API_KEY", "")

# ── Gemini Embedding ──────────────────────────────────────────────────────────
GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "models/gemini-embedding-001")
EMBEDDING_TASK_TYPE: str = "RETRIEVAL_DOCUMENT"       # optimised for semantic retrieval

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
