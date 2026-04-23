# Entity/Data Dictionary của `ai_engine`

Trong `ai_engine`, “entity” không nằm trong SQL table. Dữ liệu chính xuất hiện ở 3 tầng:

1. **Pydantic request/response models** (`app/models.py`)
2. **Chunk object nội bộ** (dùng khi chunking + lưu vector)
3. **Qdrant payload fields** (metadata lưu cùng vector)

---

## A) Pydantic Models (API Contract)

## `Chunk`

Vai trò: object nội bộ đại diện một đoạn văn đã chunk.

Fields:
- `content: str`: nội dung chunk.
- `chunk_index: int`: thứ tự chunk trong document.
- `word_count: int`: số từ trong chunk.
- `has_chemistry: bool`: cờ nhận diện text có công thức/hóa học.
- `section: str`: section heading chứa chunk.
- `source: str`: tên file nguồn.

Nơi dùng:
- tạo trong `chunk_text()`
- đưa sang `store_chunks()` để lưu payload Qdrant.

## `IngestResponse`

- `document_id`: id tài liệu từ backend.
- `filename`: tên file.
- `total_chunks`: số chunk đã lưu.
- `total_words`: tổng số từ từ chunk.
- `message`: trạng thái ingest.

## `RetrieveRequest`

- `document_id`: tài liệu cần truy vấn.
- `question`: câu hỏi user.
- `top_k`: số chunk lấy ra (1..15, default 5).

## `RetrievedChunk`

- `content`
- `chunk_index`
- `section`
- `score`: độ tương đồng cosine.
- `has_chemistry`

## `RetrieveResponse`

- `document_id`
- `question`
- `context_text`: các chunk nối lại để backend nhét vào prompt.
- `chunks: List[RetrievedChunk]`
- `strategy_used`: `"semantic"` hoặc `"full_doc"`.

## `DocumentInfo`

- `document_id`
- `filename`
- `total_chunks`
- `created_at`

Nơi dùng: phục vụ list metadata từ vector store (hàm `list_documents()`).

## `DeleteResponse`

- `document_id`
- `deleted: bool`
- `message`

## `HealthResponse`

- `status`: `"ok"` hoặc `"degraded"`
- `embedding_model`
- `embedding_model_loaded`
- `total_documents`

## `SummarizeRequest`, `SummarizeResponse`

Đang có model nhưng **chưa có endpoint thực thi trong `main.py`**.

---

## B) Qdrant Payload Schema (thực tế khi upsert)

Trong `store_chunks()`, mỗi vector point lưu payload:

- `document_id`: khóa nhóm toàn bộ chunk cùng tài liệu.
- `content`: text chunk.
- `chunk_index`: thứ tự chunk.
- `section`: section heading.
- `has_chemistry`: cờ khoa học/hóa học.
- `source`: tên file nguồn từ chunk.
- `word_count`: số từ chunk.
- `filename`: metadata từ request ingest.
- `created_at`: thời điểm ingest (ISO string).

## Vai trò từng field trong logic

- `document_id`:
  - filter bắt buộc cho search/delete/existence check.
  - grouping khi list documents.
- `content`:
  - nguồn build `context_text` cho prompt.
- `chunk_index`:
  - sắp xếp lại theo thứ tự tài liệu.
  - đảm bảo chunk 0 luôn được ưu tiên đưa vào context.
- `section`:
  - tăng readability trong context (`[section]`).
- `has_chemistry`:
  - metadata gợi ý domain khoa học; hiện chưa thấy branch logic riêng theo flag.
- `word_count`:
  - thống kê; hiện chưa có lọc theo field này.
- `filename`, `created_at`:
  - phục vụ thống kê/list metadata.

---

## C) “Table” tương đương trong ngữ cảnh hệ thống

Vì dùng Qdrant, có thể hiểu gần đúng:

- “table” = **collection Qdrant** (`QDRANT_COLLECTION`)
- “row” = **point vector**
- “columns” = **payload fields** + vector values

## Khoá định danh point

- ID point được tạo deterministic:
  - `uuid5(NAMESPACE_DNS, f"{document_id}_{i}")`
- Ý nghĩa:
  - cùng document + cùng index sẽ ra cùng id,
  - hỗ trợ tính idempotent khi re-ingest.

---

## D) Quan hệ logic dữ liệu

- 1 `document_id` -> N points (mỗi point là 1 chunk vector).
- 1 request `/retrieve` -> đọc nhiều points cùng `document_id` -> trả `context_text`.
- 1 delete document -> xóa toàn bộ points theo filter `document_id`.
