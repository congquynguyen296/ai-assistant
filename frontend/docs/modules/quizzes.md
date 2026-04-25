# Module Quizzes (Frontend) - Chi tiết Luồng hoạt động

## Tổng quan
Quản lý luồng câu hỏi trắc nghiệm đồng bộ và logic Timer để giả lập các kì kiểm tra tính giờ. UI được thiết kế có Step-by-Step wizard (Mục lục Menu câu hỏi nhỏ bên dưới) giúp user tracking trạng thái hoàn thành.

## Detail Engine & State Tracking

### 1. Payload AI Pipeline (Tạo Quiz)
- Nằm chung Component `QuizManager`. Khi user chọn Tùy chỉnh (vd: `count: 15`), gọi hàm `aiService.generateQuiz(docId, numQuizzes)`.
- Backend tự bóc tách text Document thành Chunk sau đó prompt AI để sinh ra JSON. Quá trình này **thường rất lâu (~10-20s)** nên State `generating` = `true` là cực kỳ quan trọng ngăn User bấm gen 2 3 lần. Nút bám trạng thái UI "Spinner Đang tạo...".

### 2. Take Quiz & Timer Engine (`QuizTakePage`)
- **Khởi động Timer:** Hàm `setInterval` sinh ra lưu tại hook `useRef(null)`.
  ```ts
  setTimeLeft((prev) => {
    if (prev <= 1) { clearInterval(...); finishQuiz(); return 0;}
    ...
  })
  ```
- Việc lưu tại Hook Ref khác với Variable bình thường vì nếu re-render liên tục (Mỗi giây 1 lần), biến bị ghi đè gây gián đoạn.
- Trạng thái các câu trả lời đang Chọn hiện lưu tạm dưới cấu trúc Dictionary/Record `Record<number, string>` (ánh xạ `[index Câu Hỏi]: Đáp án lựa chọn`). Tức là Index Array Câu Hỏi đóng vai trò khoá.
  
### 3. Exit Guard (Bảo vệ thoát ra)
- Nếu User đang làm mà bỗng bấm nhầm qua Menu/Trang khác hoặc ấn Back của Browser, sẽ có modal Confirm bật lên cản lại: "Kết quả của bạn chưa lưu. Bạn có chắc muốn Exit không?". Mặc dù hiện tại nó chỉ bind nút `Thoát` nội bộ nhưng Behavior mong muốn là hủy Interval trước khi rời đi để tránh Memory Leak rò rỉ bộ nhớ Timer.

### 4. Bóc tách logic Review vs Submit
- Review Stage (Tiền Submit): Tại `QuizReviewPage`, Mảng `Answers` sẽ được parse từ Dict Array thành mảng chuẩn API backend cần nhận: `[{questionIndex: 0, selectedAnswer: "A"},...]`.
- Nếu bỏ trống một key nào trong map lúc review, Backend sẽ tính là Xếp loại Sai.
- Submit API Action (`quizService.submitQuiz(quizId, formattedAnswers)`) trả về Kết quả chứa Array `results` kèm `isCorrect` và `explanation` từ gốc Database.
- Dữ liệu `QuizResultsPayload` sẽ được bọc và đẩy qua state Router xuống cho `QuizResultPage` để nó bóc xuất thay vì phải load lại Loading Spinner API tốn công. Trang KQ sẽ fetch lại nếu user tải lại trang làm rỗng RAM Router.
