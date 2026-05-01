# Feature: Spaced Repetition Learning & Notification System

## 1. Tổng quan

Feature này bao gồm 3 phần chính:

1. **Manual Flashcard Creation**: Cho phép user tạo flashcard thủ công, không chỉ qua documents
2. **Quiz Reminder Notifications**: Thông báo định kỳ về các bài quiz chưa làm (cronjob sáng hàng ngày)
3. **Spaced Repetition Notifications**: Thông báo nhắc lại flashcard dựa trên thuật toán spaced repetition

## 2. Phần 1: Manual Flashcard Creation

### 2.1 Mô tả

Hiện tại, flashcards chỉ được sinh ra từ documents. Feature này cho phép:
- User tạo bộ flashcard độc lập, không liên kết document
- User thêm/sửa/xóa cards thủ công
- Quản lý chung với flashcards từ document

### 2.2 Thay đổi Data Model

**File**: `src/models/Flashcard.ts`

```typescript
// Cập nhật schema
{
  userId: ObjectId,
  documentId: ObjectId | null,  // Có thể null cho manual flashcards
  title: String,
  
  // NEW: Phân loại nguồn
  source: {
    type: String,
    enum: ["document", "manual"],
    default: "document"
  },
  
  // NEW: Thẻ/category cho manual flashcards
  tags: [String],  // VD: ["toán", "hình học"]
  
  description: String,  // Mô tả tùy chọn
  
  cards: [{
    question: String,
    answer: String,
    difficulty: enum(easy|medium|hard),
    lastReviewed: Date | null,
    reviewCount: Number,
    isStarred: Boolean,
    
    // NEW: Spaced repetition tracking
    nextReviewDate: Date | null,  // Khi nào nhắc lại
    interval: Number,  // Ngày (1, 3, 7, 14, 30...)
    easeFactor: Number,  // SM-2 algorithm (2.5 default)
  }]
}
```

### 2.3 API Endpoints

#### 2.3.1 Tạo bộ flashcard mới (manual)
```
POST /flashcards/manual
Headers: Authorization: Bearer <token>

Body:
{
  title: "Toán đại số",
  description?: "Các công thức quan trọng",
  tags?: ["toán", "đại số"]
}

Response:
{
  flashcardId: ObjectId,
  title: String,
  source: "manual",
  cards: [],
  createdAt: Date
}
```

#### 2.3.2 Thêm card vào bộ flashcard (manual)
```
POST /flashcards/:flashcardId/cards
Headers: Authorization: Bearer <token>

Body:
{
  question: String,
  answer: String,
  difficulty?: "easy" | "medium" | "hard"  (default: medium)
}

Response:
{
  cardId: ObjectId,
  question: String,
  answer: String,
  difficulty: String
}
```

#### 2.3.3 Sửa card
```
PUT /flashcards/:flashcardId/cards/:cardId
Headers: Authorization: Bearer <token>

Body:
{
  question?: String,
  answer?: String,
  difficulty?: String
}
```

#### 2.3.4 Xóa card
```
DELETE /flashcards/:flashcardId/cards/:cardId
Headers: Authorization: Bearer <token>
```

### 2.4 Cấu trúc Service

**File**: `src/services/flashcardService.ts` (mở rộng)

```typescript
// Thêm các hàm mới:
export async function createManualFlashcardService(
  userId: string,
  data: { title, description?, tags? }
): Promise<FlashcardDocument>

export async function addCardToFlashcardService(
  userId: string,
  flashcardId: string,
  cardData: { question, answer, difficulty? }
): Promise<Card>

export async function updateCardService(
  userId: string,
  flashcardId: string,
  cardId: string,
  cardData: Partial<Card>
): Promise<Card>

export async function deleteCardService(
  userId: string,
  flashcardId: string,
  cardId: string
): Promise<{ success: boolean }>

export async function listManualFlashcardsService(
  userId: string,
  filters?: { tags?: string[] }
): Promise<FlashcardDocument[]>
```

## 3. Phần 2: Quiz Reminder Notifications

### 3.1 Mô tả

Mỗi sáng lúc 8h (hoặc giờ được cấu hình), hệ thống sẽ:
- Tìm tất cả quiz chưa hoàn thành của user
- Gửi email/notification nhắc nhở

### 3.2 Cron Job Setup

**File**: `src/services/notificationSchedulerService.ts` (NEW)

```typescript
import cron from "node-cron";
import { sendQuizReminderNotifications } from "./notificationService";

/**
 * Chạy lúc 8:00 sáng mỗi ngày (timezone: UTC+7 - Việt Nam)
 * Cron pattern: "0 8 * * *"
 */
export function initQuizReminderScheduler() {
  cron.schedule("0 1 * * *", async () => {  // 1h UTC = 8h UTC+7
    console.log("[CRON] Running quiz reminder notifications...");
    try {
      await sendQuizReminderNotifications();
    } catch (error) {
      console.error("[CRON] Error sending quiz reminders:", error);
    }
  });
}
```

**File**: `server.ts` (update)

```typescript
import { initQuizReminderScheduler, initSpacedRepetitionScheduler } from "@/services/notificationSchedulerService";

// Sau khi kết nối DB
await initQuizReminderScheduler();
await initSpacedRepetitionScheduler();  // Phần 3
```

### 3.3 Service Logic

**File**: `src/services/notificationService.ts` (NEW)

```typescript
export async function sendQuizReminderNotifications() {
  // 1. Tìm tất cả user
  const users = await User.find();
  
  for (const user of users) {
    // 2. Tìm quiz chưa hoàn thành
    const incompleteQuizzes = await Quiz.find({
      userId: user._id,
      completedAt: null
    }).populate("documentId");
    
    if (incompleteQuizzes.length === 0) continue;
    
    // 3. Gửi email notification
    await mailService.sendQuizReminder({
      userEmail: user.email,
      userName: user.name,
      quizzes: incompleteQuizzes,
      quizCount: incompleteQuizzes.length
    });
    
    // 4. Lưu log (optional)
    console.log(`[NOTIFICATION] Quiz reminder sent to ${user.email}`);
  }
}
```

### 3.4 Email Template

**File**: `src/templates/emails/quizReminderTemplate.ts` (update)

```typescript
export function generateQuizReminderHTML(data: {
  userName: string;
  quizzes: QuizDocument[];
}): string {
  const quizList = data.quizzes
    .map(q => `<li>${q.title} (${q.totalQuestions} câu)</li>`)
    .join("");
    
  return `
    <h2>Hey ${data.userName}! 🎯</h2>
    <p>Bạn có <strong>${data.quizzes.length}</strong> bài quiz chưa làm:</p>
    <ul>${quizList}</ul>
    <p><a href="${process.env.FRONTEND_URL}/dashboard">Bắt đầu làm bài quiz ngay</a></p>
  `;
}
```

## 4. Phần 3: Spaced Repetition Notifications

### 4.1 Mô tả

Dựa trên thuật toán SM-2 (Leitner system), hệ thống sẽ:
- Tính toán ngày nhắc lại tối ưu cho mỗi card
- Gửi notification khi đến ngày review
- Cập nhật interval/easeFactor dựa trên kết quả review

### 4.2 Spaced Repetition Algorithm (SM-2)

```
Công thức cơ bản:
- Lần 1 review: 1 ngày sau
- Lần 2 review: 3 ngày sau
- Lần 3+ review: interval = previousInterval * easeFactor

easeFactor = max(1.3, EF - 0.2 + (5 - quality) * 0.1)
  - quality: 0-5 (user self-grade hoặc auto-calculate)
  - quality = 5: perfect recall
  - quality = 3: acceptable
  - quality = 0: complete blackout
```

### 4.3 Thay đổi Flow Review Flashcard

**File**: `src/services/flashcardService.ts` (update)

```typescript
export async function reviewFlashcardService(
  userId: string,
  cardId: string,
  quality: 0 | 1 | 2 | 3 | 4 | 5  // User grades: 0=forgot, 5=perfect
): Promise<Card> {
  // 1. Tìm flashcard set + card
  const flashcardSet = await Flashcard.findOne({
    userId,
    "cards._id": cardId
  });
  
  const card = flashcardSet.cards.id(cardId);
  
  // 2. Tính SM-2 algorithm
  const { interval, easeFactor, nextReviewDate } = calculateSM2(
    card.lastReviewed,
    card.interval,
    card.easeFactor,
    quality
  );
  
  // 3. Cập nhật card
  card.lastReviewed = new Date();
  card.reviewCount += 1;
  card.interval = interval;
  card.easeFactor = easeFactor;
  card.nextReviewDate = nextReviewDate;
  
  // 4. Save
  await flashcardSet.save();
  
  return card;
}

function calculateSM2(
  lastReviewed: Date | null,
  currentInterval: number,
  currentEaseFactor: number,
  quality: number
): { interval: number; easeFactor: number; nextReviewDate: Date } {
  let interval: number;
  let easeFactor = Math.max(
    1.3,
    currentEaseFactor - 0.2 + (5 - quality) * 0.1
  );
  
  if (!lastReviewed) {
    // Lần đầu review
    interval = 1;
  } else if (quality < 3) {
    // Quên, reset about 1 day
    interval = 1;
    easeFactor = 1.3;
  } else {
    // Nhớ được
    interval = Math.ceil(currentInterval * easeFactor);
  }
  
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);
  
  return { interval, easeFactor, nextReviewDate };
}
```

### 4.4 Cron Job: Spaced Repetition Reminder

**File**: `src/services/notificationSchedulerService.ts` (thêm)

```typescript
export function initSpacedRepetitionScheduler() {
  // Chạy 2 lần/ngày: 8h sáng + 3h chiều
  cron.schedule("0 1,8 * * *", async () => {  // UTC times
    console.log("[CRON] Running spaced repetition reminders...");
    try {
      await sendSpacedRepetitionNotifications();
    } catch (error) {
      console.error("[CRON] Error sending SR reminders:", error);
    }
  });
}
```

**File**: `src/services/notificationService.ts` (thêm)

```typescript
export async function sendSpacedRepetitionNotifications() {
  // 1. Tìm cards cần review (nextReviewDate <= today)
  const cardsToReview = await Flashcard.aggregate([
    {
      $unwind: "$cards"
    },
    {
      $match: {
        "cards.nextReviewDate": {
          $lte: new Date()
        }
      }
    },
    {
      $group: {
        _id: "$userId",
        cardCount: { $sum: 1 },
        flashcardIds: { $push: "$_id" }
      }
    }
  ]);
  
  for (const group of cardsToReview) {
    const user = await User.findById(group._id);
    
    // 2. Gửi notification
    await mailService.sendSpacedRepetitionReminder({
      userEmail: user.email,
      userName: user.name,
      cardCount: group.cardCount
    });
    
    // 3. Optional: Gửi qua WebSocket nếu user online
    // io.to(user._id.toString()).emit("sr-reminder", { cardCount });
  }
}
```

### 4.5 Email Template

**File**: `src/templates/emails/notificationTemplate.ts` (update)

```typescript
export function generateSpacedRepetitionReminderHTML(data: {
  userName: string;
  cardCount: number;
}): string {
  return `
    <h2>Đã đến lúc ôn tập rồi! 📚</h2>
    <p>Bạn có <strong>${data.cardCount}</strong> flashcard cần ôn lại hôm nay.</p>
    <p>Học tập đều đặn sẽ giúp bạn nhớ lâu hơn!</p>
    <a href="${process.env.FRONTEND_URL}/flashcards">Bắt đầu ôn tập</a>
  `;
}
```

## 5. Infrastructure & Dependencies

### 5.1 Package cần thêm

```json
{
  "node-cron": "^3.0.2",
  "date-fns": "^2.30.0"
}
```

### 5.2 Environment Variables

```env
# Notification settings
NOTIFICATION_ENABLED=true
QUIZ_REMINDER_TIME=01:00  # UTC time (8h UTC+7)
SR_REMINDER_TIMES=01:00,08:00  # UTC times (2 times/day)
NOTIFICATION_METHOD=email  # or websocket hoặc both

# Mail configuration (nếu chưa có)
MAIL_FROM=noreply@myapp.com
MAIL_SERVICE=gmail  # hoặc dịch vụ khác
MAIL_USER=your-email@gmail.com
MAIL_PASS=app-password
```

### 5.3 Cấu trúc thư mục mới

```
src/
├── services/
│   ├── notificationSchedulerService.ts  (NEW)
│   ├── notificationService.ts           (NEW)
│   └── flashcardService.ts              (UPDATE)
├── templates/
│   └── emails/
│       ├── quizReminderTemplate.ts      (NEW/UPDATE)
│       └── notificationTemplate.ts      (UPDATE)
└── utils/
    └── spacedRepetitionUtil.ts          (NEW - SM-2 logic)
```

## 6. Implementation Priority & Timeline

### Phase 1: Foundation (Week 1)
- [ ] Update Flashcard model (add source, tags, SR fields)
- [ ] Create manual flashcard API endpoints
- [ ] Update flashcardService với manual card functions

### Phase 2: Quiz Reminders (Week 1-2)
- [ ] Install node-cron
- [ ] Create notificationSchedulerService
- [ ] Implement sendQuizReminderNotifications
- [ ] Update email templates

### Phase 3: Spaced Repetition (Week 2-3)
- [ ] Create spacedRepetitionUtil.ts (SM-2 algorithm)
- [ ] Update reviewFlashcard service
- [ ] Implement sendSpacedRepetitionNotifications
- [ ] Add nextReviewDate calculation in review flow

### Phase 4: Testing & Polish (Week 3-4)
- [ ] Unit tests for SM-2 algorithm
- [ ] Integration tests for cron jobs
- [ ] Frontend integration (show next review date)
- [ ] Performance optimization (batch queries)

## 7. Database Indexing (Performance)

```typescript
// Flashcard model
flashcardSchema.index({ userId: 1, source: 1 });
flashcardSchema.index({ userId: 1, "cards.nextReviewDate": 1 });

// For efficient cron queries
flashcardSchema.index({ 
  "cards.nextReviewDate": 1 
}, { sparse: true });
```

## 8. Frontend Integration Points

### 8.1 Notifications
- WebSocket listener cho real-time SR reminders
- Toast/banner khi có quiz chưa làm

### 8.2 Flashcard UI Updates
- Show source badge (Manual / From Document)
- Display tags/categories
- Show "Next review: [date]" dưới mỗi card

### 8.3 Review Flow
- After review: Ask user quality rating (0-5)
- Show predicted next review date
- Gamification: Show streak/consistency stats

## 9. Monitoring & Logging

### 9.1 Log cron execution

```typescript
// notificationSchedulerService.ts
const logger = createLogger("CronScheduler");

cron.schedule(..., async () => {
  const startTime = Date.now();
  logger.info("Starting quiz reminder notifications");
  
  try {
    const result = await sendQuizReminderNotifications();
    logger.info(`Completed in ${Date.now() - startTime}ms`, { result });
  } catch (error) {
    logger.error("Quiz reminder failed", error);
  }
});
```

### 9.2 Metrics to track
- Number of notifications sent
- Failed delivery rate
- User engagement (click-through rate)
- SM-2 algorithm effectiveness

## 10. Considerations & Best Practices

1. **Timezone handling**: Lưu ý timezone của user, không hardcode UTC+7
2. **Email throttling**: Không gửi quá nhiều email/user trong 1 ngày
3. **Opt-out option**: Cho user disable notifications
4. **Testing in dev**: Dùng giả time hoặc test cron với interval ngắn
5. **Graceful degradation**: Nếu cron job fail, không crash server
6. **Rate limiting**: Nếu dùng external mail service, handle rate limits

## 11. Success Metrics

- [ ] 80%+ users who opt-in engage with quiz reminders
- [ ] Average 30% improvement in spaced repetition completion
- [ ] Cron job latency < 5 seconds cho 1000 users
- [ ] Email delivery success rate > 95%

---

**Status**: Feature Design Complete  
**Last Updated**: 2026-05-01  
**Owner**: Backend Team
