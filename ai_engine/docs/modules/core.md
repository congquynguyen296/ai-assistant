# Module Core (`app/core/*` + `app/models.py`)

## 1) `config.py` — cấu hình môi trường

## Mục đích

- Tập trung tất cả env/config một nơi để các module khác import dùng.

## Biến cấu hình chính

- Server:
  - `PORT`
- Internal auth:
  - `INTERNAL_API_KEY`
- Gemini:
  - `GEMINI_API_KEY`
  - `EMBEDDING_MODEL`
  - `EMBEDDING_TASK_TYPE`
- Qdrant:
  - `QDRANT_URL`
  - `QDRANT_API_KEY`
  - `QDRANT_COLLECTION`
  - `VECTOR_SIZE`
- Chunker:
  - `DEFAULT_CHUNK_SIZE`
  - `DEFAULT_OVERLAP`
- Retriever:
  - `SMALL_DOC_THRESHOLD`

## Lưu ý vận hành

- `load_dotenv()` được gọi ngay khi import module.
- Nếu thiếu key quan trọng, lỗi sẽ xuất hiện ở module dùng key đó (ví dụ khi init client).

---

## 2) `security.py` — internal API protection

## Hàm chính

- `verify_internal_key(x_internal_api_key=Header(..., alias="X-Internal-API-Key"))`

## Logic

1. Nếu `INTERNAL_API_KEY` rỗng -> bỏ qua check (phục vụ local dev).
2. Nếu header khác key cấu hình -> raise HTTP 401.
3. Nếu đúng -> pass.

## Tích hợp vào route

- Dùng trong `main.py` bằng:
  - `dependencies=[Depends(verify_internal_key)]`.

---

## 3) `models.py` — contract dữ liệu API

## Vai trò

- Định nghĩa schema request/response dùng bởi FastAPI.
- Giúp validate input và tạo OpenAPI docs.

## Nhóm model

- Internal:
  - `Chunk`
- Ingest:
  - `IngestResponse`
- Retrieve:
  - `RetrieveRequest`
  - `RetrievedChunk`
  - `RetrieveResponse`
- Summarize (chưa có endpoint):
  - `SummarizeRequest`
  - `SummarizeResponse`
- Document management:
  - `DocumentInfo`
  - `DeleteResponse`
- Health:
  - `HealthResponse`

## Lưu ý cho người mới Python

- `BaseModel` là class của Pydantic để định nghĩa schema.
- `Field(...)` thêm ràng buộc/description (ví dụ `top_k` giới hạn 1..15).
- FastAPI tự map model thành JSON response.
