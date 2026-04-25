# Module Flashcards & Quizzes (Frontend)

## Tổng quan
Mô-đun tương tác cho người dùng sau khi học xong tài liệu. Hướng đến mục tiêu Gamification và Learning Retention (Giữ chân bộ nhớ). Cả Flashcards và Quizzes chia sẻ một luồng UX/UI tương đồng với nhau tại Frontend: Gọi AI để sinh ra Data -> Chơi/Làm kiểm tra thực tế.

## Danh sách Components / Pages
**Flashcards:**
- `src/pages/Flashcards/FlashcardListPage.tsx`: Thống kê các bộ sinh bằng AI (trên quy mô toàn App).
- `src/components/flashcards/FlashcardManager.tsx`: Danh sách khối thẻ bên trong chi tiết tài liệu (Document Sub-tab). Gộp xử lý API.
- `src/components/flashcards/Flashcard.tsx`: Core UI của thẻ. Bắt sự kiện Flip 3D (xoay lật), Keybinding (Space, Arrow keys) và logic đánh giá "Review" hay Nhấn "Star".

**Quizzes:**
- `src/pages/Quizzes/QuizzesPage.tsx` và `Manager.tsx`: Module cha quản lý danh sách. 
- `src/pages/Quizzes/QuizTakePage.tsx`: Màn hình đếm ngược (Session-based) cho phép người dùng chọn các option Multiple-choice và Submit kết quả.
- `src/pages/Quizzes/QuizResultPage.tsx` / `QuizReviewPage.tsx`: Graph Bar tính mốc điểm / Liệt kê câu đúng/sai kèm giải thích cặn kẽ vì sao họ sai.

## Luồng sinh học AI tự động
1. User nhấn button "Tạo Quiz / Flashcard". Màn hình sinh xuất hiện Modal nhập số lượng.
2. Form gọi `aiService.generateFlashcards` / `aiService.generateQuiz` với Input (bao gồm `documentId`).
3. Đóng Modal, màn hình có vòng Spin Loading báo cho User là Background Job đang chạy.
4. Refresh List -> Có khối giao diện mới cho bộ câu hỏi (Do backend Python đã nhả API xuống MongoDB).
