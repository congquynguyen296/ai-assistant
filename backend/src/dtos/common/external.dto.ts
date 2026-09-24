export interface RagIngestResponse {
  document_id: string;
  filename: string;
  total_chunks: number;
  total_words: number;
  message: string;
}

export interface RagRetrieveChunk {
  content: string;
  chunk_index: number;
  section?: string;
  score?: number;
}

export interface RagRetrieveResponse {
  context_text: string;
  strategy_used: "semantic" | "full_doc" | string;
  chunks: RagRetrieveChunk[];
}
