# Entity Dictionary: Collection, Field và Vai trò Logic

Tài liệu này mô tả các entity MongoDB hiện có trong code, vai trò của từng “table” (collection), từng field và field đó được dùng trong nghiệp vụ nào.

## Tổng quan collection

- `User`: tài khoản người dùng và xác thực.
- `Document`: metadata + nội dung đã parse của tài liệu học.
- `Flashcard`: bộ thẻ học sinh từ tài liệu.
- `Quiz`: bộ câu hỏi trắc nghiệm và kết quả làm bài.
- `ChatHistory`: lịch sử hội thoại AI theo user + document.

## 1) `User` (`src/models/User.ts`)

## Vai trò trong hệ thống

- Nguồn dữ liệu gốc cho xác thực, hồ sơ user, phân quyền theo ownership.
- Được dùng trong:
  - `authService` (register/login/google-login/profile/change-password),
  - middleware `protect` để nạp user từ JWT.

## Field chi tiết và vai trò logic

- `username: string` (required, unique, trim, minLength 3)
  - Vai trò: tên hiển thị/định danh người dùng trong profile.
  - Logic dùng: đăng ký, cập nhật profile.
- `email: string` (required, unique, lowercase, regex email)
  - Vai trò: định danh đăng nhập chính.
  - Logic dùng: register/login/google-login/check trùng account.
- `password: string` (required nếu không có `googleId`, `select: false`)
  - Vai trò: xác thực local account.
  - Logic dùng: login, change-password.
  - Lưu ý: bị ẩn mặc định khi query, chỉ query có chủ đích mới lấy.
- `googleId: string` (unique, sparse)
  - Vai trò: liên kết tài khoản Google OAuth.
  - Logic dùng: `googleLoginService`.
- `profileImage: string | null`
  - Vai trò: avatar profile.
  - Logic dùng: profile/update-profile.
- `createdAt`, `updatedAt` (timestamps)
  - Vai trò: theo dõi lịch sử tạo/cập nhật.

## Logic đặc biệt trên schema

- `pre("save")`: hash mật khẩu bằng `bcrypt` khi password thay đổi.
- `matchPassword(enteredPassword)`: so sánh mật khẩu đăng nhập.

## 2) `Document` (`src/models/Document.ts`)

## Vai trò trong hệ thống

- Đại diện tài liệu user upload.
- Lưu cả metadata file và nội dung parse/chunk để phục vụ AI, search, dashboard.
- Được dùng trong:
  - `documentService` (upload/list/detail/update/delete),
  - `aiService` (generate/chat/explain cần `status=ready`),
  - `progressService` (thống kê dashboard).

## Field chi tiết và vai trò logic

- `userId: ObjectId -> User` (required)
  - Vai trò: ownership và phân quyền.
  - Logic dùng: mọi query theo user.
- `title: string` (required)
  - Vai trò: tên tài liệu hiển thị UI.
  - Logic dùng: upload/update/list/detail.
- `fileName: string` (required)
  - Vai trò: tên file gốc.
- `filePath: string` (required)
  - Vai trò: đường dẫn object trong storage (Supabase).
  - Logic dùng: delete document, tạo signed URL.
- `fileUrl?: string`
  - Vai trò: URL truy cập file (thường signed URL).
- `mimeType: string` (default `application/pdf`)
  - Vai trò: xác định parser tương ứng khi xử lý file.
- `fileSize: number` (required)
  - Vai trò: metadata kích thước, có thể dùng để kiểm soát upload.
- `extractedText: string` (default `""`)
  - Vai trò: text đã parse từ file.
  - Logic dùng: generate summary/flashcard/quiz, fallback chat/explain.
- `chunks: [{ content, pageNumber, chunkIndex }]`
  - Vai trò: đơn vị ngữ cảnh nhỏ cho retrieval/chat.
  - Logic dùng: fallback `findRelevantChunks`, ingest RAG.
- `uploadDate: Date` (default now)
  - Vai trò: sắp xếp tài liệu mới/cũ.
- `status: "processing" | "ready" | "failed"`
  - Vai trò: trạng thái pipeline xử lý tài liệu.
  - Logic dùng: AI service chỉ xử lý khi `ready`.
- `lastAccessed: Date` (default now)
  - Vai trò: theo dõi truy cập gần nhất (cập nhật khi đọc detail).
- `createdAt`, `updatedAt`
  - Vai trò: audit thời gian.

## Index

- `{ userId: 1, uploadDate: -1 }` để tối ưu truy vấn danh sách theo user.

## 3) `Flashcard` (`src/models/Flashcard.ts`)

## Vai trò trong hệ thống

- Lưu các bộ flashcard sinh từ một document.
- Được dùng trong:
  - `aiService.generateFlashcardsService` (create),
  - `flashcardService` (list/review/star/delete),
  - `documentService` và `progressService` (count/liên đới).

## Field chi tiết và vai trò logic

- `userId: ObjectId -> User` (required)
  - Vai trò: ownership.
- `documentId: ObjectId -> Document` (required)
  - Vai trò: liên kết nguồn tài liệu.
- `title: string` (required)
  - Vai trò: tiêu đề bộ thẻ.
- `cards[]`:
  - `question: string`: câu hỏi.
  - `answer: string`: đáp án.
  - `difficulty: "easy" | "medium" | "hard"`: độ khó.
  - `lastReviewed: Date | null`: lần review gần nhất.
  - `reviewCount: number`: số lần review.
  - `isStarred: boolean`: đánh dấu sao.
  - Vai trò logic: dùng trong route review/star để cập nhật tiến độ học.
- `createdAt`, `updatedAt`
  - Vai trò: sắp xếp danh sách và theo dõi thay đổi.

## Index

- `{ userId: 1, documentId: 1 }` tối ưu query theo user + document.

## 4) `Quiz` (`src/models/Quiz.ts`)

## Vai trò trong hệ thống

- Lưu bộ câu hỏi quiz AI sinh ra và kết quả làm bài của user.
- Được dùng trong:
  - `aiService.generateQuizService` (create),
  - `quizService` (list/detail/submit/results/delete),
  - `documentService` và `progressService` (count/thống kê).

## Field chi tiết và vai trò logic

- `userId: ObjectId -> User` (required)
  - Vai trò: ownership.
- `documentId: ObjectId -> Document` (required)
  - Vai trò: liên kết nguồn quiz.
- `title: string` (required)
  - Vai trò: tiêu đề quiz.
- `questions[]`:
  - `question: string`
  - `options: string[4]` (validate phải đúng 4 lựa chọn)
  - `correctAnswer: string`
  - `explanation: string`
  - `difficulty: easy/medium/hard`
  - Vai trò logic: dữ liệu gốc để render quiz và chấm điểm.
- `userAnswer[]`:
  - `questionIndex: number`
  - `selectedAnswer: string`
  - `isCorrect: boolean`
  - `answerAt: Date`
  - Vai trò logic: lưu bài làm user và dùng để trả kết quả chi tiết.
- `score: number`
  - Vai trò: điểm phần trăm sau submit.
- `totalQuestions: number`
  - Vai trò: mẫu số chấm điểm.
- `completedAt: Date | null`
  - Vai trò: phân biệt quiz đã nộp hay chưa.
- `createdAt`, `updatedAt`
  - Vai trò: sorting, lịch sử cập nhật.

## Index

- `{ userId: 1, documentId: 1 }`.

## 5) `ChatHistory` (`src/models/ChatHistory.ts`)

## Vai trò trong hệ thống

- Lưu hội thoại AI theo cặp user-document để phục vụ xem lại chat.
- Được dùng trong `aiService.chatService`, `getChatHistoryService`, `deleteChatService`.

## Field chi tiết và vai trò logic

- `userId: ObjectId -> User` (required)
  - Vai trò: ownership.
- `documentId: ObjectId -> Document` (required)
  - Vai trò: gắn ngữ cảnh tài liệu.
- `messages[]`:
  - `role: "user" | "assistant"`
  - `content: string`
  - `timestamp: Date`
  - `relevantChunks: number[]`
  - Vai trò logic:
    - lưu nội dung hội thoại,
    - ghi dấu chunk nào được dùng để trả lời.
- `createdAt`, `updatedAt`
  - Vai trò: lịch sử bản ghi.

## Index

- `{ userId: 1, documentId: 1 }`.

## Quan hệ dữ liệu giữa các collection

- `User (1) -> (n) Document`
- `Document (1) -> (n) Flashcard`
- `Document (1) -> (n) Quiz`
- `Document (1) -> (1..n) ChatHistory` (theo hiện trạng code thường 1 cặp user+document có 1 bản ghi chat history được append dần)

## Lưu ý “table” theo ngữ cảnh MongoDB

- Hệ thống dùng MongoDB, nên “table” tương ứng với **collection**.
- Không thấy migration SQL; schema được định nghĩa qua Mongoose model.
