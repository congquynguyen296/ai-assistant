"""
ai_engine/app/rag/embedding_cache.py
Redis-backed embedding cache for chunk hashes and file hashes.
"""
from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime, timezone
from typing import Dict, Iterable, List

import redis

from ..core.config import (
    EMBEDDING_CACHE_ENABLED,
    EMBEDDING_CACHE_TTL_SECONDS,
    EMBEDDING_MODEL,
    REDIS_URL,
    VECTOR_SIZE,
)


def normalize_for_hash(text: str) -> str:
    """Normalize text for hashing to improve cache hit rate."""
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    normalized = re.sub(r"\s+", " ", normalized)
    return normalized.strip().lower()


def hash_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


class EmbeddingCache:
    def __init__(self, enabled: bool, redis_url: str) -> None:
        self.enabled = enabled
        self.redis_url = redis_url
        self._client: redis.Redis | None = None

        if not self.enabled:
            return

        if not self.redis_url:
            raise RuntimeError("REDIS_URL is not set for embedding cache.")

        self._client = redis.from_url(self.redis_url, decode_responses=True)

    def get_embeddings(self, hashes: Iterable[str]) -> Dict[str, List[float]]:
        if not self.enabled or not self._client:
            return {}

        unique = list(dict.fromkeys(hashes))
        if not unique:
            return {}

        keys = [f"embed:chunk:{h}" for h in unique]
        raw_values = self._client.mget(keys)
        results: Dict[str, List[float]] = {}
        for h, raw in zip(unique, raw_values):
            if raw:
                results[h] = json.loads(raw)
        return results

    def set_embeddings(self, items: Dict[str, List[float]]) -> None:
        if not self.enabled or not self._client or not items:
            return

        ttl = EMBEDDING_CACHE_TTL_SECONDS
        pipeline = self._client.pipeline()
        for chunk_hash, vector in items.items():
            payload = json.dumps(vector)
            key = f"embed:chunk:{chunk_hash}"
            if ttl > 0:
                pipeline.setex(key, ttl, payload)
            else:
                pipeline.set(key, payload)
        pipeline.execute()

    def set_file_hash(self, file_hash: str, chunk_count: int) -> None:
        if not self.enabled or not self._client:
            return

        now = datetime.now(timezone.utc).isoformat()
        payload = json.dumps(
            {
                "chunk_count": chunk_count,
                "model": EMBEDDING_MODEL,
                "dimension": VECTOR_SIZE,
                "created_at": now,
            }
        )
        key = f"embed:file:{file_hash}"
        if EMBEDDING_CACHE_TTL_SECONDS > 0:
            self._client.setex(key, EMBEDDING_CACHE_TTL_SECONDS, payload)
        else:
            self._client.set(key, payload)


_cache: EmbeddingCache | None = None


def get_embedding_cache() -> EmbeddingCache:
    global _cache
    if _cache is None:
        _cache = EmbeddingCache(EMBEDDING_CACHE_ENABLED, REDIS_URL)
    return _cache
