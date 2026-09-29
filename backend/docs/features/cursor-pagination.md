# Cursor-based Pagination cho API Documents

## Vấn đề hiện tại
API lấy danh sách tài liệu (`getDocumentsService`) trước đây sử dụng Offset-based Pagination bằng `$skip` và `$limit`. 
- **Hiệu năng kém khi số trang tăng**: Lệnh `$skip` buộc MongoDB quét qua tất cả các bản ghi trước đó rồi vứt đi, dẫn tới độ trễ (O(N)) rất tốn CPU và I/O khi dữ liệu lớn.
- **Data drift**: Nếu có sự thêm hoặc xóa dữ liệu giữa hai lần gọi trang (VD đang ở trang 1, insert document mới -> sang trang 2 bản ghi cuối của trang 1 sẽ bị đẩy xuống thành đầu trang 2 gây lặp dữ liệu).

## Giải pháp Cursor-based Pagination
Thay vì truyền tham số `page`, client truyền tham số `cursor` để MongoDB nhảy (seek) thẳng đến vị trí cần thiết.

- **Cấu trúc cursor**: `<uploadDate_ms>_<documentId>` (VD: `1735689600000_65f1a9b2...`). Việc sử dụng cả `uploadDate` và `_id` giúp việc sắp xếp và query chính xác 100%, kể cả khi có nhiều tài liệu được tải lên trong cùng 1 mili-giây.
- **Index**: Thêm index `{ userId: 1, uploadDate: -1, _id: -1 }` để tối ưu cho query `$sort` và tìm kiếm bằng cursor, giúp truy vấn hoàn toàn chạy trên Index (IXSCAN), không phải In-Memory Sort.
- **Cache Redis**: Việc sử dụng cursor tạo ra vô vàn key phân trang khác nhau nên ta không thể cache toàn bộ. Thay vào đó, ta **chỉ cache trang đầu tiên** (trang mặc định khi cursor rỗng) bằng key pattern rõ ràng `documents:${userId}:first_page:${size}`. Điều này giúp `DEL` dễ dàng.

## Hướng dẫn tích hợp
### Backend
- Query parameters cho endpoint `/api/v1/documents`: 
  - `size`: Số bản ghi / trang (mặc định 10).
  - `cursor`: Truyền giá trị `nextCursor` nhận được từ trang trước.
  - `page`: **(Legacy)** vẫn giữ để tương thích ngược nếu Frontend chưa kịp đổi (nếu không truyền `cursor`).

Response trả về:
```json
{
  "success": true,
  "data": {
    "documents": [...],
    "pagination": {
      "size": 10,
      "total": 120, // legacy
      "page": 1, // legacy
      "totalPages": 12, // legacy
      "nextCursor": "1735689600000_65f1a9b2...",
      "hasNextPage": true
    }
  }
}
```

### Frontend
Frontend `DocumentListPage` sử dụng cơ chế "Tải thêm" (Load More) hoặc Cuộn vô hạn (Infinite scroll).
- Trang 1 gọi API không có tham số `cursor`.
- Nhận về `hasNextPage` và `nextCursor`. 
- Khi user bấm nút "Tải thêm", truyền `cursor` lên API và nối mảng dữ liệu trả về vào mảng dữ liệu hiện tại.

## Sửa lỗi ẩn liên quan đến Cache
Trong bản cập nhật này, một lỗi ngầm ở Consumer Queue (`documentQueue.ts`) đã được sửa:
Trước đây khi Worker Python trả kết quả về (Status = Ready / Failed), RabbitMQ cập nhật lên MongoDB nhưng **không hề gọi hàm invalidate cache**. Kết quả là UI bị kẹt ở trạng thái `Processing` cho tới khi hết hạn cache. Lỗi này đã được vá thông qua việc gọi `invalidateDocumentsListCache(userId)` ngay trong Queue handler.
