"""
ai_engine/app/rag/embedder.py
Gemini Embedding API — zero RAM footprint on server (all compute happens on Google's servers).
Model: text-embedding-004 (768-dim), task_type RETRIEVAL_DOCUMENT / RETRIEVAL_QUERY.

Interface kept identical to the old sentence-transformers version so retriever.py
does not need any changes.
"""
from __future__ import annotations

import logging
import random
import time
from typing import List

import google.genai as genai

from ..core.config import (
    GEMINI_API_KEY,
    EMBEDDING_MODEL,
    EMBEDDING_BATCH_SIZE,
    EMBEDDING_INTER_BATCH_DELAY,
    EMBEDDING_MAX_RETRIES,
    EMBEDDING_RETRY_BASE_DELAY,
)

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


def _is_batch_not_supported(message: str) -> bool:
    msg = message.lower()
    return "batchembedcontents" in msg or "not found" in msg or "404" in msg


def _is_retryable(message: str) -> bool:
    msg = message.lower()
    return any(token in msg for token in ["429", "503", "rate", "quota", "unavailable", "timeout"])


def _backoff_delay(attempt: int) -> float:
    base = EMBEDDING_RETRY_BASE_DELAY
    return (base * (2 ** attempt)) + random.uniform(0, base)


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

    for i in range(0, len(texts), EMBEDDING_BATCH_SIZE):
        batch = texts[i : i + EMBEDDING_BATCH_SIZE]
        batch_result = None

        for attempt in range(EMBEDDING_MAX_RETRIES):
            try:
                batch_result = client.models.embed_content(
                    model=EMBEDDING_MODEL,
                    contents=batch,
                    config={"task_type": task_type},
                )
                break
            except Exception as exc:
                msg = str(exc)
                logger.error(
                    "Gemini embed_content failed for batch %d (attempt %d/%d): %s",
                    i // EMBEDDING_BATCH_SIZE,
                    attempt + 1,
                    EMBEDDING_MAX_RETRIES,
                    exc,
                )
                if _is_batch_not_supported(msg):
                    batch_result = None
                    break
                if _is_retryable(msg) and attempt < EMBEDDING_MAX_RETRIES - 1:
                    time.sleep(_backoff_delay(attempt))
                    continue
                raise

        if batch_result is not None:
            all_vectors.extend([e.values for e in batch_result.embeddings])
        else:
            # Fallback: some projects return 404 for batchEmbedContents; try single requests.
            for text in batch:
                single_result = None
                for attempt in range(EMBEDDING_MAX_RETRIES):
                    try:
                        single_result = client.models.embed_content(
                            model=EMBEDDING_MODEL,
                            contents=text,
                            config={"task_type": task_type},
                        )
                        break
                    except Exception as exc:
                        msg = str(exc)
                        if _is_retryable(msg) and attempt < EMBEDDING_MAX_RETRIES - 1:
                            time.sleep(_backoff_delay(attempt))
                            continue
                        raise

                if hasattr(single_result, "embedding") and single_result.embedding:
                    all_vectors.append(single_result.embedding.values)
                elif hasattr(single_result, "embeddings") and single_result.embeddings:
                    all_vectors.append(single_result.embeddings[0].values)
                else:
                    raise RuntimeError("Unexpected Gemini embedding response format.")
                time.sleep(0.1)

        # Rate-limit guard: sleep between batches (skip for last batch)
        if i + EMBEDDING_BATCH_SIZE < len(texts):
            time.sleep(EMBEDDING_INTER_BATCH_DELAY)

    return all_vectors


def embed_query(text: str) -> List[float]:
    """Embed a single query string for semantic search."""
    vectors = embed_texts([text], task_type="RETRIEVAL_QUERY")
    return vectors[0]
