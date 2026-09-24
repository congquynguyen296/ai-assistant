# Tính năng: AI Mock Interview

## 1. Giới thiệu tổng quan
Tính năng "AI Mock Interview" cho phép người dùng luyện tập phỏng vấn với trí tuệ nhân tạo. Thay vì các câu hỏi cứng nhắc, hệ thống sẽ đóng vai một Senior Technical Interviewer, phân tích CV/JD hoặc chủ đề kỹ năng người dùng chọn để đưa ra luồng câu hỏi linh hoạt, xoáy sâu vào kỹ năng thực tế.

## 2. Các chế độ phỏng vấn (Interview Modes)
Người dùng có 4 lựa chọn tương ứng với các mục đích luyện tập khác nhau:

1. **Knowledge Focus (`knowledge`)**:
   - Mục đích: Luyện tập chuyên sâu về một bộ kỹ năng cụ thể (Ví dụ: ReactJS, Node.js, System Design).
   - Điểm nhấn: Chọn mức độ Seniority (Intern/Middle/Senior). AI sẽ hỏi thẳng vào việc ứng dụng kỹ năng này trong thực tế như thế nào, thay vì các câu hỏi học thuật định nghĩa rườm rà.

2. **JD Focus (`jd_only`)**:
   - Mục đích: Luyện tập bám sát yêu cầu từ một Job Description (JD).
   - Điểm nhấn: Người dùng chọn/dán JD vào. AI phân tích JD để tạo ra các Focus Areas (những kỹ năng cốt lõi cần đánh giá) và liên tục hỏi để xác minh người dùng có đạt yêu cầu của Job đó hay không.

3. **CV Deep Dive (`cv_only`)**:
   - Mục đích: Luyện cách trả lời mượt mà những kinh nghiệm đã viết trong CV.
   - Điểm nhấn: AI sẽ đọc lướt CV và chọn ra các dự án hoặc công nghệ nổi bật nhất, sau đó yêu cầu người dùng giải thích các quyết định kỹ thuật, cách tối ưu, hay vượt qua khó khăn.

4. **Job Interview (`job`)**:
   - Mục đích: Mô phỏng bài kiểm tra toàn diện, thực tế nhất. Kết hợp cả CV và JD.
   - Điểm nhấn: AI đối chiếu kinh nghiệm trong CV với yêu cầu trong JD để tìm ra gap (khoảng cách kỹ năng) hoặc đào sâu vào các điểm match.

## 3. Trải nghiệm người dùng (Flow)
- **Bước 1: Setup**: Người dùng chọn Chế độ, cung cấp Tài liệu (chọn sẵn hoặc dán text), và chọn cấp độ (Level).
- **Bước 2: Blueprint**: Hệ thống sinh ra một "Blueprint" (Kế hoạch phỏng vấn) liệt kê các kỹ năng trọng tâm sẽ được hỏi và số lượng câu hỏi tối đa.
- **Bước 3: Chat/Phỏng vấn**: Người dùng được đưa vào phòng phỏng vấn. AI sẽ đặt câu hỏi, người dùng có thể suy nghĩ và nhập câu trả lời.
- **Bước 4: Xem lại & Báo cáo**: Sau khi hoàn thành đủ số câu hỏi hoặc khi người dùng chủ động nộp bài, hệ thống sẽ khóa khung nhập liệu, cho phép người dùng xem lại toàn bộ log chat và chuyển sang trang "Xem Báo Cáo" để nhận số điểm tổng quan, nhận xét ưu/nhược điểm và đánh giá chi tiết từng kỹ năng.

## 4. Giá trị cốt lõi
Tính năng được thiết kế không phải để "làm khó" người học bằng lý thuyết học thuật, mà để cải thiện sự tự tin, kỹ năng phản xạ thực tế và cung cấp một lộ trình cải thiện (feedback) vô cùng cụ thể, giúp người dùng sẵn sàng cho các buổi phỏng vấn thật.
