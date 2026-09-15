# Thuật toán Spaced Repetition (SRS)

Tài liệu này mô tả chi tiết logic hoạt động của thuật toán Spaced Repetition (SRS) được áp dụng trong ứng dụng Flashcard. Thuật toán là sự kết hợp giữa logic SM-2 cải tiến (fix-delta) với mô hình Graduation 1-bước nhằm đảm bảo hệ thống "Clean & Solid" khi hoạt động trong môi trường Web App.

## 1. Database Schema
Schema của FlashcardCard được cập nhật để hỗ trợ tracking tiến độ học tập:
- `status`: `"new" | "learning" | "review"` (mặc định là "new")
- `nextReviewDate`: Thời điểm ôn tập tiếp theo (Date)
- `interval`: Khoảng thời gian giãn cách hiện tại (ngày)
- `easeFactor`: Chỉ số dễ nhớ (mặc định: 2.5)
- Thêm model `FlashcardReviewLog` để lưu lịch sử (grade, interval cũ/mới, easeFactor cũ/mới, thời gian ôn tập).

## 2. Logic Tính toán (Graduation 1-bước)
Bỏ qua bước trung gian (multi-step), thẻ mới học sẽ ngay lập tức được cấp `interval` lớn và chuyển sang `review` nếu học viên chọn Khó/Tốt/Dễ.

### 2.1. Thẻ đang ở trạng thái `new` hoặc `learning` (Chưa graduate)
- **Grade 1 (Quên)**: `status = 'learning'`, `interval = 0`, `delta ease = -0.2`
  - Thẻ được đưa vào cuối mảng ôn tập của Session hiện tại (In-session Queue) để học lại.
- **Grade 2 (Khó)**: `status = 'review'` (Graduate), `interval = 1`, `delta ease = -0.15`
- **Grade 3 (Tốt)**: `status = 'review'` (Graduate), `interval = 3`, `delta ease = 0`
- **Grade 4 (Dễ)**: `status = 'review'` (Graduate), `interval = 5`, `delta ease = +0.15`

### 2.2. Thẻ đang ở trạng thái `review` (Đã graduate)
- **Grade 1 (Quên)**: `status = 'learning'` (Rớt hạng), `interval = 0`, `repetitionCount = 0`, `delta ease = -0.2`
  - Thẻ được đưa vào cuối mảng ôn tập của Session hiện tại để học lại.
- **Grade 2 (Khó)**: `interval = max(oldInterval + 1, round(oldInterval * 1.2))`, `delta ease = -0.15`
- **Grade 3 (Tốt)**: `interval = max(oldInterval + 1, round(oldInterval * oldEaseFactor))`, `delta ease = 0`
- **Grade 4 (Dễ)**: `interval = max(oldInterval + 1, round(oldInterval * oldEaseFactor * 1.3))`, `delta ease = +0.15`

*Lưu ý: Sau khi có kết quả, `easeFactor` sẽ được chặn dưới (Math.max(1.3, easeFactor)) để tránh thẻ bị kẹt ở mức quá thấp. `nextReviewDate` sẽ được tính = `now + (interval * 24h)`.*

## 3. API Query (Sạch sẽ & Chính xác)
Query lấy Session được thiết kế tối giản và loại bỏ lỗi sót thẻ:
- API `getReviewSessionService` yêu cầu Header `x-timezone-offset` để tính `endOfDay` chính xác theo timezone của Client (User).
- **Điều kiện Query (Lọc tại server & Backend Memory)**:
  `status === "new" OR nextReviewDate <= endOfDay`
  *(Thẻ "learning" sau khi nhấn 1(Quên) sẽ có nextReviewDate = now nên tự động lọt vào điều kiện `< endOfDay`)*.

## 4. Giao diện UX (In-session Queue)
- Component không sử dụng state management tool phức tạp (như Redux/Zustand) để tối ưu hiệu suất theo yêu cầu.
- Nếu User bấm `Quên (1)`, Frontend tự động push bản sao của thẻ vào cuối mảng để học lại ngay trong session đó mà không cần gọi thêm API GET.
