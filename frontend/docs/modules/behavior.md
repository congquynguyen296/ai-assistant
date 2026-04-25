# Behavior Code Guidelines & Best Practices

## Tổng quan (Overview)
Tài liệu này giải thích các nguyên tắc thiết kế, quy chuẩn viết code (coding convention), và kiến trúc tổng thể của thư mục `frontend/`. Không chỉ dừng ở việc "viết gì", tài liệu còn giải thích **"tại sao"** và hướng dẫn chi tiết cách để **khởi tạo một tính năng/module mới** trong tương lai. Nắm vững tài liệu này sẽ giúp Frontend của dự án luôn giữ được tiêu chuẩn **Type-Safe, Reusable, và Unidirectional Data Flow**.

---

## 1. Tổ chức Thư mục (Directory Structure)
Trước khi code, hãy hiểu rõ nơi đặt file:
- `src/components/`: Chứa các React component. 
  - `common/`: Các file dùng chung mọi nơi (`Button`, `Modal`, `PageHeader`, `LoadingSpinner`). Component ở đây **TUYỆT ĐỐI KHÔNG** gọi tới `axios` hay `service`.
  - `[tên_module]/`: Chứa các component đặc thù của tính năng (VD: `documents/`, `quizzes/`). Component ở đây có thể gọi context hoặc service nếu thực sự mang tính phức hợp và cần tự quản lý state hiển thị.
- `src/pages/`: Mỗi thư mục tương ứng với một Route. Gom nhóm các logic cấp cao nhất.
- `src/services/`: Tất cả API Call gọi bằng Axios đều đặt ở đây.
- `src/types/`: Gom nhóm các TypeScript `interface` và `type`.
- `src/context/`: Các context global (như `AuthContext`).

---

## 2. Component Design & Props Interface
**Quy tắc Vàng:** Một component luôn luôn phải định nghĩa rõ tham số thông qua `interface`.

```tsx
interface ExampleCardProps {
  id: string;
  title: string;
  onEdit: (id: string, newTitle: string) => void;
}

const ExampleCard = ({ id, title, onEdit }: ExampleCardProps) => {
  return (
    <div onClick={() => onEdit(id, title)}>
      {title}
    </div>
  );
}
```
**Tại sao?**
- Ép component Cha (Page) phải biết cần truyền gì xuống.
- Nâng cao tính **Reusability** (Sử dụng lại): `ExampleCard` không trực tiếp thực hiện logic "Edit" API, nó chỉ bắn tín hiệu cho component Cha quyết định.

---

## 3. Data Fetching & Error Handling Boundaries
Tất cả các lệnh gọi qua mạng phải được phân tách rõ ràng qua 3 trạng thái: `loading`, `data`, `error`.
- Dùng `try/catch` chuẩn. Error trả ra luôn phải có catch để show Toast (`toast.error`).
- **Render Blocking:** Luôn ép Layout render `<LoadingSpinner />` nếu `loading === true`, tránh người dùng thấy khung HTML trống rỗng trước khi Data đổ vào.
- Nếu không có data (Empty array), trả về component `<EmptyState />` hoặc một layout thông báo rỗng tương tự.

---

## 4. Hướng dẫn Từng bước: Thêm một Tính năng (Module) Mới
Giả sử bạn cần tạo một tính năng mới: **Ghi chú (Notes)**.

### Bước 1: Khai báo Type/Model
- Mở file `src/types/models.ts`. Khai báo interface cho model.
- Ví dụ: 
  ```typescript
  export interface Note {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
  }
  ```

### Bước 2: Tạo Service Layer
- Tạo file `src/services/noteService.ts`. Không viết axios trực tiếp trong giao diện!
- Thiết lập các endpoint:
  ```typescript
  import api from './api';
  import type { Note } from '../types/models';

  const noteService = {
    getAll: () => api.get('/notes'),
    create: (data: Partial<Note>) => api.post('/notes', data),
    delete: (id: string) => api.delete(`/notes/${id}`)
  };
  export default noteService;
  ```

### Bước 3: Build Presentation Component (Dummy UI)
- Tạo `src/components/notes/NoteCard.tsx` - File này chỉ nhận Props (`note`, `onDelete`) và trả ra HTML Card. Không fetch data ở đây. Tránh dùng `useEffect`.

### Bước 4: Tích hợp vào Page (Smart Component)
- Tạo `src/pages/Notes/NotesPage.tsx`. Đây là nơi khai báo State.
- Sử dụng `useState` cho data, `useEffect` đẻ kích hoạt fetch lần đầu.
  ```tsx
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => { /* ... try/catch -> noteService.getAll -> map list ... */ }
    fetch();
  }, []);
  ```
- Hiển thị List của `<NoteCard />` bằng hàm `notes.map()`.

### Bước 5: Đăng ký Router
- Khai báo Page mới trong `src/App.tsx` (hoặc `routes.tsx` nếu cấu trúc project có tách rời).
- Gắn với logic Guard (như `ProtectedRoute`) nếu màn hình yêu cầu phải login.

---

## 5. Tổng kết Hành vi chuẩn
- **Naming Convention:** PascalCase cho Component/Page (`QuizCard.tsx`), camelCase cho service và util (`authService.ts`).
- **Strict Null Checks:** Luôn kiểm tra `null` hoặc độ dài mảng `length > 0` trước khi `map()` render.
- **Tránh "Bóng" Style (Tailwind Abuse):** Hạn chế nhồi quá 20 class Tailwind vào dòng `className`. Nên tách riêng Object `styles` hoặc định nghĩa logic điều kiện `className={\`...\`}` mạch lạc.
- **Form validation:** Luôn dùng `trim()` cho input, `e.preventDefault()` trong `onSubmit` form.
