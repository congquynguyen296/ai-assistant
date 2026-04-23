# Hành vi hệ thống hiện tại

Tài liệu này mô tả hiện trạng backend dựa trên code trong `src` và `server.ts`.

## Cấu trúc thư mục chính

```text
src/
  config/
  controllers/
  dtos/
  middlewares/
  models/
  routes/
  services/
  templates/emails/
  types/
  utils/
server.ts
```

## Kiến trúc code đang dùng

- `Route -> Middleware -> Controller -> Service -> Model/External`.
- Controller chủ yếu:
  - nhận request
  - validate đầu vào mức route/controller
  - gọi service
  - trả response HTTP.
- Service chứa business logic chính, truy cập trực tiếp Mongoose model.
- Chưa có tầng `repository` riêng.

## Quy ước bất đồng bộ

- Dùng `async/await` xuyên suốt.
- Có một số tác vụ chạy “fire-and-forget” (không `await`) như ingest/xóa vector RAG, xử lý hậu upload.

## Quy chuẩn đặt tên và kiểu dữ liệu

- Biến/hàm: chủ yếu `camelCase`.
- Type/Interface: `PascalCase`.
- DTO tách riêng trong `src/dtos/*`.
- Type dùng chung trong `src/types/*`:
  - `entity.ts`: shape dữ liệu entity.
  - `request.ts`: request mở rộng (auth).
  - `external.ts`: kiểu cho service ngoài (RAG).
  - `common.ts`: kiểu common mapping.
  - `express.d.ts`: mở rộng type Express.

## Pattern đang thấy trong code

- Service pattern: có.
- Middleware pattern: có.
- DTO mapping pattern: có (`utils/dtoMapper.ts`).
- Repository pattern: **không thấy**.
- Queue/cron/job framework: **không thấy**.

## Response format hiện tại

Hiện tại tồn tại nhiều format response/error song song:

- Thành công thường là:

```json
{ "success": true, "message": "...", "data": ... }
```

- Một số endpoint không có `data` (ví dụ đổi mật khẩu/xóa).
- Lỗi có thể trả theo:
  - từ controller (custom trực tiếp),
  - từ `errorHandler` middleware,
  - từ fallback 404.
- Có sự không đồng nhất key `success` và `sucess` (đánh máy sai) ở một số chỗ.

## Error handling hiện tại

- Custom error class: `AppError` trong `middlewares/errorHandle.ts`.
- Global middleware xử lý:
  - Mongoose CastError
  - Mongo duplicate key
  - Mongoose validation
  - Multer file size
  - JWT invalid/expired
- Các lỗi không map cụ thể sẽ rơi về mã mặc định (thường 500).

## Xác thực và phân quyền

- Xác thực bằng JWT Bearer token.
- Middleware `protect`:
  - đọc `Authorization` header,
  - verify token,
  - nạp user từ DB,
  - gắn vào request.
- Hầu hết route nghiệp vụ (documents, flashcards, quizzes, ai, progress) đều yêu cầu `protect`.

## Tích hợp ngoài hiện có trong code

- Database: MongoDB (`mongoose`).
- Cache/session: Redis.
- Storage: Supabase Storage.
- AI: Google Gemini.
- OAuth: Google.
- Mail: Nodemailer.
- Parser file: PDF/DOCX/XLSX.
- RAG service: HTTP client gọi service ngoài (Python RAG).

## Các điểm chưa rõ hoặc cần lưu ý

- Không thấy queue framework nên retry/độ bền cho job nền còn giới hạn.
- Có util/template chưa thấy luồng gọi trực tiếp ở route hiện tại.
- Có endpoint quiz cần test runtime thêm về thứ tự route tĩnh/động để tránh bắt sai path.
- Một số field response có typo theo hiện trạng code.
