import type { RagIngestResponse, RagRetrieveResponse } from "@/types/external.js";

const PYTHON_SERVICE_URL =
  process.env.PYTHON_SERVICE_URL || "http://localhost:8000";
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "";

const internalHeaders = {
  "Content-Type": "application/json",
  "X-Internal-API-Key": INTERNAL_API_KEY,
};

const TIMEOUT_MS = 30_000;

import { apiLogger } from '@/utils/logger.js';

const fetchWithTimeout = async (
  url: string,
  options: RequestInit,
  timeoutMs = TIMEOUT_MS,
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  
  const start = Date.now();
  let res: Response | null = null;
  let error: any = null;

  try {
    res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err) {
    error = err;
    throw err;
  } finally {
    clearTimeout(id);
    const duration = Date.now() - start;
    
    const logData: any = {
      method: options.method || 'GET',
      url,
      statusCode: res?.status || 500,
      responseTimeMs: duration,
      requestBody: options.body ? JSON.parse(options.body as string) : undefined,
    };

    if (error) {
      logData.error = error.message;
      apiLogger.error('Outgoing request failed', logData);
    } else if (res && !res.ok) {
      // Clone response to read body without consuming it for the caller
      const resClone = res.clone();
      try {
        logData.responseBody = await resClone.json();
      } catch {
        logData.responseBody = await resClone.text();
      }
      apiLogger.error('Outgoing request returned error status', logData);
    } else {
      apiLogger.info('Outgoing request successful', logData);
    }
  }
};

export const ingestDocument = async (
  documentId: string,
  filename: string,
  text: string,
): Promise<RagIngestResponse | null> => {
  try {
    const res = await fetchWithTimeout(
      `${PYTHON_SERVICE_URL}/ingest`,
      {
        method: "POST",
        headers: internalHeaders,
        body: JSON.stringify({ document_id: documentId, filename, text }),
      },
      TIMEOUT_MS,
    );

    if (!res.ok) {
      const body = await res.text();
      console.error(
        `[ragClient] ingestDocument failed — HTTP ${res.status}: ${body}`,
      );
      return null;
    }

    const data = (await res.json()) as RagIngestResponse;
    console.log(
      `[ragClient] Ingested document ${documentId} — ${data.total_chunks} chunks stored.`,
    );
    return data;
  } catch (err) {
    console.error(
      `[ragClient] ingestDocument error (document: ${documentId}):`,
      (err as Error).message,
    );
    return null;
  }
};

export const retrieveContext = async (
  documentId: string,
  question: string,
  topK = 5,
): Promise<RagRetrieveResponse | null> => {
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
      15_000,
    );

    if (res.status === 404) {
      console.log(
        `[ragClient] Document ${documentId} not in Qdrant — falling back to keyword search.`,
      );
      return null;
    }

    if (!res.ok) {
      const body = await res.text();
      console.error(
        `[ragClient] retrieveContext failed — HTTP ${res.status}: ${body}`,
      );
      return null;
    }

    return (await res.json()) as RagRetrieveResponse;
  } catch (err) {
    console.error(
      `[ragClient] retrieveContext error (document: ${documentId}):`,
      (err as Error).message,
    );
    return null;
  }
};

export const deleteDocumentVectors = async (
  documentId: string,
): Promise<boolean> => {
  try {
    const res = await fetchWithTimeout(
      `${PYTHON_SERVICE_URL}/document/${documentId}`,
      { method: "DELETE", headers: internalHeaders },
      10_000,
    );

    if (!res.ok) {
      console.warn(
        `[ragClient] deleteDocumentVectors — HTTP ${res.status} for document ${documentId}`,
      );
      return false;
    }

    console.log(`[ragClient] Deleted Qdrant vectors for document ${documentId}.`);
    return true;
  } catch (err) {
    console.error(
      `[ragClient] deleteDocumentVectors error (document: ${documentId}):`,
      (err as Error).message,
    );
    return false;
  }
};
