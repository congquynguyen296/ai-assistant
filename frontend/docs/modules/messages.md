# Module Messages & AI Chat (Frontend) - Giải Phẫu Luồng 

## Tổng quan
Module phụ trách luồng nói chuyện (Chatbot) gõ theo phiên RAG dựa trên tài liệu cá nhân. Hệ thống này được xây dựng trên cấu trúc Fetch and Render Loop chứ không dùng WebSocket (chủ đích giảm tải và phức tạp Server), tận dụng Context và Parser Markdown cực mạnh ở mảng Response Text.

## Luồng Hoạt Động (Conversational Flow)

### 1. Quản lý Phiên bằng State Array
- Lịch sử Chat được gói vào State `history`: `[ { role: 'user', content: 'hello' }, { role: 'assistant', content: 'Hi' } ]`.
- Khi init load trang (`getChatHistory`), Component tải mảng DB về gán. UI render từng Bubble chat dựa vào thuộc tính xác định `isUser = msg.role === "user"`. Trái là AI (Bot Logo), Phải là Client (Avatar Image).

### 2. Kỹ Thuật Optimistic Typing (Send Flow)
1. **Khóa Spam**: Khi nhấn Enter/Submit, `message` (Draft input binding state) sẽ lập tức bị clear rỗng `setMessage("")`, chặn submit input form lần nữa (`disabled={!message.trim()}`).
2. **Optimistic Append:** Array history ngay lập tức được Push phần tử giả của User gõ vào để hiện bong bóng Bubble chat tức thì mà Không chờ Response từ Bot. Điều này đánh lừa cảm giác tốc độ realtime.
3. **Spinner Block:** Kích hoạt State `isLoading = true`. Đoạn cuối mảng History lập tức ghim cái thẻ Bubble bong bóng có hiệu ứng CSS "3 viên bi chạy sóng nhấp nháy" mô phỏng AI "Đang gõ...".
4. **Network Phase:** Hook gửi POST req (`aiService.chat(documentId, content)`). Endpoint này chờ RAG Backend Vector Query trả về kết quả Answer. Bị Blocked I/O chỗ này lâu nhất.
5. **Receive Phase:** HTTP Resolve -> Xóa cờ loading (Mất spinner) -> Append nội dung JSON Response vào mảng -> Render HTML cho Bot Bubble.

### 3. Rendering Engine (Trình dịch Markdown)
- Text Bot LLM sinh ra là Markdown chuẩn. Tuy nhiên dùng `.innerHTML` bình thường sẽ vỡ Text nặng nề và dễ bị XSS (Cross Site Scripting). Vì Client không thể tin tưởng Response Bot hoàn toàn.
- Dự án sử dụng Pipeline qua `<MarkdownRenderer />` bọc lại thư viện `react-markdown`.
- **Custom Components Map:** Từng thẻ HTML nhỏ nhất (p, h1, ul, code, a, table) sinh ra từ bộ lọc Markdown đều được Replace bằng Component Tailwind CSS riêng của dự án thay thế thẻ thuần, giúp Đồng nhất Theme sắc nền.
- Trình Parse bọc chặn XSS nội tại, không run các chèn `<script>`.
- Hiểu các tag Table và Code Blocks rải màu theme Dracula (`SyntaxHighlighter`).

### 4. Smart Auto-Scrolling (Cuộn tự động thông minh)
- React ref `messageEndRef` cắm rễ vào một `<div />` vô hình rỗng nằm dưới cùng của danh sách Render Map Array History.
- Bất kì khi nào Biến mảng `history` bị Trigger thay đổi (có tin mới) -> Hook UseEffect đá `.scrollIntoView()` trượt cuộn chuột cái rẹt xuống tận đáy. Giúp User luôn theo dõi mắt vào chữ mới nhất. Chống lại căn bệnh nhảy trang của CSS lưới.
