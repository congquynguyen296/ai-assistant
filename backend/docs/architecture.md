# Kiến trúc hệ thống backend

## 1) Request flow tổng quát

```text
Client
  -> Route (Express Router)
  -> Middleware (auth/validator/upload)
  -> Controller
  -> Service (business logic)
  -> Model (MongoDB) / External Service (Redis, Supabase, Gemini, RAG, Mail)
  -> Controller trả response
```

## 2) Auth flow

```text
Client -> /auth/*
  -> (validator nếu có)
  -> AuthController
  -> AuthService
     -> User model (MongoDB)
     -> Redis (OTP)
     -> Mail service (gửi OTP/chào mừng)
     -> Google OAuth client (google-login)
     -> JWT sign
  -> Response
```

## 3) Upload và xử lý tài liệu

```text
Client -> POST /documents/upload
  -> protect
  -> multer (file in memory)
  -> DocumentController.uploadDocument
  -> DocumentService.uploadDocumentService
     -> Supabase upload file
     -> Document.create(status=processing)
     -> Invalidate Redis cache
     -> async processDocument
         -> parse file (pdf/docx/xlsx)
         -> chunk text
         -> update Document(status=ready, chunks, extractedText)
         -> async ingest sang RAG service
  -> Response (trả ngay sau khi tạo document)
```

## 4) AI generation và chat flow

```text
Client -> /ai-generation/*
  -> protect
  -> AIController
  -> AIService
     -> Document model (kiểm tra document ready)
     -> Gemini util (generate/chat/explain)
     -> Nếu chat/explain:
          ưu tiên retrieve context từ RAG service
          fallback: keyword chunk search nội bộ
     -> Với chat: lưu ChatHistory model
  -> Response
```

## 5) Quiz/Flashcard flow

```text
Client -> /quizzes hoặc /flashcards
  -> protect
  -> Controller tương ứng
  -> Service tương ứng
     -> Query/update model Quiz hoặc Flashcard
     -> map DTO output
  -> Response
```

## 6) Cache flow (Documents)

```text
GET documents
  -> check Redis key theo user
  -> cache hit: trả dữ liệu cache
  -> cache miss: query Mongo + enrich + set Redis TTL
```

Khi upload/update/delete document:
- xóa cache list theo user.
- xóa cache item theo document.

## 7) Error flow

```text
Error trong controller/service
  -> next(error)
  -> errorHandler middleware
      -> chuẩn hóa status + message
  -> JSON error response
```

## 8) External integration flow

- MongoDB: lưu toàn bộ entity chính.
- Redis: cache + OTP session.
- Supabase Storage: lưu file tài liệu.
- Gemini: sinh flashcards/quiz/summary và trả lời theo context.
- Google OAuth: xác thực đăng nhập Google.
- Mail (Nodemailer): gửi OTP/welcome.
- RAG service ngoài: ingest/retrieve/delete vector theo document.
