# Module Flashcard

## Tổng quan

Module `flashcards` quản lý bộ flashcard đã sinh:
- lấy danh sách theo user hoặc theo document,
- ghi nhận review một card,
- gắn/bỏ sao card,
- xóa bộ flashcard.

## Danh sách file liên quan

- `src/routes/flashcardRoutes.ts`
- `src/controllers/flashcardController.ts`
- `src/services/flashcardService.ts`
- `src/models/Flashcard.ts`
- `src/utils/dtoMapper.ts`
- `src/dtos/flashcards/flashcard.response.dto.ts`
- `src/middlewares/auth.ts`

## API và flow xử lý

## `GET /flashcards`
- Middleware: `protect`.
- Controller: `getFlashcards`.
- Service: `getFlashcardsService`.
- Flow:
  1. Query `Flashcard` theo `userId`.
  2. Populate `documentId`.
  3. Sắp xếp mới nhất.
  4. Map DTO danh sách trả về.

## `GET /flashcards/:documentId`
- Middleware: `protect`.
- Controller: `getAllFlashcardSets`.
- Service: `getAllFlashcardSetsService`.
- Flow:
  1. Query `Flashcard` theo `userId + documentId`.
  2. Populate document info.
  3. Map DTO.

## `POST /flashcards/:cardId/review`
- Middleware: `protect`.
- Controller: `reviewFlashcard`.
- Service: `reviewFlashcardService`.
- Flow:
  1. Tìm flashcard set chứa card theo `cards._id`.
  2. Xác định index card.
  3. Tăng `reviewCount`, cập nhật `lastReviewed`.
  4. Save set và trả kết quả.

## `PUT /flashcards/:cardId/star`
- Middleware: `protect`.
- Controller: `toggleStarFlashcard`.
- Service: `toggleStarFlashcardService`.
- Flow:
  1. Tìm set chứa card.
  2. Toggle `isStarred`.
  3. Save set và trả kết quả.

## `DELETE /flashcards/:flashcardId`
- Middleware: `protect`.
- Controller: `deleteFlashcardSet`.
- Service: `deleteFlashcardSetService`.
- Flow:
  1. Verify ownership set.
  2. Xóa set.
  3. Trả thông báo thành công.

## Hàm/chức năng chính

- Controller:
  - `getFlashcards`
  - `getAllFlashcardSets`
  - `reviewFlashcard`
  - `toggleStarFlashcard`
  - `deleteFlashcardSet`
- Service:
  - `getFlashcardsService`
  - `getAllFlashcardSetsService`
  - `reviewFlashcardService`
  - `toggleStarFlashcardService`
  - `deleteFlashcardSetService`

## Model liên quan: `Flashcard`

Nhóm field chính:
- `userId`
- `documentId`
- `title`
- `cards[]`:
  - `question`
  - `answer`
  - `difficulty`
  - `lastReviewed`
  - `reviewCount`
  - `isStarred`

## Ghi chú hiện trạng

- Module không có cache riêng, truy cập trực tiếp MongoDB.
- Không có soft-delete; xóa là thao tác trực tiếp trên DB.
