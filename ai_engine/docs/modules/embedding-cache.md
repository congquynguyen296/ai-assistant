# Module Embedding Cache (`app/rag/embedding_cache.py`)

## Muc dich

Bo sung co che cache embedding de giam so lan goi Gemini API, tang toc ingest, va giam chi phi. Cache hoat dong theo hash cua chunk (uu tien chinh), kem hash cua toan file de quan sat va thong ke. Cache luu tren Redis (rediss).

## Cau truc du lieu (Redis)

### 1) Key `embed:chunk:{chunk_hash}`

Gia tri luu JSON array vector embedding (list float). TTL cau hinh qua env.

### 2) Key `embed:file:{file_hash}`

Gia tri luu JSON object gom: `chunk_count`, `model`, `dimension`, `created_at`.

## Normalize va Hash

- Normalize chi danh cho hash (khong thay doi noi dung luu Qdrant):
  - chuyen `\r\n` ve `\n`
  - gom nhieu khoang trang ve 1 dau cach
  - `strip()` va `lower()`
- Hash = `sha256(normalized_text)`

Muc tieu: tang ty le cache hit khi text chi khac nhau ve khoang trang / case.

## Flow Ingest moi (chi tiet)

1) **Nhan request** `/ingest`:
   - `document_id`, `filename`, `text`.

2) **Chunking**:
   - `chunk_text(text)` tao danh sach chunk goc.

3) **Tinh file hash (quan sat/ghi nhan)**:
   - `normalize_for_hash(text)`
   - `file_hash = hash_text(normalized_full)`
   - ghi `file_hash` vao `file_cache` (khong dung de skip Qdrant).

4) **Tinh chunk hash**:
   - voi tung chunk: `chunk_hash = hash_text(normalize_for_hash(chunk.content))`
   - lay `unique_hashes` de tranh goi embed lap.

5) **Cache lookup**:
   - `cached = get_embeddings(unique_hashes)`
   - tinh `missing_hashes = unique_hashes - cached`.

6) **Embed phan con thieu**:
   - lay text tu **chunk dau tien** cua moi `missing_hash`.
   - goi `embed_texts()` theo batch.
   - luu ket qua vao `embed:chunk:{hash}`.

7) **Assemble embeddings theo thu tu chunk**:
   - `embeddings[i] = cached[chunk_hash]` (da bao gom ket qua moi).

8) **Upsert vao Qdrant**:
   - `store_chunks(document_id, chunks, embeddings, metadata)`.

9) **Log cache**:
   - thong ke `hits`, `misses`, `unique_misses`.

## Retry + Backoff

- Retry cho 429/503/timeout trong `embedder.py`.
- Exponential backoff + jitter de giam nguy co bi rate limit.
- Neu batch API khong ho tro (404/batchEmbedContents), tu dong fallback ve single-request.

## Cau hinh (env)

- `EMBEDDING_CACHE_ENABLED` (default: true)
- `REDIS_URL` (rediss)
- `EMBEDDING_CACHE_TTL_SECONDS` (default: 2592000)
- `EMBEDDING_BATCH_SIZE` (default: 100)
- `EMBEDDING_INTER_BATCH_DELAY` (default: 0.6)
- `EMBEDDING_MAX_RETRIES` (default: 3)
- `EMBEDDING_RETRY_BASE_DELAY` (default: 1.0)

## Luu y ky thuat

- Cache luu embedding theo text da normalize de tang hit-rate.
- Vector Qdrant van luu `content` goc, khong bi thay doi.
- Cache la Redis nen co the dung chung cho nhieu instance.
- `file_cache` hien dung de theo doi/thong ke, khong bo qua viec upsert Qdrant.

## Kien truc tong quan

```text
Upload text
  -> chunk_text
  -> file_hash (ghi nhan)
  -> chunk_hash per chunk
  -> check chunk_cache
      -> hit: lay embedding
      -> miss: goi Gemini (batch) -> luu cache
  -> store_chunks (Qdrant)
```
