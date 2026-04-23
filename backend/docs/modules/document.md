# Module Document

## Tổng quan

Module `document` quản lý vòng đời tài liệu học tập:
- upload file,
- parse text,
- chia chunk,
- lưu metadata,
- cache danh sách/chi tiết,
- đồng bộ vector sang RAG service,
- cập nhật/xóa tài liệu.

## Danh sách file liên quan

- `src/routes/documentRoutes.ts`
- `src/controllers/documentController.ts`
- `src/services/documentService.ts`
- `src/models/Document.ts`
- `src/models/Flashcard.ts`
- `src/models/Quiz.ts`
- `src/config/multer.ts`
- `src/config/supabase.ts`
- `src/services/redisService.ts`
- `src/services/ragClientService.ts`
- `src/utils/pdfParser.ts`
- `src/utils/officeParser.ts`
- `src/utils/textChunker.ts`
- `src/utils/dtoMapper.ts`
- `src/dtos/documents/*.ts`

## API và flow xử lý

## `POST /documents/upload`
- Middleware: `protect`, `upload.single("file")`.
- Controller: `uploadDocument`.
- Service: `uploadDocumentService`.
- Flow:
  1. Kiểm tra file đầu vào.
  2. Upload file lên Supabase Storage.
  3. Tạo bản ghi `Document` với trạng thái ban đầu (`processing`).
  4. Invalidate cache danh sách document của user trong Redis.
  5. Chạy xử lý nền:
     - parse nội dung theo mime type (PDF/DOCX/XLSX),
     - chia chunk text,
     - update document thành `ready`,
     - gửi dữ liệu sang RAG service để ingest vector.
  6. Trả response ngay sau khi tạo document (không chờ ingest hoàn tất).

## `GET /documents`
- Middleware: `protect`.
- Controller: `getDocuments`.
- Service: `getDocumentsService`.
- Flow:
  1. Đọc cache Redis theo `documents:${userId}`.
  2. Nếu cache hit thì trả luôn.
  3. Nếu cache miss:
     - query Mongo aggregate/list,
     - enrich số lượng flashcards/quizzes,
     - tạo signed URL file (nếu có),
     - ghi cache Redis có TTL.
  4. Trả danh sách.

## `GET /documents/:documentId`
- Middleware: `protect`.
- Controller: `getDocumentById`.
- Service: `getDocumentByIdService`.
- Flow:
  1. Check cache item theo user+document.
  2. Cache miss thì query DB theo quyền sở hữu user.
  3. Enrich dữ liệu phụ (count, URL).
  4. Update `lastAccessed`.
  5. Ghi cache lại.

## `PUT /documents/:documentId`
- Middleware: `protect`.
- Controller: `updateDocument`.
- Service: `updateDocumentService`.
- Flow:
  1. Tìm document theo `userId + documentId`.
  2. Cập nhật trường cho phép (ví dụ title).
  3. Invalidate cache list và cache item.
  4. Trả document đã cập nhật.

## `DELETE /documents/:documentId`
- Middleware: `protect`.
- Controller: `deleteDocument`.
- Service: `deleteDocumentService`.
- Flow:
  1. Tìm document theo owner.
  2. Xóa file trên Supabase.
  3. Xóa dữ liệu liên quan:
     - `Flashcard` theo document
     - `Quiz` theo document
     - `Document` hiện tại
  4. Gọi xóa vector ở RAG service (async).
  5. Invalidate cache Redis.

## Hàm/chức năng chính

- Controller:
  - `uploadDocument`
  - `getDocuments`
  - `getDocumentById`
  - `updateDocument`
  - `deleteDocument`
- Service:
  - `uploadDocumentService`
  - `processDocument` (xử lý parse/chunk)
  - `getDocumentsService`
  - `getDocumentByIdService`
  - `updateDocumentService`
  - `deleteDocumentService`

## Model liên quan: `Document`

Các nhóm field chính:
- Nhận diện và ownership: `_id`, `userId`, `title`
- Metadata file: `fileName`, `filePath`, `fileUrl`, `mimeType`, `fileSize`
- Nội dung xử lý: `extractedText`, `chunks`
- Trạng thái xử lý: `status` (`processing`, `ready`, `failed`...)
- Thời điểm: `uploadDate`, `lastAccessed`, `createdAt`, `updatedAt`

## Dependency ngoài

- `multer` (nhận file upload)
- `@supabase/supabase-js` (storage)
- `redis` (cache)
- `pdf-parse`, `mammoth`, `xlsx` (parse file)
- `mongoose`
- HTTP integration đến RAG service

## Ghi chú hiện trạng

- Hậu xử lý ingest/xóa vector chạy bất đồng bộ, không có queue framework.
- Nếu RAG service lỗi, document vẫn có thể tồn tại ở trạng thái đã parse trong DB.
