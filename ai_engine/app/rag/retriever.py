"""
ai_engine/app/rag/retriever.py
Semantic retrieval — returns the most relevant chunks for a given question.

Strategy:
  - "full_doc"  : document has ≤ SMALL_DOC_THRESHOLD chunks → return all chunks.
  - "semantic"  : larger document → embed query, top-k cosine search.

Always ensures chunk[0] is included (usually contains title / overview).
Chunks are returned sorted by chunk_index so Gemini reads them in order.
"""
from __future__ import annotations

import logging
from typing import List

from ..core.config import SMALL_DOC_THRESHOLD
from ..models import RetrievedChunk, RetrieveResponse
from .embedder import embed_query
from .vector_store import (
    get_all_chunks,
    get_chunk_by_index,
    query_chunks,
    document_exists,
)

logger = logging.getLogger(__name__)


# ── Context builder ───────────────────────────────────────────────────────────

def _build_context(chunks: List[dict]) -> str:
    """Join chunks into a single context string for Gemini.

    Section headers are prepended in brackets when available.
    Chunks are separated by a horizontal rule for clarity.
    """
    parts: List[str] = []
    for chunk in chunks:
        section = chunk.get("section", "").strip()
        content = chunk.get("content", "").strip()
        if section:
            parts.append(f"[{section}]\n{content}")
        else:
            parts.append(content)
    return "\n\n---\n\n".join(parts)


# ── Main retriever ────────────────────────────────────────────────────────────

def retrieve(
    document_id: str,
    question: str,
    top_k: int = 5,
) -> RetrieveResponse:
    """Return a RetrieveResponse with the most relevant context for the question.

    Raises ValueError if document_id is not found in vector store.
    """
    if not document_exists(document_id):
        raise ValueError(f"Document '{document_id}' không tồn tại.")

    # ── Strategy: ALL-IN for short documents ─────────────────────────────────
    all_chunks = get_all_chunks(document_id)
    total_chunks = len(all_chunks)

    if total_chunks <= SMALL_DOC_THRESHOLD:
        logger.info(
            "doc=%s — short document (%d chunks), using full_doc strategy.",
            document_id,
            total_chunks,
        )
        context_text = _build_context(all_chunks)

        retrieved = [
            RetrievedChunk(
                content=c["content"],
                chunk_index=c["chunk_index"],
                section=c.get("section", ""),
                score=1.0,             # perfect score — all chunks included
                has_chemistry=c.get("has_chemistry", False),
            )
            for c in all_chunks
        ]

        return RetrieveResponse(
            document_id=document_id,
            question=question,
            context_text=context_text,
            chunks=retrieved,
            strategy_used="full_doc",
        )

    # ── Strategy: SEMANTIC SEARCH for longer documents ────────────────────────
    logger.info(
        "doc=%s — large document (%d chunks), using semantic strategy (top_k=%d).",
        document_id,
        total_chunks,
        top_k,
    )

    query_vec = embed_query(question)
    raw_results = query_chunks(document_id, query_vec, top_k)

    # Always include chunk[0] (title / overview section)
    if not any(r["chunk_index"] == 0 for r in raw_results):
        first_chunk = get_chunk_by_index(document_id, 0)
        if first_chunk:
            first_chunk["score"] = 0.0  # no relevance score for forced inclusion
            raw_results.append(first_chunk)

    # Sort by document order for coherent reading
    raw_results.sort(key=lambda x: x["chunk_index"])

    context_text = _build_context(raw_results)

    retrieved = [
        RetrievedChunk(
            content=c["content"],
            chunk_index=c["chunk_index"],
            section=c.get("section", ""),
            score=c.get("score", 0.0),
            has_chemistry=c.get("has_chemistry", False),
        )
        for c in raw_results
    ]

    return RetrieveResponse(
        document_id=document_id,
        question=question,
        context_text=context_text,
        chunks=retrieved,
        strategy_used="semantic",
    )
