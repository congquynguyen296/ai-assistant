# Feature: Study Rooms (Hoc nhom theo tai lieu)

## 1) Muc tieu
- Tao khong gian hoc nhom theo tung tai lieu.
- Chat chung + quiz doi khang de tang dong luc.

## 2) Doi tuong su dung
- Nhom ban hoc cung mon.
- Lop hoc / CLB muon on tap nhanh.

## 3) Pham vi
- Tao phong hoc theo document.
- Chat chung theo room.
- Quiz doi khang (real-time hoặc turn-based).

## 4) Gia tri mang lai
- Tang engagement va hieu qua hoc tap.
- Tao su khac biet so voi chat ca nhan.

## 5) User stories
- As a user, toi muon tao room cho document de hoc nhom.
- As a user, toi muon moi ban vao room.
- As a user, toi muon thi quiz cung nhom va xem bang diem.

## 6) Luong chinh
1. User tao room tu trang Document Detail.
2. User moi ban bang link / code.
3. Moi nguoi chat chung, truong phong co the bat dau quiz.
4. He thong cham diem, hien thi bang xep hang.

## 7) Du lieu dau vao / dau ra
### Input
- documentId
- hostUserId
- mode: "realtime" | "turn"

### Output
- roomId
- joinCode
- participants
- quizState

## 8) De xuat mo hinh du lieu
### StudyRoom
- id: string
- documentId: string
- hostUserId: string
- joinCode: string
- mode: string
- status: "open" | "in-progress" | "ended"
- participants: [{ userId, displayName, score }]

### RoomMessage
- roomId: string
- senderId: string
- content: string
- createdAt: datetime

### RoomQuiz
- roomId: string
- questions: []
- currentIndex: number
- answers: [{ userId, questionId, choice, isCorrect }]

## 9) API de xuat
### POST /api/rooms
Request:
{
  "documentId": "...",
  "mode": "realtime"
}
Response:
{
  "roomId": "...",
  "joinCode": "ABC123"
}

### POST /api/rooms/join
Request:
{
  "joinCode": "ABC123"
}

### GET /api/rooms/:roomId
Response:
{
  "roomId": "...",
  "documentId": "...",
  "participants": []
}

## 10) Real-time (Socket)
- room:join, room:leave
- room:message
- room:quiz:start
- room:quiz:answer
- room:quiz:scoreboard

## 11) UI/UX
- Trang Room: chat panel + quiz panel + scoreboard.
- Host controls: start/stop quiz, chon bo cau hoi.

## 12) Khong phai pham vi ban dau
- Ghi am buoi hoc.
- Whiteboard thong minh.
- Tu dong xep cap hoc doi.

## 13) KPI
- So room tao moi.
- So nguoi tham gia trung binh.
- Ty le hoan thanh quiz.

## 14) Rủi ro va giam thieu
- Chat spam: rate limit + mute.
- Gian lan quiz: time limit + randomize.

