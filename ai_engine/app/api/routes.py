from fastapi import APIRouter, Depends, HTTPException, status, Response
from loguru import logger

from app.core.security import verify_internal_key
from app.models import (
    DeleteResponse,
    IngestRequest,
    IngestResponse,
    RetrieveRequest,
    RetrieveResponse,
)
from app.rag.ingest_service import ingest_text
from app.rag.retriever import retrieve
from app.rag.vector_store import delete_document

from mem import rss_mb
import main  # to check worker_task

router = APIRouter()

@router.get("/health-check", tags=["Health"])
def root():
    """Root endpoint for basic liveness probes."""
    return {"message": "AI Engine is running", "status": "ok"}

@router.head("/", tags=["Health"])
def root_head():
    """HEAD method for faster platform ping checks."""
    return {}

@router.get("/health", tags=["Health"])
async def health(response: Response):
    alive = main.worker_task is not None and not main.worker_task.done()
    if not alive:
        response.status_code = 503
    return {"status": "ok" if alive else "worker_down", "rss_mb": round(rss_mb())}

@router.post(
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
        logger.error("Embedding failed for document {}: {}", body.document_id, exc)
        raise HTTPException(status_code=502, detail=f"Embedding error: {exc}")

    logger.info("Ingested document {} — {} chunks, {} words", body.document_id, stored, total_words)

    return IngestResponse(
        document_id=body.document_id,
        filename=body.filename,
        total_chunks=stored,
        total_words=total_words,
        message="Ingestion complete.",
    )

@router.post(
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
        logger.error("Retrieve failed for document {}: {}", body.document_id, exc)
        raise HTTPException(status_code=502, detail=f"Retrieval error: {exc}")

    return result

@router.delete(
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
