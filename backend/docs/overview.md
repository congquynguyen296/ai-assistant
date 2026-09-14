# 📚 Cẩm Nang Kiến Thức Dự Án AI Assistant

Đây là cẩm nang tổng hợp toàn bộ kiến trúc, luồng xử lý (flows) và các công nghệ cốt lõi của dự án tính đến thời điểm hiện tại. Dự án áp dụng kiến trúc Microservices kết hợp Monolith, bao gồm:
1. **Frontend**: React (Vite), TailwindCSS, React Flow (cho Network).
2. **Backend**: Node.js (Express), MongoDB, Redis, RabbitMQ, Socket.io.
3. **AI Engine**: Python (FastAPI), Qdrant (Vector DB).

---

## 1. 📤 Quá trình Upload Tài Liệu & Xử lý (RAG Ingestion)
Quá trình xử lý tài liệu diễn ra hoàn toàn tự động và bất đồng bộ (asynchronous) để tránh chặn luồng chính.

* **Bước 1: Tiếp nhận file** (Frontend `->` Backend Node.js)
  - Người dùng upload file qua `documentController.ts`. Backend đọc trực tiếp nội dung bằng `pdfParser.ts` hoặc `officeParser.ts`.
  - Toàn bộ nội dung văn bản (text) được trích xuất và lưu vào MongoDB (model `Document`). Hệ thống dùng `textChunker.ts` băm văn bản thành các đoạn nhỏ (chunks).
* **Bước 2: Đẩy vào Hàng đợi (RabbitMQ)**
  - File `backend/src/queues/documentQueue.ts` làm nhiệm vụ đẩy (Publish) toàn bộ chunks vào hàng đợi `document_processing_queue`. Hàng đợi này được cấu hình bền bỉ (`durable: true`) để chống mất dữ liệu. API lập tức trả về trạng thái `processing` cho Frontend.
* **Bước 3: Xử lý ngầm (Worker)**
  - Worker (Consumer) trong nền sẽ gắp Message ra và gọi sang **AI Engine** (qua API `/api/v1/rag/ingest`) để xử lý.
* **Bước 4: Chunking & Vectorization (AI Engine)**
  - File `ai_engine/app/rag/ingest_service.py` tiếp nhận.
  - Sử dụng model `text-embedding-3-small` (Azure OpenAI) tại `embedder.py` để nhúng (embed) văn bản thành vector.
  - Lưu vào không gian **Qdrant Vector DB** (`vector_store.py`).
* **Bước 5: Hoàn tất & Báo cáo**
  - RabbitMQ tiếp tục gọi API tạo Knowledge Graph. Khi xong xuôi, Worker đánh dấu hoàn thành (`channel.ack`), lưu trạng thái thành công và bắn thông báo qua Socket.IO.

> [!TIP]
> **Code ở đâu?**
> Quản lý Queue: [`documentQueue.ts`](file:///home/quync/HTV/projects/ai-assistant/backend/src/queues/documentQueue.ts)
> AI Ingestion: [`ingest_service.py`](file:///home/quync/HTV/projects/ai-assistant/ai_engine/app/rag/ingest_service.py)

---

## 2. 🧠 Quá trình RAG (Retrieval-Augmented Generation) & Chat
Hệ thống Chat không chỉ trò chuyện thông thường mà áp dụng kỹ thuật RAG để "hỏi đáp trên tài liệu".

* **Chiến lược RAG thông minh (Retriever Strategy)**
  - File [`retriever.py`](file:///home/quync/HTV/projects/ai-assistant/ai_engine/app/rag/retriever.py) định nghĩa 2 chiến lược:
    1. **`full_doc`**: Nếu tài liệu ngắn, hệ thống lấy toàn bộ văn bản ghép lại để GPT hiểu ngữ cảnh tốt nhất (không cần search vector).
    2. **`semantic`**: Nếu tài liệu dài, dùng Vector Search (Cosine Similarity) tìm ra top các chunk liên quan nhất. Luôn ép (force) lấy thêm đoạn đầu tiên của tài liệu để GPT không quên tiêu đề và tóm tắt chung.
* **Tích hợp vào ChatService**
  - Trong [`aiService.ts`](file:///home/quync/HTV/projects/ai-assistant/backend/src/services/aiService.ts), Node.js gửi câu hỏi sang AI Engine lấy Context. Nếu AI Engine sập, hệ thống vẫn có **Fallback** tự động tìm kiếm Keyword cơ bản trên MongoDB để đảm bảo Chat không bao giờ chết.
  - Sau khi có Context, gửi tới Model `gpt-5-mini` thông qua hàm `chatWithContext`.

---

## 3. 🕸️ Mạng Tri Thức (Knowledge Graph / Network)
Biến tài liệu thành bản đồ tư duy!

* **Quá trình sinh (Generation)**
  - Nằm ở cuối quá trình Upload (RabbitMQ), Node.js gửi prompt yêu cầu GPT phân tích tài liệu và trả về cấu trúc JSON gồm Node (định nghĩa, thuật ngữ) và Edge (mối quan hệ). Tại đây ta dùng kĩ thuật **Structured Outputs** (ép kiểu Zod Schema) để ép LLM trả về chính xác JSON mà không bị vỡ.
* **Lưu trữ**
  - Lưu vào MongoDB tại [`KnowledgeGraph.ts`](file:///home/quync/HTV/projects/ai-assistant/backend/src/models/KnowledgeGraph.ts). Frontend sẽ không tự động thêm/xóa/sửa Node ở DB để tránh làm phức tạp logic, chỉ thao tác nội bộ (như di chuyển tọa độ).
* **Hiển thị (Frontend)**
  - Render thông qua các thư viện Graph. Khi tài liệu đang xử lý, trạng thái `processing` được hiển thị UI Loading đẹp mắt ở Component [`DocumentNetworkTab.tsx`](file:///home/quync/HTV/projects/ai-assistant/frontend/src/components/documents/network/DocumentNetworkTab.tsx). Khi user kéo thả các hạt (nodes), UI sẽ cập nhật mượt mà (optimistic update).

---

## 4. 🗂️ Flashcards & Quizzes (Bài Kiểm Tra)
* **Tạo tự động bằng AI**
  - Dựa vào module [`azureAiUtil.ts`](file:///home/quync/HTV/projects/ai-assistant/backend/src/utils/azureAiUtil.ts), `aiService.ts` gửi request tới LLM (`gpt-5-mini`) yêu cầu tạo Flashcard/Câu trắc nghiệm.
  - Prompt được kĩ sư tinh chỉnh cẩn thận: Yêu cầu Quiz phải có đáp án sai hợp lý (không ngớ ngẩn), giải thích rõ ràng tại sao đúng, còn Flashcard phải chia độ khó. Luôn ép LLM cùng ngôn ngữ với văn bản gốc.
* **Quản lý**
  - Dữ liệu sinh ra được lưu tĩnh vào CSDL (`models/Flashcard.ts` & `models/Quiz.ts`) để user làm lại nhiều lần.

---

## 5. 🚀 Kỹ Thuật Cache (Redis)
Dự án sử dụng Cache vô cùng triệt để để giảm tải 90% DB và tăng tốc phản hồi (từ 2s xuống 0.05s).

* **Code cốt lõi**
  - [`redisService.ts`](file:///home/quync/HTV/projects/ai-assistant/backend/src/services/redisService.ts): Class quản lý Cache. Nó thông minh ở chỗ tự động kiểm tra giá trị rỗng (`isEmptyValue`) để không bao giờ lưu mảng rỗng `[]` hay chuỗi rỗng làm rác RAM.
* **Được dùng ở đâu?**
  1. **Danh sách tài liệu (`DocumentList`)**: Lưu cache ở hàm `getDocuments`. 
  2. **Chi tiết tài liệu (`DocumentDetail`)**: Truy cập cùng một tài liệu liên tục sẽ chọc vào Cache thay vì MongoDB.
  3. **Mã OTP (Xác thực)**: Hàm `register` lưu mã gồm 6 số vào Redis với TTL là 5 phút (`300s`).

> [!IMPORTANT]
> **Cơ chế Invalidation (Xóa cache)**
> Hệ thống tuân thủ chặt chẽ việc xóa cache cũ khi có dữ liệu mới. Bất cứ khi nào user tải file lên, xóa file, hoặc khi **RabbitMQ** phân tích tài liệu xong `->` Server đều kích hoạt hàm `redisService.deleteObject(cacheKey)`. Lúc này cache cũ bị đập bỏ, ép web lấy dữ liệu mới nhất.

---

## 6. 🔔 Real-time Notifications (Thông báo)
Luồng xử lý giúp web hoạt động như một Single Page App thực thụ.

* **Backend (Socket.IO + Express)**
  - Tích hợp chung `http.Server` với Express. Service [`socketService.ts`](file:///home/quync/HTV/projects/ai-assistant/backend/src/services/socketService.ts) cho phép user join vào một "Căn phòng" (Room) mang tên `userId` của họ.
  - Worker RabbitMQ khi hoàn thành vẽ biểu đồ sẽ ghi xuống DB (bảng `Notification`) rồi gọi trực tiếp `io.to(userId).emit("new_notification")` để bắn tin nhắn thẳng tới user đó.
* **Frontend**
  - Bắt sự kiện Socket trong `useEffect` của file [`Header.tsx`](file:///home/quync/HTV/projects/ai-assistant/frontend/src/components/layouts/Header.tsx).
  - Tự động cộng số thông báo, thả pop-up (Toast) thành công xanh lá cây mượt mà góc phải màn hình, đồng thời cập nhật trạng thái mà không cần tải lại trang. Schema của thông báo cực dẻo dai (`type: string`) để sẵn sàng đón các loại tin tức mới.
