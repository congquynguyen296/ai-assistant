# Module Auth

## Tổng quan

Module `auth` xử lý:
- đăng ký tài khoản bằng email + OTP,
- xác nhận email,
- đăng nhập email/password,
- đăng nhập Google,
- lấy/cập nhật hồ sơ,
- đổi mật khẩu.

## Danh sách file liên quan

- `src/routes/authRoutes.ts`
- `src/controllers/authController.ts`
- `src/services/authService.ts`
- `src/models/User.ts`
- `src/services/mailService.ts`
- `src/services/redisService.ts`
- `src/config/googleConfig.ts`
- `src/middlewares/auth.ts`
- `src/middlewares/errorHandle.ts`
- `src/dtos/auth/*.ts`
- `src/utils/dtoMapper.ts`

## API và flow xử lý

## `POST /auth/register`
- Validate: `registerValidation` (express-validator).
- Controller: `register`.
- Service: `registerService`.
- Flow:
  1. Validate request body.
  2. Check email đã tồn tại qua `User`.
  3. Tạo OTP và lưu vào Redis key theo email.
  4. Gửi OTP qua mail service.
  5. Trả kết quả yêu cầu xác nhận email.

## `POST /auth/confirm-email`
- Controller: `confirmEmail`.
- Service: `confirmEmailService`.
- Flow:
  1. Đọc OTP session trong Redis.
  2. So khớp OTP.
  3. Tạo user mới trong DB.
  4. Xóa OTP session Redis.
  5. Gửi mail welcome.
  6. Sinh JWT và trả thông tin đăng nhập.

## `POST /auth/resend-otp`
- Controller: `resendOTP`.
- Service: `resendOTPService`.
- Flow:
  1. Lấy session OTP hiện có theo email.
  2. Sinh OTP mới và cập nhật Redis.
  3. Gửi lại OTP qua email.

## `POST /auth/login`
- Validate: `loginValidation`.
- Controller: `login`.
- Service: `loginService`.
- Flow:
  1. Tìm user theo email (kèm password).
  2. So sánh mật khẩu (`bcrypt` qua method model).
  3. Sinh JWT.
  4. Trả user public + token.

## `POST /auth/google-login`
- Controller: `googleLogin`.
- Service: `googleLoginService`.
- Flow:
  1. Exchange/verify Google token bằng `google-auth-library`.
  2. Tìm user theo email Google.
  3. Nếu chưa có thì tạo user mới.
  4. Sinh JWT và trả response login.

## `GET /auth/profile`
- Middleware: `protect`.
- Controller: `getProfile`.
- Service: `getProfileService`.
- Flow:
  1. `protect` verify JWT, nạp user vào request.
  2. Service đọc user từ DB (ẩn password).
  3. Trả profile DTO.

## `PUT /auth/profile`
- Middleware: `protect`.
- Controller: `updateProfile`.
- Service: `updateProfileService`.
- Flow:
  1. Lấy `userId` từ request đã xác thực.
  2. Update các field profile được cho phép.
  3. Lưu DB và trả thông tin mới.

## `PUT /auth/change-password`
- Middleware: `protect`.
- Controller: `changePassword`.
- Service: `changePasswordService`.
- Flow:
  1. Tìm user kèm password.
  2. Verify mật khẩu hiện tại.
  3. Gán mật khẩu mới.
  4. Lưu user (hook model hash lại password).
  5. Trả thông báo thành công.

## Hàm/chức năng chính

- Controller:
  - `register`, `confirmEmail`, `resendOTP`
  - `login`, `googleLogin`
  - `getProfile`, `updateProfile`, `changePassword`
- Service:
  - `registerService`, `confirmEmailService`, `resendOTPService`
  - `loginService`, `googleLoginService`
  - `getProfileService`, `updateProfileService`, `changePasswordService`

## Model liên quan: `User`

Các trường chính (theo code model/types):
- `username`
- `email`
- `password` (ẩn mặc định khi query public)
- `profileImage`
- các trường metadata (`createdAt`, `updatedAt`...)

Logic kèm theo:
- Hash password trước khi lưu.
- Hàm so sánh password cho login/change-password.
- Hàm sinh JWT theo user id.

## Dependency ngoài

- `jsonwebtoken`
- `bcrypt`
- `google-auth-library`
- `redis`
- `nodemailer`
- `mongoose`

## Ghi chú hiện trạng

- Format lỗi/success giữa các endpoint có một vài chỗ chưa hoàn toàn đồng nhất.
- Chưa có cơ chế rate-limit OTP trong module này (theo code hiện tại chưa thấy rõ).
