# Kiến trúc hệ thống `ai_engine`

## Mục tiêu service

`ai_engine` là microservice Python nội bộ, chịu trách nhiệm:

- nhận text tài liệu từ backend Node.js,
- chunk text,
- tạo embedding bằng Gemini,
- lưu vector vào Qdrant,
- retrieve context theo câu hỏi để backend dùng tiếp với Gemini chat/explain.

## Sơ đồ request flow

```text
Node.js Backend
  -> HTTP gọi ai_engine (kèm X-Internal-API-Key)
      -> FastAPI route (main.py)
          -> Business function (chunker / retriever / vector_store / embedder)
              -> Qdrant Cloud + Gemini API
          -> JSON response về backend
```

## Flow ingestion

```text
POST /ingest
  -> verify_internal_key
  -> validate body (document_id, filename, text)
  -> chunk_text()
  -> embed_texts(task=RETRIEVAL_DOCUMENT)
  -> store_chunks() vào Qdrant
      -> delete_document(document_id) trước (idempotent)
      -> upsert points mới
  -> trả IngestResponse
```

## Flow retrieval

```text
POST /retrieve
  -> verify_internal_key
  -> retrieve(document_id, question, top_k)
      -> check document_exists
      -> nếu doc nhỏ (<= SMALL_DOC_THRESHOLD): full_doc
      -> nếu doc lớn: semantic
           -> embed_query(question)
           -> query_chunks(top_k)
      -> ép include chunk_index=0 nếu semantic chưa có
      -> build context_text
  -> trả RetrieveResponse
```

## Flow delete vector

```text
DELETE /document/{document_id}
  -> verify_internal_key
  -> delete_document(document_id)
  -> trả DeleteResponse
```

## Thành phần chính và trách nhiệm

- `main.py`: API layer + orchestration route.
- `app/chunker.py`: tách text thành chunk có metadata.
- `app/rag/embedder.py`: gọi Gemini Embedding API.
- `app/rag/vector_store.py`: CRUD Qdrant.
- `app/rag/retriever.py`: chiến lược retrieve + build context.
- `app/core/config.py`: nạp biến môi trường.
- `app/core/security.py`: guard nội bộ bằng header key.
- `app/models.py`: schema Pydantic request/response.

## Ghi chú triển khai hiện tại

- Không có queue/job worker riêng.
- Không có database quan hệ; dữ liệu vector lưu trong Qdrant payload.
- Không có auth user-level ở Python service; auth dựa vào internal key giữa backend và ai_engine.
