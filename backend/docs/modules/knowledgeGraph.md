# Module Knowledge Graph

## Tổng quan

Module `knowledge-graph` quản lý việc sinh và duy trì sơ đồ kiến thức của một tài liệu:
- Nhận diện các khái niệm (Concept Node) và mối quan hệ (Edge) từ tài liệu.
- Lưu trữ sơ đồ dưới dạng JSON (Nodes & Edges) trong MongoDB.
- Quản lý quá trình xử lý nền bằng Queue (RabbitMQ) kết hợp với Gemini AI.
- Cung cấp Granular API (API chi tiết từng node/edge) với cơ chế Optimistic Locking (chống ghi đè) để Frontend cập nhật tức thì (Optimistic UI).
- Xử lý Cascade Delete: Tự động xóa các Edge liên quan khi một Node bị xóa.

## Danh sách file liên quan

- `src/routes/knowledgeGraphRoutes.ts`
- `src/controllers/knowledgeGraphController.ts`
- `src/services/knowledgeGraphService.ts`
- `src/models/KnowledgeGraph.ts`
- `src/queues/documentQueue.ts`
- `src/utils/geminiUtil.ts` (Hàm `generateKnowledgeGraph`)

## API và flow xử lý

### `GET /knowledge-graph/documents/:documentId`
- Controller: `getGraph`.
- Flow: Lấy `KnowledgeGraph` document. Nếu không có, trả về 404. Phục vụ việc hiển thị lần đầu và check `version` + `status`.

### `POST /knowledge-graph/documents/:documentId/nodes`
- Flow: User thêm Node thủ công. Backend push node mới vào DB, tăng `version`. Trả về Node vừa thêm kèm `version` mới.

### `PUT /knowledge-graph/documents/:documentId/nodes/:nodeId`
- Flow: Client gửi toạ độ mới (`position`), tên (`label`), v.v kèm `version`. Nếu `version` khớp, update data và tăng `version`. Nếu không khớp, ném `409 Conflict`.

### `DELETE /knowledge-graph/documents/:documentId/nodes/:nodeId`
- Flow: Xóa Node trong mảng `nodes`. Sau đó lọc mảng `edges` để bỏ đi tất cả các edge có `from` hoặc `to` bằng `nodeId`. Tăng `version`.

### (Tương tự cho Edges: POST, PUT, DELETE)

## Hàm/chức năng chính

- Service:
  - `getGraphService`
  - `addNodeService`
  - `updateNodeService`
  - `deleteNodeService` (Bao gồm Cascade logic)
  - `addEdgeService`, `updateEdgeService`, `deleteEdgeService`
- Queue (`documentQueue`):
  - Nhận job khi tài liệu upload xong.
  - Phân tích độ dài: Nếu text > 50 chunks thì chia nhỏ Map-Reduce, nếu không thì đưa nguyên văn bản.
  - Parse kết quả JSON của AI qua `zod` để lọc dữ liệu bẩn.
  - Map `tempId` từ AI sang `ObjectId` thực tế.
  - Lưu vào DB và đổi status `processing` -> `completed`.

## Dependency ngoài

- `amqplib` (RabbitMQ client)
- `@google/genai` (Tạo sơ đồ)
- `zod` (Validate JSON schema)
