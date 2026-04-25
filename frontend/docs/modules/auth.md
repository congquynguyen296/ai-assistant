# Module Authentication (Frontend) - Quản Trị Trạng Thái Sâu

## Tổng quan
Quản trị Auth là chốt chặn quan trọng nhất (Gateway Protection) chống các truy cập trái phép. Hiểu cơ chế phân luồng Token và Lifecycle của Authentication Provider Context giúp dễ dàng handle Authorization cho toàn bộ phần diện mạo người dùng sau màn hình Đăng Nhập.

## Vòng đời uỷ quyền (Context Lifecycle)

Tại `AuthContext.tsx`, `<AuthProvider>` ôm sờ mó toàn bộ React Node App tại file `main.tsx`.

### Khởi động (Init App Booting)
1. Context mount lần đầu tiên, đọc `localStorage.getItem("token")` và `localStorage.getItem("user")`.
2. Do lưu JWT localStorage dễ bay màu nếu Refresh (F5), bọc toàn vẹn State `isAuthenticated = token ? true : false`.
3. Trong `useEffect` init Mount, Context gửi Background Check Request gọi `authService.getProfile()` cùng JWT vừa bóc để thẩm định xem Token này còn Sống (Live) hay hết hạn (Expired/Revoked).
4. Nếu API Response Auth báo lỗi 401 Unauthorized -> Token mục nát bị Server cấm, Context Tự Chặn đứng, hủy Auth, gọi hàm `logout()` cục bộ, gỡ bỏ token, đẩy thẳng Client về `LoginPage` và xoá sạch RAM state.

### Quản trị Đăng Nhập (Login Mechanism)
1. Login Component gõ vào Form. Nếu BE trả kết quả 200 OK + cấp Token + Thông tin User -> Báo "Đăng nhập thành công".
2. Bấm gọi `login(user, token)` được Pull từ Context qua hook `useAuth()`.
3. Hàm Login lưu vào Data Memory (SetState React báo hiệu re-render layout toàn trang Navbar) VÀ Storage Persistent `localStorage.setItem`. Navbar chuyển đổi State nút "Đăng nhập" -> Avatar User Name Dropdown Menu tức thì.
4. Điều hướng Routing Browser Redirect vô `/dashboard`.

### Trình Cản Interceptor (Đính Header Bảo Mật Xuyên Suốt)
Tất cả các API (Quizzes, Flashcards, AI RAG) **KHÔNG ĐƯỢC** phép gọi JWT lẻ tẻ hoặc rải rác từng File Component. Đó là thảm hoạ Scale-Up (Scale dự án lớn lên).
- Thay vào đó, API Wrapper Root của mảng gọi mạng `src/services/api.ts` nhúng móng vuốt Request Interceptors từ `axios`.
- Nó nghe lén mọi cái Fetch sắp rời Client: `api.interceptors.request.use((config) => { ... })`.
- Móc trộm `token` từ local, đính phong bì Header `Authorization: Bearer <T>`. Sau đó thả Request bay lên đường ngầm Internet. Mọi lời gọi đều Auto Auth-Bound. Gọn nhẹ, an tâm.

### Vùng Private Routes (Lá chắn định tuyến)
- Các Router được bọc qua component `<ProtectedRoute>` bằng `react-router-dom` tại luồng App Router.
- `<ProtectedRoute>` móc ruột qua `useAuth()`. Check `isAuthenticated`.
- Nếu vào `/messages` mà biến bằng `false` -> Chắn cửa đá qua `<Navigate to="/login" replace />`. Tính năng "replace" cắn nát history của Browser chặn thằng dở hơi bấm nút Back trên Chrome hòng quay lén lại trang `/messages` mà nó ăn mỳ 1s trước đó.
