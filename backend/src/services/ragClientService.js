/**
 * backend/src/services/ragClientService.js
 *
 * HTTP client that talks to the Python ai_engine (FastAPI) service.
 * All functions return null (instead of throwing) when the Python service
 * is unreachable so that Node.js can gracefully fall back to keyword search.
 */

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

/** Shared headers sent on every request to authenticate with Python. */
const internalHeaders = {
  "Content-Type": "application/json",
  "X-Internal-API-Key": INTERNAL_API_KEY,
};

/** Default timeout (ms) for requests to the Python service.
 *  Keep generous — embedding 100+ chunks can take a few seconds. */
const TIMEOUT_MS = 30_000;

/**
 * Helper: fetch with an AbortController timeout.
 * Returns the Response or throws on network error / timeout.
 */
const fetchWithTimeout = (url, options, timeoutMs = TIMEOUT_MS) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
};

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Send extracted text to Python for chunking + embedding + Qdrant storage.
 * Called in the background after document text extraction.
 *
 * @param {string} documentId  - MongoDB ObjectId string
 * @param {string} filename    - original file name (for metadata)
 * @param {string} text        - full plain-text content of the document
 * @returns {Promise<object|null>} IngestResponse or null on failure
 */
export const ingestDocument = async (documentId, filename, text) => {
  try {
    const res = await fetchWithTimeout(
      `${PYTHON_SERVICE_URL}/ingest`,
      {
        method: "POST",
        headers: internalHeaders,
        body: JSON.stringify({ document_id: documentId, filename, text }),
      },
      TIMEOUT_MS
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(
        `[ragClient] ingestDocument failed — HTTP ${res.status}: ${body}`
      );
      return null;
    }

    const data = await res.json();
    console.log(
      `[ragClient] Ingested document ${documentId} — ${data.total_chunks} chunks stored.`
    );
    return data;
  } catch (err) {
    console.error(`[ragClient] ingestDocument error (document: ${documentId}):`, err.message);
    return null;
  }
};

/**
 * Perform semantic search for the most relevant chunks given a question.
 * Used by chatService and explainConceptService before calling Gemini.
 *
 * @param {string} documentId - MongoDB ObjectId string
 * @param {string} question   - user's question or concept string
 * @param {number} [topK=5]   - number of chunks to retrieve
 * @returns {Promise<{context_text: string, strategy_used: string, chunks: Array}|null>}
 *          Returns null if Python service is down or document not yet indexed.
 */
export const retrieveContext = async (documentId, question, topK = 5) => {
  try {
    const res = await fetchWithTimeout(
      `${PYTHON_SERVICE_URL}/retrieve`,
      {
        method: "POST",
        headers: internalHeaders,
        body: JSON.stringify({
          document_id: documentId,
          question,
          top_k: topK,
        }),
      },
      15_000 // retrieval is fast — shorter timeout
    );

    if (res.status === 404) {
      // Document not yet indexed (e.g. legacy document) — expected, fallback silently
      console.log(
        `[ragClient] Document ${documentId} not in Qdrant — falling back to keyword search.`
      );
      return null;
    }

    if (!res.ok) {
      const body = await res.text();
      console.error(`[ragClient] retrieveContext failed — HTTP ${res.status}: ${body}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error(`[ragClient] retrieveContext error (document: ${documentId}):`, err.message);
    return null;
  }
};

/**
 * Delete all Qdrant vectors for a document.
 * Called when a user deletes their document; fire-and-forget is fine.
 *
 * @param {string} documentId
 * @returns {Promise<boolean>} true on success, false on any failure
 */
export const deleteDocumentVectors = async (documentId) => {
  try {
    const res = await fetchWithTimeout(
      `${PYTHON_SERVICE_URL}/document/${documentId}`,
      { method: "DELETE", headers: internalHeaders },
      10_000
    );

    if (!res.ok) {
      console.warn(
        `[ragClient] deleteDocumentVectors — HTTP ${res.status} for document ${documentId}`
      );
      return false;
    }

    console.log(`[ragClient] Deleted Qdrant vectors for document ${documentId}.`);
    return true;
  } catch (err) {
    console.error(
      `[ragClient] deleteDocumentVectors error (document: ${documentId}):`,
      err.message
    );
    return false;
  }
};
