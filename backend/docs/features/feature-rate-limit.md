# Tính năng Rate Limiting

## 1. Tổng quan
Hệ thống sử dụng chiến lược **Token Bucket** (thông qua thư viện `express-rate-limit` kết hợp `rate-limit-redis`) để giới hạn lưu lượng truy cập (rate limit) trên toàn cục. 
Việc lưu trữ đếm (counter) được thực hiện trên **Redis**, giúp cho trạng thái rate limit được đồng bộ chính xác khi hệ thống scale lên nhiều server/tiến trình (Node.js cluster).

Chúng ta áp dụng 2 mức giới hạn khác nhau:
1. **Chặn theo IP (authLimiter):** Dành cho các endpoint nhạy cảm với Brute-force hoặc Spam (như Đăng nhập, Đăng ký, Gửi OTP).
2. **Chặn theo User ID (apiLimiter):** Dành cho các endpoint tốn nhiều tài nguyên backend (như xử lý File, gọi API AI/Gemini/RAG).

## 2. Cài đặt chi tiết

### 2.1 Middleware `rateLimiter.ts`
Vị trí file: `src/middlewares/rateLimiter.ts`

- Khởi tạo `RedisStore` sử dụng `redisClient` có sẵn của hệ thống.
- Cấu hình trả về chuẩn IETF `RateLimit-*` headers để client có thể theo dõi.

#### A. `authLimiter`
- **Mục tiêu:** Các route `/auth/login`, `/auth/register`, `/auth/forgot-password`, v.v.
- **Key Generator:** Lấy theo địa chỉ IP của Client (`req.ip`).
- **Giới hạn:** Tối đa 5 requests mỗi 15 phút trên mỗi IP.
- **Mục đích:** Chống Brute-force mật khẩu và chống bot spam SMS/Email tốn kém.

#### B. `apiLimiter`
- **Mục tiêu:** Các route xử lý dữ liệu nặng sau khi đã đăng nhập (Upload Documents, AI Generation).
- **Key Generator:** Lấy theo `User ID` (`req.user._id`). Nếu request chưa có user (ví dụ endpoint public nào đó tái sử dụng lại), fallback về IP.
- **Giới hạn:** Tối đa 100 requests mỗi giờ trên mỗi User.
- **Mục đích:** Quản lý Quota sử dụng API (ví dụ ngăn 1 user dùng bot bào mòn giới hạn OpenAI/Gemini của hệ thống), tránh tình trạng NAT Sharing (nhiều user chung 1 mạng công ty dùng chung IP bị block nhầm).

### 3. Sơ đồ luồng (Flow)

```text
Client -> Route (Express Router)
  -> Rate Limit Middleware (authLimiter / apiLimiter)
       -> Redis: INCR <key>
       -> Trả về lỗi 429 (Too Many Requests) nếu quá giới hạn
  -> Middleware khác (auth, validator)
  -> Controller -> Service
```

### 4. Kết hợp với Cloudflare (Khuyên dùng cho Production)
Mặc dù hệ thống đã có Rate Limit bằng Express + Redis (rất tốt cho việc kiểm soát logic nghiệp vụ và quota user), nhưng để phòng chống **DDoS Layer 7**, khuyên dùng thiết lập **Cloudflare Proxy** phía trước Backend:

1. **Cloudflare (Vòng ngoài):** Sẽ làm nhiệm vụ chặn thô theo IP, cản các request từ botnet, giúp giảm tải CPU/RAM cho server Node.js.
2. **Express + Redis (Vòng trong):** Sẽ làm nhiệm vụ chặn tinh theo User ID, kiểm soát chính xác mức độ sử dụng tính năng của người dùng hợp lệ.
