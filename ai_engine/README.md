# AI Assistant - AI Engine (RAG Service)

Microservice xử lý trí tuệ nhân tạo (RAG - Retrieval-Augmented Generation) cho dự án AI Assistant. Dịch vụ này chịu trách nhiệm băm nhỏ văn bản (chunking), tạo vector nhúng (embedding) và tìm kiếm ngữ nghĩa (semantic search) qua tài liệu.

## 🛠 Công nghệ sử dụng

- **Runtime:** Python 3.9+
- **Framework:** FastAPI
- **Vector Database:** Qdrant Cloud
- **AI Integration:** Google Gemini API (Embedding model: `text-embedding-004`)
- **Server:** Uvicorn
- **Testing:** pytest

## 📋 Yêu cầu hệ thống

- Python 3.9 trở lên
- Qdrant Cloud Cluster (hoặc Local Qdrant)
- Google Gemini API Key

## 🚀 Cài đặt

1. **Di chuyển vào thư mục `ai_engine`:**
   ```bash
   cd ai_engine
   ```

2. **Cài đặt môi trường ảo (Virtual Environment):**
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate      # Trên Windows
   # source .venv/bin/activate   # Trên macOS/Linux
   ```

3. **Cài đặt dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Cấu hình biến môi trường:**
   Tạo file `.env` tại thư mục gốc `ai_engine/` và điền các thông tin sau:

   ```env
   PORT=8000
   INTERNAL_API_KEY=your_internal_api_key_for_backend_auth

   # Gemini Embedding
   GEMINI_API_KEY=your_gemini_api_key
   EMBEDDING_MODEL=models/gemini-embedding-001
   
   # Qdrant Cloud
   QDRANT_URL=your_qdrant_cluster_url
   QDRANT_API_KEY=your_qdrant_api_key
   QDRANT_COLLECTION=documents_collection
   VECTOR_SIZE=3072
   ```

5. **Chạy ứng dụng:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

## 📂 Cấu trúc thư mục

```text
ai_engine/
├── app/
│   ├── chat/           # Xử lý hội thoại (nếu có)
│   ├── core/           # Cấu hình chung (Config, Security)
│   ├── rag/            # Cốt lõi RAG (Embedder, Retriever, Vector Store)
│   ├── chunker.py      # Logic băm nhỏ văn bản (Text Chunker)
│   └── models.py       # Pydantic schemas (Request/Response)
├── .env                # Biến môi trường
├── main.py             # Entry point FastAPI
├── requirements.txt    # Danh sách thư viện Python
└── test_rag.py         # File test kiểm thử RAG
```

## ✨ Tính năng chính

- **Document Ingestion:** Xử lý văn bản, chia nhỏ (chunking), nhúng (embedding) và lưu trữ vector lên Qdrant.
- **Semantic Retrieval:** Tìm kiếm ngữ nghĩa, trả về các đoạn văn bản (chunks) gần đúng nhất với khối truy vấn từ người dùng.
- **Vector Management:** Xóa toàn bộ vector liên quan đến một tài liệu.
- **Health Check:** Kiểm tra trạng thái của LLM model và Qdrant collection.
