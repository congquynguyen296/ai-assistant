"""
ai_engine/app/rag/vector_store.py
Qdrant Cloud CRUD operations — singleton client, one collection for all documents.

Changes from local version:
- QdrantClient now connects to Qdrant Cloud (url + api_key) instead of local path.
- VECTOR_SIZE updated to 768 to match text-embedding-004.
- All CRUD function signatures and return types are unchanged.
"""
from __future__ import annotations

import logging
import uuid
from typing import List, Optional

from qdrant_client import QdrantClient
from qdrant_client.http.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)

from ..core.config import QDRANT_URL, QDRANT_API_KEY, QDRANT_COLLECTION, VECTOR_SIZE
from ..models import Chunk

logger = logging.getLogger(__name__)

# ── Singleton client ──────────────────────────────────────────────────────────

_client: Optional[QdrantClient] = None


def get_client() -> QdrantClient:
    global _client
    if _client is None:
        if not QDRANT_URL or not QDRANT_API_KEY:
            raise RuntimeError("QDRANT_URL and QDRANT_API_KEY must be set in environment.")

        _client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY, check_compatibility=False)
        logger.info("Qdrant Cloud client initialised at: %s", QDRANT_URL)

        # Ensure collection exists with correct vector size
        try:
            info = _client.get_collection(collection_name=QDRANT_COLLECTION)
            existing_size = info.config.params.vectors.size
            if existing_size != VECTOR_SIZE:
                logger.warning(
                    "Collection vector size mismatch: existing=%d expected=%d. "
                    "Recreating collection.",
                    existing_size,
                    VECTOR_SIZE,
                )
                _client.delete_collection(QDRANT_COLLECTION)
                raise Exception("recreate")
        except Exception:
            _client.create_collection(
                collection_name=QDRANT_COLLECTION,
                vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
            )
            logger.info("Created Qdrant collection '%s' (dim=%d)", QDRANT_COLLECTION, VECTOR_SIZE)

        # Ensure index exists on document_id so count/scroll/search filters work
        try:
            _client.create_payload_index(
                collection_name=QDRANT_COLLECTION,
                field_name="document_id",
                field_schema="keyword",
            )
            logger.debug("Ensured payload index exists for document_id")
        except Exception as exc:
            pass # Index already exists or could not be created

    return _client


# ── CRUD helpers ──────────────────────────────────────────────────────────────

def store_chunks(
    document_id: str,
    chunks: List[Chunk],
    embeddings: List[List[float]],
    metadata: dict,
) -> int:
    """Store chunks + embeddings in Qdrant.

    Deletes existing points for this document first (idempotent re-upload).
    Returns the number of chunks stored.
    """
    client = get_client()

    # Delete existing chunks for this document_id (idempotent)
    delete_document(document_id)

    points = [
        PointStruct(
            id=str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{document_id}_{i}")),
            vector=embedding,
            payload={
                "document_id": document_id,
                "content": chunk.content,
                "chunk_index": chunk.chunk_index,
                "section": chunk.section,
                "has_chemistry": chunk.has_chemistry,
                "source": chunk.source,
                "word_count": chunk.word_count,
                "filename": metadata.get("filename", ""),
                "created_at": metadata.get("created_at", ""),
            },
        )
        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
    ]

    client.upsert(collection_name=QDRANT_COLLECTION, points=points)
    logger.info("Stored %d chunks for document: %s", len(chunks), document_id)
    return len(chunks)


def query_chunks(
    document_id: str,
    query_embedding: List[float],
    top_k: int,
) -> List[dict]:
    """Semantic search — returns top_k chunks for a specific document."""
    client = get_client()

    search_result = client.search(
        collection_name=QDRANT_COLLECTION,
        query_vector=query_embedding,
        query_filter=Filter(
            must=[FieldCondition(key="document_id", match=MatchValue(value=document_id))]
        ),
        limit=top_k,
    )

    if not search_result:
        if not document_exists(document_id):
            raise ValueError(f"Document '{document_id}' not found in vector store.")
        return []

    return [
        {
            "content": hit.payload.get("content", ""),
            "chunk_index": hit.payload.get("chunk_index", 0),
            "section": hit.payload.get("section", ""),
            "score": hit.score,
            "has_chemistry": hit.payload.get("has_chemistry", False),
            "word_count": hit.payload.get("word_count", 0),
        }
        for hit in search_result
    ]


def get_all_chunks(document_id: str) -> List[dict]:
    """Return ALL chunks for a document sorted by chunk_index."""
    client = get_client()

    records, _ = client.scroll(
        collection_name=QDRANT_COLLECTION,
        scroll_filter=Filter(
            must=[FieldCondition(key="document_id", match=MatchValue(value=document_id))]
        ),
        limit=10_000,
        with_payload=True,
        with_vectors=False,
    )

    chunks = [
        {
            "content": r.payload.get("content", ""),
            "chunk_index": r.payload.get("chunk_index", 0),
            "section": r.payload.get("section", ""),
            "has_chemistry": r.payload.get("has_chemistry", False),
            "word_count": r.payload.get("word_count", 0),
        }
        for r in records
    ]
    chunks.sort(key=lambda x: x["chunk_index"])
    return chunks


def get_chunk_by_index(document_id: str, index: int) -> Optional[dict]:
    """Fetch a single chunk by its index."""
    return next(
        (c for c in get_all_chunks(document_id) if c["chunk_index"] == index),
        None,
    )


def document_exists(document_id: str) -> bool:
    """Return True if any chunks exist for this document_id."""
    client = get_client()
    try:
        records, _ = client.scroll(
            collection_name=QDRANT_COLLECTION,
            scroll_filter=Filter(
                must=[FieldCondition(key="document_id", match=MatchValue(value=document_id))]
            ),
            limit=1,
            with_payload=False,
            with_vectors=False,
        )
        return len(records) > 0
    except Exception as exc:
        logger.warning("document_exists failed for %s: %s", document_id, exc)
        return False


def delete_document(document_id: str) -> bool:
    """Delete all chunks for a document from Qdrant. Returns True on success."""
    client = get_client()
    try:
        client.delete(
            collection_name=QDRANT_COLLECTION,
            points_selector=Filter(
                must=[FieldCondition(key="document_id", match=MatchValue(value=document_id))]
            ),
        )
        logger.info("Deleted vectors for document: %s", document_id)
        return True
    except Exception as exc:
        logger.warning("Failed to delete vectors for document %s: %s", document_id, exc)
        return False


def list_documents() -> List[dict]:
    """List all stored documents with basic metadata (groups by document_id)."""
    client = get_client()
    try:
        records, _ = client.scroll(
            collection_name=QDRANT_COLLECTION,
            limit=10_000,
            with_payload=True,
            with_vectors=False,
        )
    except Exception:
        return []

    doc_map: dict = {}
    for record in records:
        payload = record.payload or {}
        doc_id = payload.get("document_id")
        if not doc_id:
            continue
        if doc_id not in doc_map:
            doc_map[doc_id] = {
                "document_id": doc_id,
                "filename": payload.get("filename", "unknown"),
                "total_chunks": 1,
                "created_at": payload.get("created_at", ""),
            }
        else:
            doc_map[doc_id]["total_chunks"] += 1

    return list(doc_map.values())
