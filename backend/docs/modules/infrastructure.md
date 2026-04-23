# Module Infrastructure (Nền tảng dùng chung)

## Tổng quan

Nhóm này bao gồm các thành phần dùng chung cho toàn hệ thống:
- cấu hình kết nối hạ tầng,
- middleware bảo mật/lỗi,
- util parse/map/auth,
- service tích hợp ngoài (mail, Redis, RAG),
- kiểu dữ liệu và template email.

## Danh sách file liên quan

- Config:
  - `src/config/db.ts`
  - `src/config/redis.ts`
  - `src/config/supabase.ts`
  - `src/config/googleConfig.ts`
  - `src/config/multer.ts`
- Middleware:
  - `src/middlewares/auth.ts`
  - `src/middlewares/errorHandle.ts`
- Service dùng chung:
  - `src/services/mailService.ts`
  - `src/services/redisService.ts`
  - `src/services/ragClientService.ts`
- Utils:
  - `src/utils/authUtil.ts`
  - `src/utils/dtoMapper.ts`
  - `src/utils/pdfParser.ts`
  - `src/utils/officeParser.ts`
  - `src/utils/textChunker.ts`
  - `src/utils/geminiUtil.ts`
  - `src/utils/groqUtil.ts`
- Types:
  - `src/types/common.ts`
  - `src/types/entity.ts`
  - `src/types/external.ts`
  - `src/types/request.ts`
  - `src/types/express.d.ts`
  - `src/types/env.d.ts`
- Templates:
  - `src/templates/emails/authTemplate.ts`
  - `src/templates/emails/notificationTemplate.ts`
  - `src/templates/emails/quizTemplate.ts`
- Entry:
  - `server.ts`

## Vai trò từng nhóm

## Config
- `db.ts`: kết nối MongoDB.
- `redis.ts`: khởi tạo Redis client.
- `supabase.ts`: client Supabase cho storage.
- `googleConfig.ts`: OAuth client cho Google login.
- `multer.ts`: định nghĩa lọc mime/type, giới hạn upload.

## Middleware
- `auth.ts` (`protect`):
  - lấy token từ header,
  - verify JWT,
  - load user vào request.
- `errorHandle.ts`:
  - chuẩn hóa lỗi ứng dụng và lỗi phổ biến từ thư viện.

## Service dùng chung
- `mailService.ts`: gửi OTP/welcome.
- `redisService.ts`: helper set/get/delete object trong Redis.
- `ragClientService.ts`: gọi API RAG ngoài cho ingest/retrieve/delete vector.

## Utils
- `authUtil.ts`: lấy user id từ request đã auth.
- `dtoMapper.ts`: map dữ liệu DB/raw sang DTO trả API.
- `pdfParser.ts` + `officeParser.ts`: parse văn bản từ file.
- `textChunker.ts`: tách nội dung thành chunk cho truy xuất AI.
- `geminiUtil.ts`: gọi Gemini cho nhiều tác vụ AI.
- `groqUtil.ts`: util Groq hiện có trong codebase (chưa thấy luồng route sử dụng trực tiếp).

## Types
- Tách type theo mục đích: entity/request/external/common/env.
- Mở rộng type Express qua file declaration.

## Server entry (`server.ts`)

Luồng chính:
1. Kết nối DB và Redis.
2. Cấu hình CORS + body parsers.
3. Mount routes theo `API_PREFIX`:
   - auth, documents, flashcards, quizzes, ai-generation, progress.
4. Gắn `errorHandler`.
5. Fallback 404.

## Dependency ngoài trong nhóm Infrastructure

- `mongoose`
- `redis`
- `@supabase/supabase-js`
- `google-auth-library`
- `jsonwebtoken`
- `multer`
- `nodemailer`
- `pdf-parse`, `mammoth`, `xlsx`

## Những gì chưa có trong code hiện tại

- Không có thư mục/lớp repository tách riêng.
- Không thấy queue framework (BullMQ, RabbitMQ...) hoặc cron scheduler.
