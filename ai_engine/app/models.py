"""
ai_engine/app/models.py
All Pydantic request/response schemas used by the FastAPI service.
"""
from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel, Field


# ── Internal ──────────────────────────────────────────────────────────────────

class Chunk(BaseModel):
    content: str
    chunk_index: int
    word_count: int
    has_chemistry: bool      # True if chemical formula / science units detected
    section: str             # Section heading containing this chunk (if parsed)
    source: str              # Original filename


# ── Ingest ────────────────────────────────────────────────────────────────────

class IngestResponse(BaseModel):
    document_id: str
    filename: str
    total_chunks: int
    total_words: int
    message: str


# ── Retrieve ──────────────────────────────────────────────────────────────────

class RetrieveRequest(BaseModel):
    document_id: str
    question: str = Field(..., min_length=1)
    top_k: int = Field(default=5, ge=1, le=15)


class RetrievedChunk(BaseModel):
    content: str
    chunk_index: int
    section: str
    score: float             # cosine similarity 0.0–1.0
    has_chemistry: bool


class RetrieveResponse(BaseModel):
    document_id: str
    question: str
    context_text: str        # chunks joined — pass directly into Gemini prompt
    chunks: List[RetrievedChunk]
    strategy_used: str       # "semantic" | "full_doc"


# ── Summarize ─────────────────────────────────────────────────────────────────

class SummarizeRequest(BaseModel):
    document_id: str
    language: str = "vi"     # "vi" | "en"


class SummarizeResponse(BaseModel):
    document_id: str
    summary: str
    total_words_processed: int
    num_batches: int         # number of map-phase Gemini calls


# ── Document management ───────────────────────────────────────────────────────

class DocumentInfo(BaseModel):
    document_id: str
    filename: str
    total_chunks: int
    created_at: str          # ISO datetime string


class DeleteResponse(BaseModel):
    document_id: str
    deleted: bool
    message: str


# ── Health ────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str              # "ok" | "degraded"
    embedding_model: str
    embedding_model_loaded: bool
    total_documents: int
