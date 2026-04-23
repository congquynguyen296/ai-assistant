# Module RAG Pipeline (`app/rag/*`)

Module này gồm 3 phần:

1. `embedder.py`: gọi Gemini Embedding API.
2. `vector_store.py`: thao tác Qdrant collection/points.
3. `retriever.py`: chiến lược lấy context theo câu hỏi.

---

## 1) `embedder.py`

## Mục đích

- Chuyển text -> vector embedding.
- Dùng model từ config (`EMBEDDING_MODEL`).

## Hàm chính

- `_get_client()`
  - singleton `genai.Client`.
  - yêu cầu `GEMINI_API_KEY`.
- `embed_texts(texts, task_type)`
  - batch theo `_BATCH_SIZE = 100`.
  - gọi `client.models.embed_content`.
  - fallback single-request nếu batch gặp lỗi dạng 404/Not Found.
- `embed_query(text)`
  - wrapper gọi `embed_texts([text], task_type="RETRIEVAL_QUERY")`.

## Lưu ý thực tế

- Có guard rate-limit bằng sleep giữa batch (`_INTER_BATCH_DELAY`).
- Dùng 2 task type:
  - `RETRIEVAL_DOCUMENT` cho chunk ingest
  - `RETRIEVAL_QUERY` cho câu hỏi retrieve

---

## 2) `vector_store.py`

## Mục đích

- Quản lý collection và points trên Qdrant.

## Hàm chính

- `get_client()`
  - singleton `QdrantClient`.
  - check env `QDRANT_URL`, `QDRANT_API_KEY`.
  - ensure collection tồn tại, đúng dimension (`VECTOR_SIZE`).
  - ensure payload index `document_id`.

- `store_chunks(document_id, chunks, embeddings, metadata)`
  - xóa vector cũ của document trước (`delete_document`) -> idempotent.
  - tạo `PointStruct` cho mỗi chunk + embedding.
  - upsert toàn bộ.

- `query_chunks(document_id, query_embedding, top_k)`
  - search semantic theo filter `document_id`.
  - nếu không ra kết quả:
    - doc không tồn tại -> `ValueError`
    - doc có tồn tại -> trả list rỗng.

- `get_all_chunks(document_id)`
  - scroll toàn bộ points của document, sort theo `chunk_index`.

- `get_chunk_by_index(document_id, index)`
  - đọc 1 chunk theo index.

- `document_exists(document_id)`
  - kiểm tra tồn tại bằng scroll limit=1.

- `delete_document(document_id)`
  - xóa toàn bộ points theo filter `document_id`.

- `list_documents()`
  - quét points, group theo `document_id`, trả metadata tổng hợp.

## Dữ liệu payload lưu trong Qdrant

- `document_id`, `content`, `chunk_index`, `section`, `has_chemistry`, `source`, `word_count`, `filename`, `created_at`.

---

## 3) `retriever.py`

## Mục đích

- Chọn cách retrieve phù hợp theo kích thước tài liệu.
- Trả context text nhất quán để backend gửi tiếp cho Gemini chat/explain.

## Chiến lược

- `full_doc`:
  - dùng khi `total_chunks <= SMALL_DOC_THRESHOLD`.
  - trả toàn bộ chunk theo thứ tự.

- `semantic`:
  - dùng khi document lớn.
  - embed query -> `query_chunks(top_k)`.
  - ép thêm chunk 0 nếu chưa có.
  - sort lại theo `chunk_index` để dễ đọc.

## Hàm chính

- `_build_context(chunks)`
  - nối chunks bằng `\n\n---\n\n`
  - prepend `[section]` nếu có.
- `retrieve(document_id, question, top_k=5)`
  - kiểm tra tồn tại document.
  - chọn strategy.
  - build `RetrieveResponse`.

## Lưu ý

- Nếu không có `document_id` trong Qdrant thì raise `ValueError`.
- `score=1.0` trong `full_doc` là quy ước nội bộ vì không chạy semantic ranking.
