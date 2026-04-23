# Module API FastAPI (`main.py`)

## Tổng quan

`main.py` là entrypoint của service. File này:

- khởi tạo FastAPI app,
- đăng ký CORS middleware,
- định nghĩa schema request cho `/ingest`,
- map route -> gọi hàm business ở `app/*`.

## Import map (ai gọi ai)

- `chunk_text` từ `app/chunker.py`
- `verify_internal_key` từ `app/core/security.py`
- Pydantic response/request models từ `app/models.py`
- `embed_texts`, `embed_query` từ `app/rag/embedder.py`
- `retrieve` từ `app/rag/retriever.py`
- Qdrant helper từ `app/rag/vector_store.py`

## Endpoint chi tiết

## `GET /health-check`

Mục đích: liveness check đơn giản.

Input: không có.  
Output:
- `{"message":"AI Engine is running","status":"ok"}`

## `HEAD /`

Mục đích: ping nhanh không cần body.  
Output: `{}`.

## `GET /health`

Mục đích: health + readiness Qdrant.

Flow:
1. `get_client()`
2. `client.get_collection(QDRANT_COLLECTION)`
3. Nếu lỗi -> trả `HealthResponse(status="degraded", ...)`
4. Nếu OK -> trả `HealthResponse(status="ok", total_documents=points_count)`

Lưu ý:
- Không quăng exception ra ngoài; route chủ động degrade.

## `POST /ingest` (protected)

Dependency: `Depends(verify_internal_key)`.

Request body (`IngestRequest`):
- `document_id: str`
- `filename: str`
- `text: str`

Flow chi tiết:
1. Validate `text` không rỗng.
2. Gọi `chunk_text(text, source_name=filename)`.
3. Nếu không chunk được -> HTTP 422.
4. Extract `content` từng chunk.
5. Gọi `embed_texts(contents, task_type="RETRIEVAL_DOCUMENT")`.
6. Nếu embed lỗi -> HTTP 502.
7. Tạo `metadata = {"filename", "created_at"}`.
8. Gọi `store_chunks(document_id, chunks, embeddings, metadata)`.
9. Tính `total_words`.
10. Trả `IngestResponse` với status `201`.

## `POST /retrieve` (protected)

Dependency: `Depends(verify_internal_key)`.

Request body (`RetrieveRequest`):
- `document_id`
- `question`
- `top_k` (default 5)

Flow:
1. Gọi `retrieve(document_id, question, top_k)`.
2. `ValueError` -> HTTP 404 (document không có trong vector store).
3. Exception khác -> HTTP 502.
4. Trả `RetrieveResponse`.

## `DELETE /document/{document_id}` (protected)

Dependency: `Depends(verify_internal_key)`.

Flow:
1. Gọi `delete_document(document_id)`.
2. Trả `DeleteResponse`:
   - `deleted=true` nếu thao tác thành công,
   - `deleted=false` nếu lỗi/xóa không được.

## Classes định nghĩa ngay trong `main.py`

- `IngestRequest` là BaseModel cục bộ trong file.
- Các model còn lại import từ `app/models.py`.

## Python note cho người mới

- `@app.post(...)` là decorator gắn hàm vào HTTP route.
- `Depends(...)` là cơ chế dependency injection của FastAPI.
- `response_model=...` giúp FastAPI validate/serialize output theo schema.
- `HTTPException` là cách trả lỗi có status code rõ ràng.
