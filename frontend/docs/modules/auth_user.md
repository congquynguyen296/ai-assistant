# Module Auth & User (Frontend)

## Tổng quan
Quản lý luồng tương tác người dùng khi bắt đầu truy cập ứng dụng (Login, Register, OTP Xác minh, Google/Facebook Auth) và cập nhật thông tin cá nhân.
Toàn bộ trạng thái phiên làm việc (Session) của người dùng được phân phối bởi `AuthContext.tsx`.

## Danh sách Components / Pages
- `src/context/AuthContext.tsx`: Nơi Root, theo dõi Token và Session.
- `src/pages/Auth/LoginPage.tsx`: Form đăng nhập Email, tích hợp SSO (Google/Facebook).
- `src/pages/Auth/RegisterPage.tsx`: Màn hình Đăng ký, Form validations client-side.
- `src/pages/Profile/ProfilePage.tsx`: Dashboard người dùng cập nhật ảnh đại diện, đổi mật khẩu.
- `src/components/auth/ProtectedRoute.tsx`: Middleware component, chặn người dùng cố tình vào các route cần đăng nhập.

## Luồng xử lý giao diện
### 1. Luồng Auth (Đăng Nhập)
- User nhập Email/Pass. 
- `authService.loginClient()` request tới Backend.
- Token mới nhận được sẽ ném cho hàm `login()` bên trong AuthContext (gắn lên LocalStorage). Lúc này `<ProtectedRoute>` đánh giá `isAuthenticate = true` và cho phép User xem các Module Document.

### 2. Luồng Redirect SSO (Google/Facebook)
- `AuthCallbackPage.tsx` bắt Token từ chuỗi Query Parameter qua React Router DOM hooks. Ném xuống Context và chuyển hướng sang `/dashboard`.

## Liên kết liên quan
Dependency ngoài cung cấp: React Router DOM, Vite (`import.meta.env`).
