# Tài liệu Thiết Kế Kỹ Thuật: Hàng đợi RabbitMQ (AI Engine - Python)

Tài liệu này mô tả kiến trúc xử lý message RabbitMQ cho service Python (AI Engine). Hệ thống sẽ sử dụng thư viện `aio-pika` để đạt được hiệu suất cao nhất.

## 1. Vai Trò Của Worker Python
- Python Worker là **Consumer** của `document_processing_queue` và là **Producer** của `document_completed_queue`.
- Python **không** khai báo Topology (Exchange/Queue DLX, TTL, etc.). Việc khai báo là trách nhiệm của Node.js. Python chỉ kết nối tới Queue đã có sẵn với cờ `passive=True` (nếu thư viện hỗ trợ) để tránh lỗi `PRECONDITION_FAILED` do sai lệch cấu hình.
- Phải chạy như một tiến trình (process) độc lập với API Web (`uvicorn`).

## 2. Kỹ Thuật Xử Lý Message (aio-pika)
Vì quá trình nhúng (embedding) và cắt văn bản (chunking) tốn nhiều tài nguyên CPU và thời gian, ta không được phép chạy đồng bộ trực tiếp trong vòng lặp sự kiện (event loop) của `aio-pika`.
- **Giải pháp:** Sử dụng `asyncio.to_thread` hoặc `ThreadPoolExecutor` để đẩy tác vụ nặng ra một luồng (thread) khác. Việc này giúp luồng chính rảnh tay để liên tục gửi các gói tin **Heartbeat** cho RabbitMQ, tránh tình trạng bị ngắt kết nối oan.
- **Fair Dispatch:** Cấu hình `prefetch_count = 1` hoặc `2` để giới hạn số lượng tài liệu xử lý song song, tránh đụng trần Rate Limit của OpenAI / Azure OpenAI.

## 3. Luồng Xử Lý Lỗi (Retry & DLQ)
Khi nhận message từ `document_processing_queue`:
1. Đọc header `x-death` từ message.
   - Số lần thử (Retry Count) = số lượng phần tử hoặc giá trị `count` trong `x-death`.
2. Bắt `try/catch` toàn bộ quá trình.
3. Phân biệt loại lỗi:
   - **Lỗi tạm thời (Network, Rate Limit 429):**
     - Nếu `Retry Count <= 3`: Gọi `message.reject(requeue=False)` (hoặc `nack`). RabbitMQ sẽ ném message vào Retry Queue (TTL 60s) rồi quay lại.
     - Nếu `Retry Count > 3`: Đã hết số lần cho phép. Gọi `message.ack()`, và tự động Publish một message `status: "failed"` sang `document_completed_queue`.
   - **Lỗi vĩnh viễn (File rỗng, Format sai):**
     - Không cần retry. Gọi `message.ack()`, Publish thông báo `status: "failed"` sang `completed_queue` kèm nguyên nhân lỗi.

## 4. Tính Luỹ Đẳng (Idempotency)
RabbitMQ đảm bảo giao hàng ít nhất 1 lần (at-least-once). Do đó một message có thể bị xử lý nhiều lần nếu worker sập đột ngột.
- Vector Point ID cho Qdrant không được sinh ngẫu nhiên (`uuid4`), mà phải là mã băm cố định dựa trên Document ID và Chunk Index: `uuid5(NAMESPACE, f"{documentId}_{chunkIndex}")`.
- Dùng lệnh **Upsert** vào Qdrant để đè Vector mới lên Vector cũ (nếu trùng).

## 5. Message Contract (Python to Node)
Khi xử lý xong (Thành công hoặc Thất bại vĩnh viễn), Python đẩy message vào `document_completed_queue`:
```json
{
  "documentId": "string",
  "userId": "string",
  "fileName": "string",
  "status": "ready" | "failed",
  "error": "Lỗi chi tiết (nếu status = failed)",
  "correlationId": "UUID"
}
```
