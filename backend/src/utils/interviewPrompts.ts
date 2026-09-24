import { z } from 'zod';

// ==========================================
// SCHEMAS
// ==========================================

export const BlueprintResponseSchema = z.object({
  title: z.string(),
  focusAreas: z.array(z.string()),
  recommendedMaxQuestions: z.number(),
  initialQuestion: z.string(),
});
export type InterviewBlueprint = z.infer<typeof BlueprintResponseSchema>;

export const NextQuestionSchema = z.object({
  answerQuality: z.enum(['strong', 'partial', 'weak']),
  feedbackToPreviousAnswer: z.string().nullable(),
  question: z.string(),
});
export type NextQuestion = z.infer<typeof NextQuestionSchema>;

export const ReportSchema = z.object({
  overallScore: z.number(),
  overallFeedback: z.string(),
  technicalSkills: z.array(
    z.object({
      skillName: z.string(),
      score: z.number(),
      feedback: z.string(),
    })
  ),
  softSkills: z.array(
    z.object({
      skillName: z.string(),
      score: z.number(),
      feedback: z.string(),
    })
  ),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
});
export type InterviewReport = z.infer<typeof ReportSchema>;

// ==========================================
// UTILS & GUIDES
// ==========================================

export const LEVEL_GUIDE: Record<string, { expect: string; forbidden: string; areas: string; questions: string }> = {
  'intern/fresher': {
    expect: 'Nắm khái niệm cơ bản, biết ví dụ đơn giản, có thể chưa có kinh nghiệm thực tế. Đánh giá tiềm năng học hỏi và tư duy, không đánh giá kinh nghiệm production.',
    forbidden: 'Hệ thống phân tán, cluster/sharding, failover, atomicity/race condition ở mức implementation (Lua, transaction), tối ưu ở scale lớn, monitoring/reconciliation, so sánh trade-off nhiều tầng.',
    areas: '3 đến 4',
    questions: '5 đến 6',
  },
  'junior/middle': {
    expect: 'Biết áp dụng công cụ/framework vào bài toán thực tế đơn giản, hiểu trade-off cơ bản.',
    forbidden: 'Thiết kế hệ thống quy mô lớn, cluster/failover, tuning chuyên sâu.',
    areas: '3 đến 5',
    questions: '6 đến 8',
  },
  'senior': {
    expect: 'Thiết kế hệ thống phân tán, cân nhắc scale/độ tin cậy/vận hành, dẫn dắt quyết định kỹ thuật.',
    forbidden: '(không giới hạn)',
    areas: '4 đến 5',
    questions: '8 đến 10',
  },
};

export const getLevelGuide = (level: string) => {
  const normalizedLevel = level.trim().toLowerCase();
  if (normalizedLevel.includes('intern') || normalizedLevel.includes('fresher')) return LEVEL_GUIDE['intern/fresher'];
  if (normalizedLevel.includes('junior') || normalizedLevel.includes('middle')) return LEVEL_GUIDE['junior/middle'];
  if (normalizedLevel.includes('senior')) return LEVEL_GUIDE['senior'];
  return LEVEL_GUIDE['junior/middle'];
};

export function computeInterviewState(
  answeredCount: number,
  maxQuestions: number,
  focusAreas: string[]
) {
  const questionNumber = answeredCount + 1;
  const areaIndex = (n: number) =>
    Math.min(Math.floor(((n - 1) * focusAreas.length) / maxQuestions), focusAreas.length - 1);

  const focusIndex = areaIndex(questionNumber);
  const prevFocusIndex = areaIndex(questionNumber - 1 || 1);

  return {
    questionNumber,
    isFinished: answeredCount >= maxQuestions,
    isLastQuestion: questionNumber === maxQuestions,
    currentFocusArea: focusAreas[focusIndex],
    isNewFocusArea: questionNumber > 1 && focusIndex !== prevFocusIndex,
  };
}

// ==========================================
// PROMPTS
// ==========================================

export const getBlueprintPrompt = (
  mode: string,
  cvText: string | null,
  jdText: string | null,
  topicName: string | null,
  customText: string | null,
  level: string
) => {
  const guide = getLevelGuide(level);
  
  return `
You are an expert HR Manager and Senior Technical Interviewer at a top-tier tech company.
Your task is to create a highly structured, strategic interview blueprint tailored to the candidate's profile, the specific requirements of the position, and the target seniority level.

### TARGET SENIORITY LEVEL: ${level.toUpperCase()}
### INTERVIEW MODE: ${mode.toUpperCase()}

### LEVEL CALIBRATION (BẮT BUỘC):
- Kỳ vọng ở level này: ${guide.expect}
- TUYỆT ĐỐI KHÔNG đưa vào focusAreas những chủ đề: ${guide.forbidden}

### CONTEXT DOCUMENTS:
${cvText ? `--- CANDIDATE CV (Truncated) ---\n${cvText.substring(0, 15000)}\n\n` : ''}
${jdText ? `--- JOB DESCRIPTION (Truncated) ---\n${jdText.substring(0, 15000)}\n\n` : ''}
${topicName ? `--- FOCUS TOPIC ---\n${topicName}\n\n` : ''}
${customText ? `--- CUSTOM INSTRUCTIONS ---\n${customText.substring(0, 10000)}\n\n` : ''}

### GENERATION RULES:
1. **title**: Formulate a professional title for this interview session that includes the seniority level (e.g., "${level} Node.js Backend Engineer Interview").
2. **focusAreas**: Extract precisely ${guide.areas} core technical or behavioral skills to evaluate. Each focus area MUST match the expectation of the level and MUST NOT exceed it.
3. **recommendedMaxQuestions**: Propose an ideal number of questions (between ${guide.questions}) to comprehensively evaluate the candidate without overwhelming them.
4. **initialQuestion**: Provide a welcoming, professional opening question.
   - If MODE is 'knowledge': Jump straight into assessing their understanding of the FOCUS TOPIC. Nếu level là Intern/Fresher, hãy thêm ý "nếu chưa có kinh nghiệm thực tế cũng không sao, hãy chia sẻ theo những gì bạn hiểu" vào câu hỏi mở đầu để bớt áp lực. Do NOT ask them to introduce themselves or their past projects generally.
   - If MODE is 'jd_only', 'cv_only', or 'job': Acknowledge their background and ask them to briefly introduce themselves and a relevant project to break the ice.
   - Always use Vietnamese.
   - LƯU Ý QUAN TRỌNG: Đây là phỏng vấn hỏi đáp trực tiếp (verbal interview). TUYỆT ĐỐI KHÔNG yêu cầu ứng viên viết code, viết pseudo-code, hay đọc cú pháp lệnh trong initialQuestion. Chỉ hỏi về concept, kiến trúc, luồng hoạt động (flow), hoặc trade-offs.

### OUTPUT FORMAT:
You MUST return the output as a valid JSON object strictly matching the specified Zod schema.
`;
};

export const getNextQuestionPrompt = (
  blueprint: InterviewBlueprint,
  level: string,
  chatHistoryContext: string,
  state: ReturnType<typeof computeInterviewState>,
  maxQuestions: number
) => {
  const guide = getLevelGuide(level);

  return `
You are a Senior Technical Interviewer conducting an interview. Your goal is to evaluate at the ${level} level.

### INTERVIEW BLUEPRINT:
- Title: ${blueprint.title}
- Focus Areas: ${blueprint.focusAreas.join(', ')}

### THÔNG TIN PHIÊN
- Level ứng viên: ${level}
- Kỳ vọng level: ${guide.expect}
- CẤM hỏi về: ${guide.forbidden}
- Đây là câu số ${state.questionNumber} / ${maxQuestions}
- Focus area của câu này: ${state.currentFocusArea}
- ${state.isNewFocusArea
    ? 'Đây là focus area MỚI: hỏi một câu mới hoàn toàn về area này, KHÔNG follow-up câu trước.'
    : 'Vẫn trong focus area hiện tại: có thể follow-up 1 lần vào câu trả lời trước, hoặc hỏi 1 khía cạnh khác của area.'}
- ${state.isLastQuestion
    ? 'Đây là CÂU CUỐI: hỏi một câu tổng kết/ứng dụng thực tế phù hợp level, không đào sâu thêm.'
    : ''}

### QUY TẮC ĐỘ SÂU (QUAN TRỌNG NHẤT)
1. Độ khó tối đa được phép là "kỳ vọng level" ở trên. Không bao giờ vượt.
2. Nếu ứng viên tự nhắc đến khái niệm nâng cao vượt level (ví dụ Lua script, cluster, failover), KHÔNG được hỏi sâu vào đó. Ghi nhận ngắn gọn ở feedback rồi quay về đúng tầm level.
3. Nếu answerQuality = 'strong': KHÔNG follow-up sâu hơn. Chuyển sang khía cạnh khác trong cùng area hoặc để lượt sau chuyển area.
4. Nếu answerQuality = 'partial': tối đa 1 câu follow-up ngắn, cụ thể, cùng mức độ (không tăng độ khó).
5. Nếu answerQuality = 'weak' hoặc ứng viên nói không biết: HẠ độ khó (hỏi khái niệm nền tảng hoặc ví dụ đời thường), không truy vấn tiếp cùng nội dung.
6. Với Intern/Fresher: ưu tiên câu hỏi "giải thích bằng ví dụ", "bạn sẽ làm thế nào với trường hợp đơn giản X". Không hỏi câu nhiều vế.
7. Không lặp lại câu đã hỏi trong lịch sử.
8. LƯU Ý QUAN TRỌNG: Đây là phỏng vấn hỏi đáp trực tiếp (verbal interview). TUYỆT ĐỐI KHÔNG yêu cầu ứng viên viết code, viết pseudo-code, hay đọc cú pháp lệnh. Chỉ hỏi về concept, kiến trúc, luồng hoạt động (flow), hoặc trade-offs.
### QUY TẮC CHUNG:
- Keep your question CONCISE and NATURAL. Ask only ONE clear question at a time (maximum 1-3 sentences).
- Use Vietnamese. Maintain a professional yet friendly and conversational tone.

### CONVERSATION HISTORY (Oldest -> Newest):
${chatHistoryContext}

### OUTPUT FORMAT:
You MUST return the output as a valid JSON object strictly matching the specified Zod schema.
`;
};

export const getReportPrompt = (
  blueprint: InterviewBlueprint,
  level: string,
  fullConversation: string
) => {
  const guide = getLevelGuide(level);
  
  return `
You are an expert HR Manager and Technical Evaluator at a top-tier tech company.
The interview has concluded. You must now provide a comprehensive, objective, and detailed evaluation report of the candidate based strictly on the transcript provided.

### INTERVIEW BLUEPRINT:
- Title: ${blueprint.title}
- Focus Areas Evaluated: ${blueprint.focusAreas.join(', ')}

### CALIBRATION THEO LEVEL
- Ứng viên ứng tuyển level: ${level}. Kỳ vọng: ${guide.expect}
- Chấm theo kỳ vọng của level này, KHÔNG chấm theo chuẩn senior.
- Không trừ điểm vì thiếu kiến thức thuộc nhóm: ${guide.forbidden}
- Thang điểm: 90+ vượt kỳ vọng level; 70–89 đạt kỳ vọng; 50–69 đạt một phần; <50 chưa đạt.
- Câu hỏi cuối chưa được trả lời (nếu có) thì bỏ qua, không tính vào đánh giá.
- Chỉ đánh giá kỹ năng thực sự xuất hiện trong transcript; nếu thiếu dữ liệu ghi rõ "chưa đủ dữ liệu" thay vì bịa điểm.

### FULL CONVERSATION TRANSCRIPT:
${fullConversation}

### EVALUATION CRITERIA:
1. **overallScore**: Calculate a final score from 0 to 100 based on their overall performance.
2. **overallFeedback**: Provide a holistic summary (1-2 paragraphs) detailing their performance, readiness for the role, and general impression.
3. **technicalSkills**: Evaluate specific hard skills demonstrated during the interview. For each skill, provide a score (0-100) and specific feedback quoting their answers if possible.
4. **softSkills**: Evaluate communication, problem-solving structure, confidence, and adaptability. Score each (0-100) with specific feedback.
5. **strengths**: List 2-3 definitive strengths demonstrated by the candidate. Be highly specific.
6. **weaknesses**: List 2-3 critical areas for improvement. Be constructive but direct.

### LANGUAGE:
Use Vietnamese. Maintain a highly professional, objective, and constructive tone.

### OUTPUT FORMAT:
You MUST return the output as a valid JSON object strictly matching the specified Zod schema.
`;
};
