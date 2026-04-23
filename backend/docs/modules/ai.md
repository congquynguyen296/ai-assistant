# Module AI

## Tổng quan

Module `ai-generation` cung cấp tính năng AI trên tài liệu:
- sinh flashcards,
- sinh quiz,
- sinh summary,
- chat theo ngữ cảnh tài liệu,
- giải thích khái niệm,
- lấy/xóa lịch sử chat.

## Danh sách file liên quan

- `src/routes/aiRoutes.ts`
- `src/controllers/aiController.ts`
- `src/services/aiService.ts`
- `src/models/Document.ts`
- `src/models/Flashcard.ts`
- `src/models/Quiz.ts`
- `src/models/ChatHistory.ts`
- `src/services/ragClientService.ts`
- `src/utils/geminiUtil.ts`
- `src/utils/textChunker.ts`
- `src/utils/dtoMapper.ts`
- `src/dtos/ai/*.ts`
- `src/dtos/flashcards/flashcard.response.dto.ts`
- `src/dtos/quiz/quiz.dto.ts`

## API và flow xử lý

## `POST /ai-generation/generate-flashcards`
- Middleware: `protect`.
- Controller: `generateFlashcards`.
- Service: `generateFlashcardsService`.
- Flow:
  1. Xác thực user và nhận `documentId`, số lượng thẻ, yêu cầu.
  2. Tìm document ở trạng thái `ready`.
  3. Gọi Gemini để sinh card.
  4. Lưu thành `Flashcard` set mới.
  5. Map DTO trả về client.

## `POST /ai-generation/generate-quiz`
- Controller: `generateQuiz`.
- Service: `generateQuizService`.
- Flow:
  1. Kiểm tra document `ready`.
  2. Gọi Gemini tạo câu hỏi.
  3. Lưu vào model `Quiz`.
  4. Trả quiz DTO.

## `POST /ai-generation/generate-summary`
- Controller: `generateSummary`.
- Service: `generateSummaryService`.
- Flow:
  1. Kiểm tra document tồn tại và `ready`.
  2. Gọi Gemini tạo summary theo ngôn ngữ yêu cầu.
  3. Trả chuỗi summary.

## `POST /ai-generation/chat`
- Controller: `chat`.
- Service: `chatService`.
- Flow:
  1. Kiểm tra document `ready`.
  2. Lấy context từ RAG service (`retrieveContext`).
  3. Nếu RAG unavailable, fallback tìm chunk theo từ khóa trong local text.
  4. Tìm/tạo `ChatHistory`.
  5. Gọi Gemini để trả lời theo context.
  6. Lưu 2 message (user + assistant) vào history.
  7. Trả answer + danh sách chunk liên quan.

## `POST /ai-generation/explain-concept`
- Controller: `explainConcept`.
- Service: `explainConceptService`.
- Flow:
  1. Kiểm tra document `ready`.
  2. Ưu tiên context từ RAG.
  3. Fallback local chunk search nếu cần.
  4. Gọi Gemini giải thích khái niệm.
  5. Trả explanation và chunk liên quan.

## `GET /ai-generation/chat-history`
- Controller: `getChatHistory`.
- Service: `getChatHistoryService`.
- Flow: tìm `ChatHistory` theo `userId + documentId` và trả messages.

## `DELETE /ai-generation/chat-history`
- Controller: `deleteChat`.
- Service: `deleteChatService`.
- Flow: xóa `ChatHistory` theo `userId + documentId`.

## Hàm/chức năng chính

- Controller:
  - `generateFlashcards`, `generateQuiz`, `generateSummary`
  - `chat`, `explainConcept`, `getChatHistory`, `deleteChat`
- Service:
  - `generateFlashcardsService`
  - `generateQuizService`
  - `generateSummaryService`
  - `chatService`
  - `explainConceptService`
  - `getChatHistoryService`
  - `deleteChatService`

## Model liên quan

- `Document`: nguồn nội dung.
- `Flashcard`: kết quả generate flashcards.
- `Quiz`: kết quả generate quiz.
- `ChatHistory`: lưu hội thoại theo user/document.

## Dependency ngoài

- `@google/genai` (Gemini)
- Integration tới RAG service ngoài (retrieve/ingest/delete)
- `mongoose`

## Ghi chú hiện trạng

- Có fallback logic khi RAG không sẵn sàng.
- Một số key field phản hồi có typo theo code hiện tại (giữ nguyên behavior hiện hữu).
