"""
ai_engine/app/rag/embedder.py
Gemini Embedding API — zero RAM footprint on server (all compute happens on Google's servers).
Model: text-embedding-004 (768-dim), task_type RETRIEVAL_DOCUMENT / RETRIEVAL_QUERY.

Interface kept identical to the old sentence-transformers version so retriever.py
does not need any changes.
"""
from __future__ import annotations

import logging
import time
from typing import List

import google.genai as genai

from ..core.config import GEMINI_API_KEY, EMBEDDING_MODEL

logger = logging.getLogger(__name__)

# ── Singleton Gemini client ───────────────────────────────────────────────────
_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set in environment.")
        _client = genai.Client(api_key=GEMINI_API_KEY)
        logger.info("Gemini client initialised (embedding model: %s)", EMBEDDING_MODEL)
    return _client


# ── Batching helper ───────────────────────────────────────────────────────────
# Gemini free-tier: 100 requests/minute. We batch up to 100 texts per call
# and add a small delay between batches only when needed.
_BATCH_SIZE = 100
_INTER_BATCH_DELAY = 0.6  # seconds — conservative, keeps us under 100 rpm


def embed_texts(texts: List[str], task_type: str = "RETRIEVAL_DOCUMENT") -> List[List[float]]:
    """Embed a list of texts using the Gemini Embedding API.

    Args:
        texts: List of plain-text strings to embed.
        task_type: Gemini embedding task type.
                   Use "RETRIEVAL_DOCUMENT" for chunk ingestion.
                   Use "RETRIEVAL_QUERY" for query embedding at search time.

    Returns:
        List of float vectors (768-dim each).
    """
    client = _get_client()
    all_vectors: List[List[float]] = []

    for i in range(0, len(texts), _BATCH_SIZE):
        batch = texts[i : i + _BATCH_SIZE]
        try:
            result = client.models.embed_content(
                model=EMBEDDING_MODEL,
                contents=batch,
                config={"task_type": task_type},
            )
            # result.embeddings is a list of ContentEmbedding objects
            all_vectors.extend([e.values for e in result.embeddings])
        except Exception as exc:
            msg = str(exc)
            logger.error("Gemini embed_content failed for batch %d: %s", i // _BATCH_SIZE, exc)

            # Fallback: some projects return 404 for batchEmbedContents; try single requests.
            if "404" in msg or "Not Found" in msg or "batchEmbedContents" in msg:
                for text in batch:
                    single = client.models.embed_content(
                        model=EMBEDDING_MODEL,
                        contents=text,
                        config={"task_type": task_type},
                    )
                    if hasattr(single, "embedding") and single.embedding:
                        all_vectors.append(single.embedding.values)
                    elif hasattr(single, "embeddings") and single.embeddings:
                        all_vectors.append(single.embeddings[0].values)
                    else:
                        raise RuntimeError("Unexpected Gemini embedding response format.")
                    time.sleep(0.1)
            else:
                raise

        # Rate-limit guard: sleep between batches (skip for last batch)
        if i + _BATCH_SIZE < len(texts):
            time.sleep(_INTER_BATCH_DELAY)

    return all_vectors


def embed_query(text: str) -> List[float]:
    """Embed a single query string for semantic search."""
    vectors = embed_texts([text], task_type="RETRIEVAL_QUERY")
    return vectors[0]
