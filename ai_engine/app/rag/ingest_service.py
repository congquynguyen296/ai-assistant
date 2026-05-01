"""
ai_engine/app/rag/ingest_service.py
Ingestion pipeline: chunk -> cache-aware embed -> store in Qdrant.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import List, Tuple

from ..chunker import chunk_text
from ..models import Chunk
from .embedder import embed_texts
from .embedding_cache import get_embedding_cache, hash_text, normalize_for_hash
from .vector_store import store_chunks

logger = logging.getLogger(__name__)
embedding_cache = get_embedding_cache()


def _embed_with_cache(contents: List[str]) -> Tuple[List[List[float]], int, int, int]:
    if not embedding_cache.enabled:
        vectors = embed_texts(contents, task_type="RETRIEVAL_DOCUMENT")
        return vectors, 0, len(contents), len(contents)

    chunk_hashes = [hash_text(normalize_for_hash(c)) for c in contents]
    unique_hashes = list(dict.fromkeys(chunk_hashes))
    cached = embedding_cache.get_embeddings(unique_hashes)

    cached_hits = sum(1 for h in chunk_hashes if h in cached)

    missing_hashes = [h for h in unique_hashes if h not in cached]
    if missing_hashes:
        first_index: dict[str, int] = {}
        for idx, h in enumerate(chunk_hashes):
            if h not in first_index:
                first_index[h] = idx

        missing_texts = [contents[first_index[h]] for h in missing_hashes]
        missing_vectors = embed_texts(missing_texts, task_type="RETRIEVAL_DOCUMENT")
        new_map = dict(zip(missing_hashes, missing_vectors))
        embedding_cache.set_embeddings(new_map)
        cached.update(new_map)

    vectors = [cached[h] for h in chunk_hashes]
    return vectors, cached_hits, len(chunk_hashes) - cached_hits, len(missing_hashes)


def ingest_text(document_id: str, filename: str, text: str) -> Tuple[int, int]:
    chunks = chunk_text(text, source_name=filename)
    if not chunks:
        raise ValueError("Could not produce any chunks from text.")

    contents = [c.content for c in chunks]

    if embedding_cache.enabled:
        normalized_full = normalize_for_hash(text)
        file_hash = hash_text(normalized_full)
        embedding_cache.set_file_hash(file_hash, len(chunks))

    embeddings, hits, misses, unique_misses = _embed_with_cache(contents)
    if embedding_cache.enabled:
        logger.info(
            "Embedding cache: hits=%d misses=%d unique_misses=%d",
            hits,
            misses,
            unique_misses,
        )

    metadata = {
        "filename": filename,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    stored = store_chunks(document_id, chunks, embeddings, metadata)

    total_words = sum(c.word_count for c in chunks)
    return stored, total_words
