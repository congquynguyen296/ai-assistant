# Module Flashcards (Frontend) - Cơ Chế Chi Tiết

## Tổng quan
Flashcard đòi hỏi UI tương tác tốt (Interactive UI). Tính năng này đan chéo các khái niệm DOM manipulation, key bindings và memory cache cục bộ thay vì chỉ là thao tác gọi lệnh API nhàm chán. Mọi logic tương tác đều gói trong `FlashcardManager` và Component `Flashcard.tsx`.

## Animations & State Flipping Flow

### 1. The Flipping Engine (Trái tim của Flashcard)
- Lật thẻ ghi nhớ hoạt động dựa trên một nguyên lý CSS:
  + Box cha sử dụng `perspective: 1000px` để xác định lưới không gian 3 chiều.
  + Box mang thẻ dùng `transform-style: preserve-3d` và transition `transform 0.5s ease-out`.
  + Gắn class có `rotateY(180deg)` một cách động (Dynamic CSS Class) dựa trên State boolean `isFlipped`.
  + Thẻ có 2 mặt Div (Front và Back), mỗi mặt được chặn `backface-visibility: hidden`. Mặt Back bị xoay ngược gốc `180deg` mặc định.
- Hành vi UX: Bất cứ lúc nào user ấn vào chữ "Xem kết quả" (Nút lật thẻ) hoặc nhấn dải chữ, `setIsFlipped((prev) => !prev)` kích hoạt -> Thẻ xoay đẹp mắt. Khi chuyển thẻ (Next, Prev) thì bắt buộc set `isFlipped = false` để trả thẻ về Mặt Trước (Front) của câu mới, tránh thẻ mới bị hiện mặt lưng đáp án bị lỗ hổng UX.

### 2. Navigation State Tracking
- Bộ não điều hướng: `currentCardIndex`. Nó trượt từ `0` đến `cards.length - 1`.
- Pagination thanh gạt bên dưới cho biết mức độ đã chạy. Ngay khi index thay đổi, Component Trigger React Re-render để nạp Text Nội dung mặt Trước mặt Sau của Câu thẻ tương ứng vào `div` của Component `Flashcard`.
- **Keyboard Shortcuts (Keybindings):** `useEffect` window Event Listener gắn cho các nút Lỗi `ArrowRight` (Tiếp theo), `ArrowLeft` (Trở về), và `Spacebar / Enter` (Lật thẻ lật lại). Tăng cực hạn UX và độ trôi chảy khi học của User mà ko cần dùng chuột.

### 3. Đánh Dấu Sao (Star Marking Priority)
- Tính năng lưu bookmark thẻ yêu thích, hoặc thẻ khó học.
- Bấm vào nút Sao góc bên trên thẻ, Component truyền một Callback Props lên Cha -> Cha (`FlashcardManager`) xử lý Network Call `flashcardService.toggleStarFlashcard(...)`.
- Khi server Reponse 200 OK, update State Cục bộ `cards[currentIndex].isStarred = true` bằng Shallow Copy hoặc mảng mới thay vì Fetch lại nguyên API 1 tệp Flashcards 300 thẻ làm giảm Performance kinh hoàng. 
- Concept trên gọi là **"Optimistic UI Updates"** hoặc **"Pessimistic Caching"** (Đợi BE 200 rồi mới thay đổi biến ảo phía Client, hoặc thay ảo phía Client trước rồi mới ping BE đồng bộ dần). Dự án dùng cơ thế đợi 200 BE.
