# Tài liệu Thiết Kế Kỹ Thuật: Hàng đợi RabbitMQ (Backend Node.js)

Tài liệu này mô tả kiến trúc tách rời (Decoupling) bằng RabbitMQ, từ góc nhìn của hệ thống Node.js.

## 1. Giới Thiệu
Chuyển đổi luồng xử lý tài liệu (Document Ingestion) từ gọi HTTP đồng bộ (REST API) sang giao tiếp bất đồng bộ thông qua RabbitMQ. Node.js đóng vai trò là **Người khai báo hạ tầng (Topology Owner)**, **Producer (Publisher)** của công việc và **Consumer** để cập nhật trạng thái kết quả.

## 2. Hạ Tầng Mạng (RabbitMQ Topology)
Node.js sẽ chịu trách nhiệm khai báo (assert) toàn bộ Exchange và Queue lúc ứng dụng khởi động.

### A. Processing Queue & Retry Mechanism
- **Exchange:** `processing_exchange` (direct)
- **Queue chính:** `document_processing_queue`
  - *Dead Letter Exchange (DLX):* `retry_exchange`
  - (Các message lỗi tạm thời sẽ bị NACK để văng sang `retry_exchange`)

- **Exchange Retry:** `retry_exchange` (direct)
- **Queue Retry:** `document_retry_queue`
  - *Dead Letter Exchange (DLX):* `processing_exchange` (để quay lại làm lại)
  - *Message TTL:* 60,000ms (60 giây).

### B. Completed Queue
- **Queue kết quả:** `document_completed_queue` (Python đẩy vào đây, Node đọc).

## 3. Luồng Producer (Publisher)
Vị trí code: `enqueueDocumentProcessing()`
1. Chặn file văn bản quá lớn (> 5MB) để bảo vệ RabbitMQ.
2. Dùng `createConfirmChannel` để đẩy message.
3. `await channel.waitForConfirms()`: Đảm bảo RabbitMQ nhận được tin. Nếu thất bại, quăng HTTP 500 lỗi về cho user (không cập nhật Mongo để tránh lưu dữ liệu giả).

**Payload gửi đi:**
```json
{
  "documentId": "string",
  "userId": "string",
  "fileName": "string",
  "text": "string (nội dung trích xuất)",
  "correlationId": "UUID"
}
```

## 4. Luồng Consumer (Completed)
Vị trí code: Lắng nghe `document_completed_queue`.
- **Cấu hình:** `prefetch_count = 10`
- **Nhiệm vụ:**
  - Nhận kết quả từ Python (`status: "ready" | "failed"`).
  - Update `status` trong `Document` model thông qua hàm `findOneAndUpdate` (có check status `$in: ["processing", "failed"]`).
  - Nếu kết quả thay đổi thực sự, gửi Socket.io Notification về user.
  - Xử lý mồ côi (Orphan Docs): Nếu update trả về `null` ➔ Kiểm tra xem `Document` còn tồn tại không. Nếu không (bị user xóa) ➔ Bắn HTTP DELETE `/delete` sang Python để dọn dẹp Vector.

## 5. Job Sweeper (Quét rác)
- Chạy định kỳ 30 - 60 phút.
- Quét các Document kẹt ở `status: "processing"` quá 45 phút.
- Đổi trạng thái thành `failed` để tránh kẹt UI vô tận. (Nếu Python trả về `ready` muộn hơn, hệ thống vẫn ưu tiên cho phép ghi đè).
