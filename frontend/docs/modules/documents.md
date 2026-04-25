# Module Documents (Frontend) - Chi tiết Luồng hoạt động

## Tổng quan
Quản lý File tài liệu và đóng vai trò làm Controller trung tâm của mọi tính năng RAG. Các tính năng như tạo Quizzes, Flashcards hay RAG Chatbot đều xoay quanh một `documentId` cụ thể do module này phân phối xuống.

## Luồng API & Cấu trúc Dữ liệu
- **Model Document (`src/types/models.ts`)**: Yêu cầu các field nền là `_id`, `title`, `fileName`, `fileUrl` (lưu bucket S3 hoặc local), `mimeType` (dùng để xác định dạng file - docx hay pdf), tiến trình upload `processingStatus`.

## Quy trình làm việc chi tiết (Detailed Flow)

### 1. File Selection & Upload (Upload Modal Flow)
- Giao diện: Component `UploadModal` bắt sự kiện `onDrop` hoặc `onChange` picker.
- Trạng thái nâng cao: `isDragging` (boolean) đổi CSS UI khi người dùng kéo Drag chuột xuyên việt vùng browser.
- **Data Boundary:** File phải được giới hạn `< 20MB`, check định dạng qua `file.type`. Nếu không hợp lệ lập tức chèn chặn và đẩy Toast Warning.
- **Multipart Encode:** Frontend khởi tạo `FormData()`, append `file` và `title`, `description`. Axios sẽ lo việc tự thiết lập boundary Header thay cho `application/json`.
- Khi server push complete, Frontend Re-fetch list tài liệu để Update UI (Refresh State) hoặc tự push thủ công vào mảng Array State.

### 2. Danh sách (Document List & Retrieval)
- API endpoint: `GET /documents`
- Hiển thị danh sách thẻ `DocumentCard`. Từng Card đi liền mảng event callback mở Config Dropdown (Đổi tên / Xóa bản ghi).
- Hành động **Search**: Frontend thực thi Filter Array trực tiếp trên mảng `documents` locally thông qua `string.toLowerCase().includes(search)`. Tránh Call API gây tải gánh Server.

### 3. Detail Document Routing & View Tabbing
- Route `/documents/:documentId` dùng Hooks `useParams` đọc DocumentId hiện tại.
- Layout sử dụng mô hình Tab Navigations chứa State String: `[activeTab, setActiveTab] = useState("document" | "flashcard" | "quiz")`. Mặc định ở tab đầu tiên.
- Khi active tab = "document", render Node `<FileViewer />`.
- **FileViewer Behavior:** Đối mặt với nhiều format, nếu là PDF, sẽ sử dụng thẻ nhúng `<iframe type="application/pdf">`. Nếu là Word/Docs sẽ nối chuỗi qua Google Docs Viewer public proxy hặc Office Viewer để có thể View nội dung mà không cần render code chuyên biệt trên React.
- Mọi component render Flashcards hay Quiz ở dưới đều nhận Props là `documentId`. Như vậy, nếu ID lỗi hoặc Loading, Component con sẽ tự gián đoạn, ngăn bug liên hoàn.
