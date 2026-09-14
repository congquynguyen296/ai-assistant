# Feature: Knowledge Graph / Concept Map

## 1. Overview
Tính năng "Knowledge Graph" (Sơ đồ kiến thức) cho phép trích xuất các khái niệm cốt lõi từ tài liệu (PDF, Word, Excel) và trực quan hóa chúng dưới dạng mạng lưới (Nodes & Edges). Tính năng này giúp người dùng dễ dàng nắm bắt các khái niệm chính và mối liên hệ giữa chúng mà không cần phải đọc toàn bộ tài liệu dài.

## 2. Core Flows

### 2.1 Sinh Sơ đồ tự động (Background Job)
- Người dùng tải tài liệu lên hệ thống.
- Sau khi tài liệu được xử lý trích xuất văn bản (`extractText`), một job sẽ được đẩy vào **RabbitMQ (`documentQueue`)**.
- Job này làm hai nhiệm vụ song song/tuần tự:
  - Ingest tài liệu vào Qdrant cho RAG.
  - Sử dụng Gemini AI để sinh ra Knowledge Graph JSON (bằng cách gom nhóm các chunks).
- AI sẽ tự động ánh xạ các trích dẫn (`citations`) trong từng Concept về đúng `chunkIndex` (Dựa trên context text được đánh dấu `[Chunk X]`).
- Kết quả được validate bằng **Zod** trước khi được map với **MongoDB ObjectId** và lưu vào Database với `status` là `completed`.

### 2.2 Tương tác với Sơ đồ (Granular API & Optimistic UI)
- Sơ đồ được render trên Frontend sử dụng **React Flow**.
- Tất cả các tương tác (Kéo thả thay đổi toạ độ `position`, Sửa Tên, Xóa, Thêm Node, Nối Edge) đều được cập nhật lên giao diện **ngay lập tức** (Optimistic UI) mà không cần chờ Server.
- Một API call ngầm (`PUT / POST / DELETE` ở mức độ Node/Edge) sẽ được gọi song song để lưu thay đổi xuống Database.
- Mỗi thao tác đi kèm với `version` của Graph. Nếu Server phát hiện phiên bản đã cũ (lỗi conflict do có luồng khác vừa ghi đè), Backend sẽ từ chối bằng lỗi `409 Conflict`, Frontend sẽ tự động roll-back và tải lại state mới nhất từ Server.
- Khi xoá một Node, Backend sẽ **tự động Cascade Delete** tất cả các Edge đang trỏ đến hoặc đi từ Node đó.

## 3. Database Schema

### `KnowledgeGraph` Model
- `documentId`: Tham chiếu đến Document.
- `userId`: Tham chiếu đến chủ sở hữu (phân quyền).
- `status`: `pending` | `processing` | `completed` | `failed`.
- `error`: Lưu trữ thông tin lỗi nếu `status` == `failed`.
- `version`: Số thứ tự tăng dần mỗi lần có thay đổi (Dùng cho Optimistic Locking).
- `nodes`: Mảng các concept (Khái niệm).
  - `_id`: ObjectId.
  - `label`: Tên concept.
  - `category`: Phân loại (vd: `core`, `algorithms`, `systems`).
  - `importance`: Độ quan trọng (1, 2, 3).
  - `summary`: Tóm tắt.
  - `position`: Toạ độ `{ x, y }` trên React Flow.
  - `citations`: Mảng chứa `{ excerpt, chunkIndex }`.
- `edges`: Mảng các liên kết.
  - `_id`: ObjectId.
  - `from`: Node ObjectId.
  - `to`: Node ObjectId.
  - `label`: Mô tả mối quan hệ.

## 4. API Endpoints
- `GET /api/documents/:documentId/knowledge-graph`
- `POST /api/documents/:documentId/knowledge-graph/nodes`
- `PUT /api/documents/:documentId/knowledge-graph/nodes/:nodeId`
- `DELETE /api/documents/:documentId/knowledge-graph/nodes/:nodeId`
- `POST /api/documents/:documentId/knowledge-graph/edges`
- `PUT /api/documents/:documentId/knowledge-graph/edges/:edgeId`
- `DELETE /api/documents/:documentId/knowledge-graph/edges/:edgeId`

Tất cả các route `POST/PUT/DELETE` đều yêu cầu có field `version` trong body.
