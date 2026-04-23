# Module Progress

## Tổng quan

Module `progress` cung cấp dashboard tổng hợp tiến độ học theo user đăng nhập.

## Danh sách file liên quan

- `src/routes/progressRoute.ts`
- `src/controllers/progressController.ts`
- `src/services/progressService.ts`
- `src/models/Document.ts`
- `src/models/Quiz.ts`
- `src/models/Flashcard.ts`
- `src/middlewares/auth.ts`

## API và flow xử lý

## `GET /progress/dashboard`
- Middleware: `protect`.
- Controller: `getDashboard`.
- Service: `getDashboardService`.
- Flow:
  1. Lấy `userId` từ request đã xác thực.
  2. Query DB để tính:
     - tổng tài liệu,
     - tổng quiz,
     - tổng flashcard.
  3. Lấy danh sách gần đây:
     - tài liệu gần đây,
     - quiz gần đây.
  4. Tính điểm trung bình quiz.
  5. Trả payload dashboard.

## Hàm/chức năng chính

- Controller:
  - `getDashboard`
- Service:
  - `getDashboardService`

## Model liên quan

- `Document`
- `Quiz`
- `Flashcard`

## Ghi chú hiện trạng

- Có trường thống kê được tạo theo logic hiện tại trong service, chưa thấy lưu persistent lịch sử streak bằng bảng riêng.
- Nếu cần dashboard phân tích sâu (theo tuần/tháng), hiện tại chưa có code thể hiện.
