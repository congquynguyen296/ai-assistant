# Module Quiz

## Tổng quan

Module `quizzes` quản lý vòng đời bài quiz:
- lấy danh sách quiz,
- lấy chi tiết quiz,
- nộp đáp án,
- xem kết quả chi tiết,
- xóa quiz.

## Danh sách file liên quan

- `src/routes/quizRoutes.ts`
- `src/controllers/quizController.ts`
- `src/services/quizService.ts`
- `src/models/Quiz.ts`
- `src/utils/dtoMapper.ts`
- `src/dtos/quiz/quiz.dto.ts`
- `src/dtos/quiz/submit-quiz.request.dto.ts`
- `src/middlewares/auth.ts`

## API và flow xử lý

## `GET /quizzes`
- Middleware: `protect`.
- Controller: `getAllQuizzes`.
- Service: `getAllQuizzesService`.
- Flow:
  1. Đếm tổng quiz của user.
  2. Query theo phân trang (`page`, `size`).
  3. Populate document info.
  4. Trả danh sách + metadata pagination.

## `GET /quizzes/:documentId`
- Middleware: `protect`.
- Controller: `getQuizzes`.
- Service: `getQuizzesService`.
- Flow:
  1. Query quiz theo `userId + documentId`.
  2. Populate document info.
  3. Trả danh sách quiz.

## `GET /quizzes/quiz/:quizId`
- Middleware: `protect`.
- Controller: `getQuizById`.
- Service: `getQuizByIdService`.
- Flow:
  1. Query quiz theo `userId + quizId`.
  2. Populate document info.
  3. Trả chi tiết quiz.

Lưu ý hiện trạng:
- Do route động `/:documentId` cũng tồn tại, cần test runtime để xác nhận tuyệt đối thứ tự bắt route trong mọi case.

## `POST /quizzes/:quizId/submit`
- Middleware: `protect`.
- Controller: `submitQuiz`.
- Service: `submitQuizService`.
- Flow:
  1. Tìm quiz theo owner.
  2. Duyệt từng đáp án user gửi.
  3. So khớp đáp án đúng để chấm điểm.
  4. Lưu `userAnswer`, `score`, `completedAt`.
  5. Trả kết quả chấm điểm.

## `GET /quizzes/:quizId/results`
- Middleware: `protect`.
- Controller: `getQuizResults`.
- Service: `getQuizResultsService`.
- Flow:
  1. Tìm quiz theo owner.
  2. Kiểm tra quiz đã hoàn thành.
  3. Tạo kết quả chi tiết từng câu:
     - câu hỏi, đáp án đúng, đáp án chọn, trạng thái đúng/sai.
  4. Trả payload kết quả.

## `DELETE /quizzes/:quizId`
- Middleware: `protect`.
- Controller: `deleteQuiz`.
- Service: `deleteQuizService`.
- Flow:
  1. Tìm quiz theo owner.
  2. Xóa quiz.
  3. Trả thông báo thành công.

## Hàm/chức năng chính

- Controller:
  - `getAllQuizzes`
  - `getQuizzes`
  - `getQuizById`
  - `submitQuiz`
  - `getQuizResults`
  - `deleteQuiz`
- Service:
  - `getAllQuizzesService`
  - `getQuizzesService`
  - `getQuizByIdService`
  - `submitQuizService`
  - `getQuizResultsService`
  - `deleteQuizService`

## Model liên quan: `Quiz`

Nhóm field chính:
- `userId`
- `documentId`
- `title`
- `questions[]`:
  - `question`
  - `options[]`
  - `correctAnswer`
  - `explanation`
  - `difficulty`
- `userAnswer[]`
- `score`
- `totalQuestions`
- `completedAt`

## Ghi chú hiện trạng

- Không có cơ chế re-grade background, mọi chấm điểm xử lý đồng bộ trong request submit.
- Không có cache Redis riêng cho module quiz.
