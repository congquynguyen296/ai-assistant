# Module AI Actions & Chat (Frontend)

## Tổng quan
Khu vực giao tiếp trực tiếp với tính năng RAG Engine bên dưới. Giao diện trò chuyện tương tự ChatGPT - truyền ngữ cảnh của tài liệu vào Assistant và đưa ra giải pháp giải thích chi tiết.

## Danh sách Components
- `src/components/ai/AIActions.tsx`: Sub-tab nằm trong giao diện xem file. Đóng vai trò là Form input nhanh chứa các Quick Actions (VD như prompt có sẵn "Giải thích cụm từ xyz").
- `src/components/messages/ChatInterface.tsx`: Trải nghiệm khung Chatbot nhúng. Rendering luồng hội thoại Real-time giả lập (Streaming UI hoặc Timeout response delay array) với Assistant.
- `src/components/common/MarkdownRenderer.tsx` / `MarkdownRerender.tsx`: Thành phần Render Text AI trả về. Vì AI trả Text theo định dạng MarkDown thô ráp (Plain text with hashes), File Component này có nhiệm vụ dịch nó thành HTML Nodes cho React.

## Cấu trúc Hội Thoại Trực tiếp
UI phân chia message trái/phải dựa vào logic `msg.role === 'user'`.
Trường Array lưu trữ Context Chat History tại Component Cha. Mỗi lần User gõ phím và Submit -> Đẩy tin nhắn của mình vào Local Array -> Gọi Services Backend -> Trả tin nhắn AI -> Đẩy nối tiếp vào Array và Cập nhật SetState cho React trượt Component xuống bằng `messagesEndRef`.
