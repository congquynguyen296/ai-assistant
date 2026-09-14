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

import openai
from openai import AzureOpenAI

from ..core.config import (
    AZURE_OPENAI_API_KEY,
    AZURE_OPENAI_ENDPOINT,
    AZURE_OPENAI_DEPLOYMENT_NAME,
    EMBEDDING_BATCH_SIZE,
    EMBEDDING_INTER_BATCH_DELAY,
    EMBEDDING_MAX_RETRIES,
    EMBEDDING_RETRY_BASE_DELAY,
    VECTOR_SIZE,
)

logger = logging.getLogger(__name__)

# ── Singleton OpenAI client ───────────────────────────────────────────────────
_client: AzureOpenAI | None = None


def _get_client() -> AzureOpenAI:
    global _client
    if _client is None:
        if not AZURE_OPENAI_API_KEY:
            raise RuntimeError("AZURE_OPENAI_API_KEY is not set in environment.")
        
        # Parse endpoint: remove trailing /openai/v1 if exists
        endpoint = AZURE_OPENAI_ENDPOINT
        if "/openai" in endpoint:
            endpoint = endpoint.split("/openai")[0]
            
        _client = AzureOpenAI(
            azure_endpoint=endpoint,
            api_key=AZURE_OPENAI_API_KEY,
            api_version="2024-02-01"
        )
        logger.info("Azure OpenAI client initialised (deployment name: %s)", AZURE_OPENAI_DEPLOYMENT_NAME)
    return _client


def _is_batch_not_supported(message: str) -> bool:
    msg = message.lower()
    return "batchembedcontents" in msg or "not found" in msg or "404" in msg


def _is_retryable(message: str) -> bool:
    msg = message.lower()
    retry_tokens = [
        "429", "503", "rate", "quota", "unavailable", "timeout",
        "connection reset", "104", "connection aborted", "connection closed", 
        "eof", "broken pipe", "10054"
    ]
    return any(token in msg for token in retry_tokens)


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
                # With OpenAI, passing an array of strings returns an array of embeddings
                kwargs = {
                    "model": AZURE_OPENAI_DEPLOYMENT_NAME,
                    "input": batch,
                }
                # Azure's text-embedding-3 supports passing dimensions to reduce output size
                if "3" in AZURE_OPENAI_DEPLOYMENT_NAME or VECTOR_SIZE != 768:
                     kwargs["dimensions"] = VECTOR_SIZE
                     
                batch_result = client.embeddings.create(**kwargs)
                break
            except Exception as exc:
                msg = str(exc)
                logger.error(
                    "OpenAI embed_content failed for batch %d (attempt %d/%d): %s",
                    i // EMBEDDING_BATCH_SIZE,
                    attempt + 1,
                    EMBEDDING_MAX_RETRIES,
                    exc,
                )
                if _is_retryable(msg) and attempt < EMBEDDING_MAX_RETRIES - 1:
                    time.sleep(_backoff_delay(attempt))
                    continue
                raise

        if batch_result is not None:
            for data in batch_result.data:
                all_vectors.append(data.embedding)
        else:
            raise RuntimeError("Unexpected OpenAI embedding response failure.")

        # Rate-limit guard: sleep between batches (skip for last batch)
        if i + EMBEDDING_BATCH_SIZE < len(texts):
            time.sleep(EMBEDDING_INTER_BATCH_DELAY)

    return all_vectors


def embed_query(text: str) -> List[float]:
    """Embed a single query string for semantic search."""
    vectors = embed_texts([text], task_type="RETRIEVAL_QUERY")
    return vectors[0]
