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

import time

from fastapi import Depends, FastAPI, HTTPException, status, Request
from loguru import logger
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.core.config import PORT, QDRANT_COLLECTION, EMBEDDING_MODEL
from app.core.logging_config import setup_logging
from app.core.security import verify_internal_key
from app.models import (
    DeleteResponse,
    HealthResponse,
    IngestResponse,
    RetrieveRequest,
    RetrieveResponse,
)

from app.rag.ingest_service import ingest_text
from app.rag.retriever import retrieve
from app.rag.vector_store import (
    delete_document,
    get_client,
)

import asyncio
import contextlib
import logging
import os
import signal
from contextlib import asynccontextmanager

from mem import log_mem, rss_mb
from worker import run_worker

# ── Logging ───────────────────────────────────────────────────────────────────
setup_logging()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
# logger = logging.getLogger("main")

worker_task: asyncio.Task | None = None
mem_task: asyncio.Task | None = None

def _on_worker_done(task: asyncio.Task):
    if task.cancelled():
        return
    logger.critical("Worker task chết: %r", task.exception())
    os.kill(os.getpid(), signal.SIGTERM)

async def _mem_monitor():
    while True:
        log_mem("periodic")
        await asyncio.sleep(300)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global worker_task, mem_task
    log_mem("startup")
    worker_task = asyncio.create_task(run_worker(), name="rabbit-worker")
    worker_task.add_done_callback(_on_worker_done)
    mem_task = asyncio.create_task(_mem_monitor(), name="mem-monitor")
    yield
    for t in (worker_task, mem_task):
        t.cancel()
        with contextlib.suppress(asyncio.CancelledError, Exception):
            await t

from app.api.routes import router as api_router

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Engine — RAG Service",
    description="Internal Python microservice: chunk, embed (Gemini), store/retrieve (Qdrant Cloud).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # only Node.js backend calls this; security via API key header
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    # Create an API logger by binding extra context
    api_logger = logger.bind(type="api")
    
    log_data = {
        "service": "ai_engine",
        "method": request.method,
        "url": str(request.url.path),
        "clientIp": request.client.host if request.client else None,
        "statusCode": response.status_code,
        "responseTimeMs": int(process_time * 1000),
        "userAgent": request.headers.get("user-agent", "")
    }
    
    msg = f"{request.method} {request.url.path} - {response.status_code} ({log_data['responseTimeMs']}ms)"
    
    if response.status_code >= 400:
        api_logger.error(msg, **log_data)
    else:
        api_logger.info(msg, **log_data)
        
    return response

app.include_router(api_router)


# ── Entrypoint ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
