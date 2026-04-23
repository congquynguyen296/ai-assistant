# Hành vi hệ thống hiện tại (`ai_engine`)

## 1) Cấu trúc thư mục thực tế

```text
ai_engine/
  app/
    core/
      config.py
      security.py
    rag/
      embedder.py
      retriever.py
      vector_store.py
      __init__.py
    chunker.py
    models.py
  main.py
  test_rag.py
  requirements.txt
```

## 2) Coding style/pattern đang dùng

- Mô hình `function-based` (không dùng class service phức tạp).
- Type hints Python dùng xuyên suốt (`List[str]`, `Optional[dict]`, ...).
- Pydantic model làm contract API.
- Logging chuẩn bằng module `logging`.
- Singleton pattern nhẹ cho:
  - Gemini client (`_client` trong `embedder.py`)
  - Qdrant client (`_client` trong `vector_store.py`)

## 3) Cách service được bảo vệ

- Các endpoint nghiệp vụ (`/ingest`, `/retrieve`, `/document/{id}`) có dependency:
  - `Depends(verify_internal_key)`.
- `verify_internal_key` đọc header `X-Internal-API-Key`.
- Nếu env `INTERNAL_API_KEY` rỗng thì bỏ qua check (phù hợp local dev).

## 4) Hành vi endpoint hiện có

- `GET /health-check`: trả JSON đơn giản `"AI Engine is running"`.
- `HEAD /`: ping nhanh.
- `GET /health`: kiểm tra Qdrant collection, trả `ok` hoặc `degraded`.
- `POST /ingest`: chunk + embed + upsert vector.
- `POST /retrieve`: retrieve context theo chiến lược `full_doc` hoặc `semantic`.
- `DELETE /document/{document_id}`: xóa vector theo document.

## 5) Response format thực tế

- Response dùng Pydantic models trong `app/models.py` (trừ `/health-check` và `HEAD /`).
- Lỗi:
  - validation/body lỗi: FastAPI xử lý chuẩn 422.
  - business lỗi chủ động: `HTTPException` 400/404/502.

## 6) Quy tắc retrieval hiện tại

- Nếu document có số chunk `<= SMALL_DOC_THRESHOLD`:
  - trả toàn bộ chunk (`strategy_used = "full_doc"`).
- Nếu lớn hơn threshold:
  - semantic search theo embedding câu hỏi (`strategy_used = "semantic"`).
- Trong semantic mode:
  - ép thêm chunk index `0` nếu chưa có.
  - sắp xếp chunk theo `chunk_index` trước khi build context.

## 7) Quy tắc chunking hiện tại

- Normalize text (xuống dòng, space).
- Tách theo paragraph.
- Chunk theo word-count (`DEFAULT_CHUNK_SIZE`, `DEFAULT_OVERLAP`).
- Nhận diện section header.
- Đánh dấu `has_chemistry` nếu detect pattern công thức/đơn vị khoa học.

## 8) Dependency ngoài đang dùng thực tế

- `fastapi`, `uvicorn`
- `pydantic`
- `qdrant-client`
- `google-genai`
- `python-dotenv`

## 9) Những gì chưa có trong code

- Chưa có endpoint summarize dù có model `SummarizeRequest/SummarizeResponse`.
- Chưa có queue/cron/background worker framework.
- Chưa có persistence metadata ngoài Qdrant payload.
