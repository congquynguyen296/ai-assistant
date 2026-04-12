# AI Assistant - Backend API

Backend API cho ứng dụng AI Assistant, cung cấp các tính năng quản lý tài liệu, tạo flashcard/quiz tự động bằng AI, và hệ thống xác thực người dùng.

## 🛠 Công nghệ sử dụng

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (với Mongoose ODM)
- **Caching:** Redis
- **AI Integration:**
  - Google Gemini (Flashcard generation)
  - Groq SDK (Text summarization)
- **Authentication:** JWT, Google OAuth 2.0
- **File Storage:** Cloudinary
- **Email Service:** Resend
- **PDF Processing:** pdf-parse

## 📋 Yêu cầu hệ thống

- Node.js (v18 trở lên)
- MongoDB (Local hoặc Atlas)
- Redis (Local hoặc Cloud)

## 🚀 Cài đặt

1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường:**
   Tạo file `.env` tại thư mục gốc `backend/` và điền các thông tin sau:

   ```env
   # Server Configuration
   PORT=8000
   
   # Database
   MONGODB_URI=mongodb://localhost:27017 # Hoặc MongoDB Atlas URI
   DATABASE_NAME=ai_assistant_db

   # Redis Configuration
   REDIS_URL=redis://localhost:6379 # Hoặc để trống và dùng REDIS_HOST/PORT
   # REDIS_HOST=localhost
   # REDIS_PORT=6379

   # Authentication
   JWT_SECRET=your_super_secret_jwt_key
   
   # Google OAuth
   GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
   GOOGLE_OAUTH_CLIENT_SECRET=your_google_client_secret
   GOOGLE_OAUTH_REDIRECT=http://localhost:5173 # URL frontend redirect

   # Cloudinary (File Storage)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # AI Services
   GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_api_key

   # Email Service (Resend)
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Chạy ứng dụng:**

   - **Môi trường Development (với Nodemon):**
     ```bash
     npm run dev
     ```
   - **Môi trường Production:**
     ```bash
     npm start
     ```

## 📂 Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/         # Cấu hình DB, Redis, Cloudinary...
│   ├── controllers/    # Xử lý logic request/response
│   ├── middlewares/    # Auth, Error handling, Upload...
│   ├── models/         # Mongoose Schemas
│   ├── routes/         # Định nghĩa API routes
│   ├── services/       # Business logic (AI, Mail, DB operations)
│   ├── templates/      # Email templates
│   └── utils/          # Các hàm tiện ích (Parsers, AI helpers)
├── server.js           # Entry point
└── package.json
```

## 🔌 API Endpoints chính

- **Auth:** `/api/v1/auth` (Register, Login, Google Login, Profile)
- **Documents:** `/api/v1/documents` (Upload, List, Delete)
- **AI Generation:** `/api/v1/ai-generation` (Flashcards, Quiz, Summary, Chat)
- **Flashcards:** `/api/v1/flashcards` (Manage sets, Review)
- **Quizzes:** `/api/v1/quizzes` (Manage quizzes, Submit, Results)
- **Progress:** `/api/v1/progress` (Track learning progress)

## 📝 Notes

- Đảm bảo Redis server đang chạy trước khi start backend.
- API sử dụng `multer` để xử lý upload file PDF trước khi đẩy lên Cloudinary.
