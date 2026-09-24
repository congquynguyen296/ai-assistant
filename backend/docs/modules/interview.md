# Module: Interview (AI Mock Interview)

## 1. Overview
Module Interview quản lý toàn bộ quy trình của một buổi phỏng vấn giả lập với AI, từ việc khởi tạo cấu trúc (blueprint), tiến hành hỏi đáp (chat), cho đến việc kết thúc và xuất báo cáo đánh giá.

## 2. Models & Entities
Các model chính tham gia vào module này:
- **InterviewSession**: Lưu trữ trạng thái của một phiên phỏng vấn (mode, status, documentIds, blueprint, messages, report, questionsAsked, maxQuestions).
- **InterviewTopic**: Lưu trữ các chủ đề (Trending Skills) phục vụ cho mode `knowledge`, thống kê `usageCount` để gợi ý.
- **InterviewQuestion**: Ngân hàng lưu trữ lại các câu hỏi AI đã sinh ra (để tái sử dụng, phân tích hoặc review sau này).

## 3. Services & Logic Khởi tạo

### 3.1. `createInterviewSessionService`
- Nhận input: `userId, mode, documentIds, topicName, customText, level`.
- **Bước 1 (Tài liệu)**: Map `documentIds` để lấy ra CV text hoặc JD text.
- **Bước 2 (Topic)**: Nếu mode là `knowledge`, kiểm tra hoặc tạo mới `InterviewTopic` và tăng `usageCount`.
- **Bước 3 (Blueprint Generation)**: Gọi `generateInterviewBlueprint` (qua AI). Truyền vào level (Intern/Fresher, Junior/Middle, Senior) để AI sinh ra context và danh sách `focusAreas` phù hợp. AI sẽ trả về JSON (được validate bằng Zod schema) bao gồm title, focusAreas, maxQuestions, và câu hỏi mồi `initialQuestion`.
- **Bước 4 (Create Session)**: Khởi tạo record `InterviewSession` với tin nhắn đầu tiên (role assistant) là `initialQuestion`.

### 3.2. `chatInterviewService`
- **Bước 1 (Validation)**: Kiểm tra session có tồn tại và đang `IN_PROGRESS`. Kiểm tra giới hạn câu hỏi (`questionsAsked >= maxQuestions`).
- **Bước 2 (Context)**: Lấy lịch sử chat gần nhất (4 tin nhắn) + tin nhắn mới của user.
- **Bước 3 (AI Generation)**: AI đọc `blueprint` và lịch sử chat để: (1) Đánh giá câu trả lời trước, (2) Tạo câu hỏi tiếp theo tập trung vào kỹ năng thực tế, bám sát `focusAreas`.
- **Bước 4 (Atomic Update)**: Push cả tin nhắn user và tin nhắn assistant vào mảng `messages` của DB, đồng thời tăng `questionsAsked`. 
- **Bước 5 (Lưu trữ)**: Lưu câu hỏi AI tạo ra vào ngân hàng `InterviewQuestion`.

### 3.3. `finishInterviewService`
- Lấy toàn bộ lịch sử `messages` (không bị cắt bớt).
- Gọi AI (hàm `generateInterviewReport`) để tổng hợp: overallScore, feedback, technical/soft skills breakdown, strengths, weaknesses.
- Chuyển status thành `COMPLETED` và lưu report.

## 4. DTO & Types
- **Mode Enum**: `job`, `knowledge`, `cv_only`, `jd_only`.
- **Level**: `Intern/Fresher`, `Junior/Middle`, `Senior`.
- Đảm bảo validate strict input qua Zod (`SetupInterviewRequestSchema`, `ChatInterviewRequestSchema`).

## 5. Clean-up & Background Tasks
- Các session bị bỏ dở (`IN_PROGRESS`) qua 24h tự động được service đánh dấu thành `ABANDONED` mỗi khi có query get list. 
