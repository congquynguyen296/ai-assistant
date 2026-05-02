"""
ai_engine/main.py
FastAPI entry-point for the RAG microservice.

Endpoints:
  GET  /health                       — liveness check
  POST /ingest                       — chunk + embed + store in Qdrant
  POST /retrieve                     — semantic search, returns context_text
  DELETE /document/{document_id}     — remove all vectors for a document
"""
from __future__ import annotations

import logging
from typing import Optional

import uvicorn
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.core.config import PORT, QDRANT_COLLECTION, VECTOR_SIZE, EMBEDDING_MODEL
from app.core.logging_config import setup_logging
from app.core.security import verify_internal_key
from app.models import (
    DeleteResponse,
    DocumentInfo,
    HealthResponse,
    IngestResponse,
    RetrieveRequest,
    RetrieveResponse,
)
from app.rag.embedder import embed_query
from app.rag.ingest_service import ingest_text
from app.rag.retriever import retrieve
from app.rag.vector_store import (
    delete_document,
    get_client,
)

# ── Logging ───────────────────────────────────────────────────────────────────
setup_logging()
logger = logging.getLogger(__name__)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Engine — RAG Service",
    description="Internal Python microservice: chunk, embed (Gemini), store/retrieve (Qdrant Cloud).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # only Node.js backend calls this; security via API key header
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request schemas ───────────────────────────────────────────────────────────

class IngestRequest(BaseModel):
    document_id: str = Field(..., description="MongoDB ObjectId string of the document")
    filename: str = Field(..., description="Original file name (for metadata)")
    text: str = Field(..., description="Full extracted plain text of the document")


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health-check", tags=["Health"])
def root():
    """Root endpoint for basic liveness probes."""
    return {"message": "AI Engine is running", "status": "ok"}

@app.head("/", tags=["Health"])
def root_head():
    """HEAD method for faster platform ping checks."""
    return {}

@app.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Liveness + readiness check. Returns Qdrant collection stats."""
    try:
        client = get_client()
        info = client.get_collection(QDRANT_COLLECTION)
        total_points = info.points_count or 0
    except Exception as exc:
        logger.warning("Qdrant health check failed: %s", exc)
        return HealthResponse(
            status="degraded",
            embedding_model=EMBEDDING_MODEL,
            embedding_model_loaded=False,
            total_documents=0,
        )

    return HealthResponse(
        status="ok",
        embedding_model=EMBEDDING_MODEL,
        embedding_model_loaded=True,
        total_documents=total_points,
    )


@app.post(
    "/ingest",
    response_model=IngestResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["RAG"],
    dependencies=[Depends(verify_internal_key)],
)
def ingest_document(body: IngestRequest):
    """Chunk the raw text, embed each chunk via Gemini, store in Qdrant.

    Called by Node.js after text extraction completes (fire-and-forget background step).
    Idempotent: re-uploading the same document_id replaces old vectors.
    """
    if not body.text or not body.text.strip():
        raise HTTPException(status_code=400, detail="text field is empty.")

    try:
        stored, total_words = ingest_text(body.document_id, body.filename, body.text)
    except Exception as exc:
        logger.error("Embedding failed for document %s: %s", body.document_id, exc)
        raise HTTPException(status_code=502, detail=f"Embedding error: {exc}")

    logger.info("Ingested document %s — %d chunks, %d words", body.document_id, stored, total_words)

    return IngestResponse(
        document_id=body.document_id,
        filename=body.filename,
        total_chunks=stored,
        total_words=total_words,
        message="Ingestion complete.",
    )


@app.post(
    "/retrieve",
    response_model=RetrieveResponse,
    tags=["RAG"],
    dependencies=[Depends(verify_internal_key)],
)
def retrieve_context(body: RetrieveRequest):
    """Semantic search — returns the most relevant context for a question.

    Called by Node.js for /chat and /explain-concept requests.
    Returns context_text ready to be injected into the Gemini prompt.
    """
    try:
        result = retrieve(body.document_id, body.question, body.top_k)
    except ValueError as exc:
        # document_id not found in Qdrant
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.error("Retrieve failed for document %s: %s", body.document_id, exc)
        raise HTTPException(status_code=502, detail=f"Retrieval error: {exc}")

    return result


@app.delete(
    "/document/{document_id}",
    response_model=DeleteResponse,
    tags=["RAG"],
    dependencies=[Depends(verify_internal_key)],
)
def delete_document_vectors(document_id: str):
    """Remove all vectors for a document from Qdrant.

    Called by Node.js when a document is deleted by the user.
    """
    success = delete_document(document_id)
    return DeleteResponse(
        document_id=document_id,
        deleted=success,
        message="Vectors deleted." if success else "Document not found or already deleted.",
    )


# ── Entrypoint ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
