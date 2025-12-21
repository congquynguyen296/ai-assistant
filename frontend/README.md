# AI Assistant Frontend

Giao diện người dùng cho ứng dụng AI Assistant, được xây dựng bằng React và Vite, tập trung vào trải nghiệm học tập thông minh với Flashcards và Quizzes.

## 🛠 Công nghệ sử dụng

- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Routing:** React Router DOM v7
- **State Management:** React Context API
- **Notifications:** Sonner
- **Markdown Rendering:** React Markdown

## 📋 Yêu cầu hệ thống

- Node.js (v18 trở lên)
- Trình duyệt web hiện đại

## 🚀 Cài đặt

1. **Di chuyển vào thư mục frontend:**
   ```bash
   cd frontend
   ```

2. **Cài đặt dependencies:**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường:**
   Tạo file `.env` tại thư mục gốc `frontend/` (nếu chưa có) để cấu hình các biến môi trường.
   
   *Lưu ý: Hiện tại `BASE_URL` API đang được cấu hình trong `src/utils/apiPath.js`. Bạn có thể cần cập nhật file này nếu backend chạy ở port khác.*

   ```env
   # Sepay Payment Configuration (QR Code generation)
   VITE_SEPAY_ACC_VIA_QR=your_sepay_account_id
   ```

4. **Chạy ứng dụng:**

   - **Môi trường Development:**
     ```bash
     npm run dev
     ```
     Ứng dụng sẽ chạy tại `http://localhost:5173`

   - **Build cho Production:**
     ```bash
     npm run build
     ```
   
   - **Preview bản Build:**
     ```bash
     npm run preview
     ```

## 📂 Cấu trúc thư mục

```
frontend/
├── src/
│   ├── assets/         # Images, fonts, static files
│   ├── components/     # Reusable UI components
│   │   ├── ai/         # AI related components
│   │   ├── auth/       # Login/Register forms
│   │   ├── common/     # Buttons, Modals, Loaders...
│   │   ├── documents/  # PDF Viewer, Document list
│   │   ├── flashcards/ # Flashcard study interface
│   │   ├── layouts/    # App shell (Sidebar, Header)
│   │   ├── payment/    # Payment modals
│   │   └── quizzes/    # Quiz interface
│   ├── context/        # AuthContext, ThemeContext...
│   ├── pages/          # Page components (Route targets)
│   ├── services/       # API service calls (Axios wrappers)
│   ├── utils/          # Helper functions, Constants
│   ├── App.jsx         # Main App component
│   └── main.jsx        # Entry point
├── index.html
├── vite.config.js
└── package.json
```

## ✨ Tính năng chính

- **Authentication:** Đăng nhập/Đăng ký, Google Login.
- **Document Management:** Upload và xem tài liệu PDF.
- **AI Features:**
  - Tự động tạo Flashcards từ tài liệu.
  - Tự động tạo Quiz trắc nghiệm.
  - Tóm tắt tài liệu.
  - Chat với tài liệu (AI Assistant).
- **Study Modes:**
  - Ôn tập Flashcards (Lật thẻ).
  - Làm bài kiểm tra (Quiz) và xem kết quả.
- **Payment:** Tích hợp hiển thị mã QR thanh toán (Sepay).

## 🎨 Styling

Dự án sử dụng Tailwind CSS v4. Các cấu hình style nằm trong `src/index.css` và các class utility trực tiếp trong components.

## 🔧 Scripts

- `npm run dev`: Khởi động dev server.
- `npm run build`: Build production bundle.
- `npm run lint`: Kiểm tra lỗi code với ESLint.
- `npm run preview`: Xem trước bản build production.
