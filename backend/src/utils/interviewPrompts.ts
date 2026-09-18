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
  question: z.string(),
  feedbackToPreviousAnswer: z.string().nullable(),
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
// PROMPTS
// ==========================================

export const getBlueprintPrompt = (
  mode: string,
  cvText: string | null,
  jdText: string | null,
  topicName: string | null,
  customText: string | null,
  level: string
) => `
You are an expert HR Manager and Senior Technical Interviewer at a top-tier tech company.
Your task is to create a highly structured, strategic interview blueprint tailored to the candidate's profile, the specific requirements of the position, and the target seniority level.

### TARGET SENIORITY LEVEL: ${level.toUpperCase()}
### INTERVIEW MODE: ${mode.toUpperCase()}

### CONTEXT DOCUMENTS:
${cvText ? `--- CANDIDATE CV (Truncated) ---\n${cvText.substring(0, 15000)}\n\n` : ''}
${jdText ? `--- JOB DESCRIPTION (Truncated) ---\n${jdText.substring(0, 15000)}\n\n` : ''}
${topicName ? `--- FOCUS TOPIC ---\n${topicName}\n\n` : ''}
${customText ? `--- CUSTOM INSTRUCTIONS ---\n${customText.substring(0, 10000)}\n\n` : ''}

### GENERATION RULES:
1. **title**: Formulate a professional title for this interview session that includes the seniority level (e.g., "${level} Node.js Backend Engineer Interview").
2. **focusAreas**: Extract precisely 3 to 5 core technical or behavioral skills to evaluate. These must be the most critical skills needed based on the JD or topic provided, adjusted for a ${level} candidate.
3. **recommendedMaxQuestions**: Propose an ideal number of questions (between 5 and 10) to comprehensively evaluate the candidate without overwhelming them.
4. **initialQuestion**: Provide a welcoming, professional opening question. It should acknowledge their background (if CV provided) and ask them to introduce a relevant project or experience to break the ice. Use Vietnamese.

### OUTPUT FORMAT:
You MUST return the output as a valid JSON object strictly matching the specified Zod schema.
`;

export const getNextQuestionPrompt = (
  blueprint: InterviewBlueprint,
  chatHistoryContext: string
) => `
You are a Senior Technical Interviewer conducting an interview. Your goal is to deeply evaluate the candidate's expertise, problem-solving skills, and cultural fit.

### INTERVIEW BLUEPRINT:
- Title: ${blueprint.title}
- Focus Areas: ${blueprint.focusAreas.join(', ')}

### CONVERSATION HISTORY (Most recent first):
${chatHistoryContext}

### YOUR TASK:
1. **Evaluate**: Analyze the candidate's last answer. Was it accurate? Did it lack depth? 
2. **Feedback**: Provide very brief, natural feedback on their previous answer (if applicable). Keep it under 2 sentences.
3. **Next Question**: Ask the NEXT interview question based on the conversation and the Blueprint. 
   - **Crucial Rule**: Keep your question CONCISE and NATURAL. Ask only ONE clear question at a time (maximum 1-3 sentences). Do NOT ask a massive paragraph containing 5-10 sub-questions.
   - **Crucial Rule**: Act like a real human interviewer. Do NOT drill excessively deep into unnecessary micro-details (e.g., specific indexing algorithms, vector search implementation details) unless the candidate explicitly focuses on them or the role strictly demands it.
   - If their previous answer was superficial, ask a simple, focused follow-up (e.g., "Why did you choose X over Y?" or "How did you handle the edge case in Z?").
   - If they answered well and the topic is sufficiently covered, transition smoothly to the next Focus Area in the blueprint.
   - Do NOT repeat questions that have already been asked.

### LANGUAGE:
Use Vietnamese. Maintain a professional yet friendly and conversational tone.

### OUTPUT FORMAT:
You MUST return the output as a valid JSON object strictly matching the specified Zod schema.
`;

export const getReportPrompt = (
  blueprint: InterviewBlueprint,
  fullConversation: string
) => `
You are an expert HR Manager and Technical Evaluator at a top-tier tech company.
The interview has concluded. You must now provide a comprehensive, objective, and detailed evaluation report of the candidate based strictly on the transcript provided.

### INTERVIEW BLUEPRINT:
- Title: ${blueprint.title}
- Focus Areas Evaluated: ${blueprint.focusAreas.join(', ')}

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
