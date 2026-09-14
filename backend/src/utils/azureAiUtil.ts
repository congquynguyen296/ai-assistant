import OpenAI from "openai";
import { AppError } from "@/middlewares/errorHandle.js";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { Difficulty } from "@/types/enums.js";

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  difficulty: Difficulty;
}

export interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
}

if (
  !process.env.AZURE_OPENAI_API_KEY ||
  !process.env.AZURE_OPENAI_ENDPOINT ||
  !process.env.AZURE_OPENAI_DEPLOYMENT_NAME
) {
  console.error("Lỗi biến môi trường: Thiếu cấu hình AZURE_OPENAI_*");
  process.exit(1);
}

const ai = new OpenAI({
  baseURL: process.env.AZURE_OPENAI_ENDPOINT,
  apiKey: process.env.AZURE_OPENAI_API_KEY,
});

const modelName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;

const FlashcardResponseSchema = z.object({
  flashcards: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
      difficulty: z.nativeEnum(Difficulty),
    })
  ),
});

export const generateFlashcards = async (
  text: string,
  numFlashcards: number,
  requirements?: string | Record<string, unknown>
): Promise<GeneratedFlashcard[]> => {
  const reqString =
    typeof requirements === "object"
      ? JSON.stringify(requirements)
      : requirements || "No special requirements.";

  const prompt = `
You are an expert educational content creator and curriculum designer.
Your task is to extract key concepts from the provided text and convert them into exactly ${numFlashcards} high-quality flashcards.

### STRICT CONFIGURATION:
- **Quantity:** EXACTLY ${numFlashcards} cards. If there's not enough context, extract as many as possible.
- **Source Language:** Detect and use the EXACT SAME LANGUAGE as the source text for all questions and answers.

### USER CUSTOM REQUIREMENTS (Must Follow):
"${reqString}"

### QUALITY GUIDELINES:
1. **Focus:** Prioritize main ideas, definitions, and critical facts over trivial details.
2. **Clarity:** Questions must be unambiguous. Answers must be concise and accurate.
3. **Difficulty:** Assign "easy", "medium", or "hard" based on the cognitive load required.
4. **Safety:** DO NOT hallucinate or invent facts.

### SOURCE TEXT:
"""
${text.substring(0, 20000)}
"""
  `;

  try {
    const response = await ai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      response_format: zodResponseFormat(FlashcardResponseSchema, "flashcards"),
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{"flashcards":[]}');
    return parsed.flashcards;
  } catch (error) {
    console.error("Azure OpenAI API error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

const QuizResponseSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correctAnswer: z.string(),
      explanation: z.string(),
      difficulty: z.nativeEnum(Difficulty),
    })
  ),
});

export const generateQuiz = async (
  text: string,
  numQuestions: number,
  requirements?: string | Record<string, unknown>
): Promise<GeneratedQuizQuestion[]> => {
  const reqString =
    typeof requirements === "object"
      ? JSON.stringify(requirements)
      : requirements || "No special requirements.";

  const prompt = `
You are an expert assessment specialist and educational content creator.
Your task is to create a high-quality multiple-choice quiz based strictly on the provided text.

### STRICT CONFIGURATION:
- **Quantity:** Exactly ${numQuestions} questions.
- **Language:** Detect and use the EXACT SAME LANGUAGE as the source text.

### USER CUSTOM REQUIREMENTS (Must Follow):
"${reqString}"

### QUALITY GUIDELINES:
1. **Distractors:** The wrong options must be plausible and related to the context, not obviously fake or silly.
2. **Unambiguous:** Ensure there is exactly one clearly correct answer per question.
3. **Explanation:** The "explanation" field must provide a clear reasoning for why the answer is correct, serving as a learning point.
4. **Variety:** Cover different difficulty levels (easy, medium, hard).

### SOURCE TEXT:
"""
${text.substring(0, 20000)}
"""
  `;

  try {
    const response = await ai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      response_format: zodResponseFormat(QuizResponseSchema, "quiz_questions"),
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{"questions":[]}');
    return parsed.questions;
  } catch (error) {
    console.error("Azure OpenAI API error:", error);
    throw new Error("Failed to generate quiz questions");
  }
};

export const generateSummary = async (
  text: string,
  language: string
): Promise<string> => {
  const inputData = text.substring(0, 50000);

  const prompt = `
Role: You are an expert AI Content Summarizer.
Task: Analyze the provided text and generate a structured summary.

**CRITICAL RULES:**
1. **Adaptability:**
   - If the text is SHORT (under 1000 words): Focus on direct main points, keep it concise.
   - If the text is LONG (over 1000 words): Provide a deep summary, retain important technical details, and explain logic clearly.

2. **Format Requirements (STRICTLY MARKDOWN):**
   - Use **H3 Headers (###)** for section titles.
   - Use **Bold (**text**)** for key terms.
   - Use **Bullet points (-)** for listing ideas.
   - Do NOT use plain block of text. Break it down.

3. **Output Structure:**
   ### 📝 Tổng quan
   (A brief introduction of what the document is about)

   ### 🔑 Các nội dung cốt lõi
   (List of key concepts/sections. If the text is long, group them logically)
   - **Concept A**: Explanation...
   - **Concept B**: Explanation...

   ### 💡 Kết luận
   (Final takeaways or actionable insights)

4. **Language:** ${language}.

Text to summarize:
${inputData}
  `;

  try {
    const response = await ai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error) {
    console.error("Azure OpenAI API error:", error);
    throw new AppError("Lỗi khi generate summary", 500);
  }
};

export const chatWithContext = async (
  question: string,
  chunks: Array<{ content: string; pageNumber?: number }> | null,
  ragContextText: string | null = null
): Promise<string> => {
  const contextText = ragContextText
    ? ragContextText
    : (chunks || [])
        .map((c) => `[Trang ${c.pageNumber || 0}]:\n${c.content}`)
        .join("\n\n---\n\n");

  const prompt = `
Bạn là một trợ lý AI thông minh, chuyên về phân tích tài liệu, nhưng có tính cách thân thiện, cởi mở và tự nhiên (như một người đồng nghiệp giỏi).

=== TÀI LIỆU CỦA NGƯỜI DÙNG ===
${contextText.substring(0, 50000)}
=== HẾT TÀI LIỆU ===

=== CÂU NÓI CỦA NGƯỜI DÙNG ===
"${question}"

=== HƯỚNG DẪN TRẢ LỜI (QUAN TRỌNG) ===
Hãy phân tích ý định của người dùng trước khi trả lời:

1. **Nhóm Giao tiếp Xã hội / Khen ngợi / Trêu đùa**:
   - Nếu người dùng KHEN: Hãy nhận lời khen một cách tự nhiên, khiêm tốn hoặc hài hước nhẹ nhàng. TUYỆT ĐỐI KHÔNG hỏi lại ngay câu "Bạn cần giúp gì thêm?" gây mất hứng.
   - Nếu người dùng TRÊU ĐÙA hoặc CHÀO HỎI: Hãy đáp lại thoải mái, như hai người bạn.

2. **Nhóm Hỏi về Tài liệu (Chuyên môn)**:
   - Nếu câu hỏi liên quan đến kiến thức trong tài liệu: Hãy trả lời CHÍNH XÁC, SÂU SẮC dựa trên "TÀI LIỆU CỦA NGƯỜI DÙNG" ở trên.
   - Trích dẫn thông tin cụ thể để chứng minh bạn hiểu bài.

3. **Nguyên tắc chung**:
   - KHÔNG lặp lại các mẫu câu robot như "Tôi là AI", "Dựa trên tài liệu".
   - Dùng ngôn ngữ tự nhiên, không cứng nhắc.
  `;

  try {
    const response = await ai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content?.trim() || "Xin lỗi, tôi chưa thể xử lý câu trả lời ngay lúc này.";
  } catch (error) {
    console.error("Lỗi Azure OpenAI API:", error);
    throw new Error("Không thể kết nối với AI Server.");
  }
};

export const explainConcept = async (
  concept: string,
  context: string
): Promise<string> => {
  const prompt = `Explain the concept of "${concept}" based on the following context.
- Use the SAME LANGUAGE as the input.
- Provide a clear, educational explanation that's easy to understand.
- Include examples if relevant.
- Respond ONLY with the explanation.

Context:
${context.substring(0, 20000)}`;

  try {
    const response = await ai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0].message.content?.trim() || "";
  } catch (error) {
    console.error("Lỗi Azure OpenAI API:", error);
    throw new Error("Không thể kết nối với AI Server.");
  }
};

export const KnowledgeGraphSchema = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      category: z.string(),
      importance: z.number().min(1).max(3),
      summary: z.string(),
    })
  ),
  edges: z.array(
    z.object({
      id: z.string(),
      from: z.string(),
      to: z.string(),
      label: z.string(),
    })
  ),
});

export type GeneratedKnowledgeGraph = z.infer<typeof KnowledgeGraphSchema>;

export const generateKnowledgeGraph = async (
  chunks: Array<{ content: string; chunkIndex: number }>
): Promise<GeneratedKnowledgeGraph> => {
  const contextText = chunks
    .map((c) => `[Chunk ${c.chunkIndex}]:\n${c.content}`)
    .join("\n\n---\n\n");

  const prompt = `
You are an expert AI Data Scientist and Knowledge Engineer.
Your task is to extract a Knowledge Graph (Concept Map) from the provided document chunks.

### STRICT CONFIGURATION:
- **Language:** ALWAYS generate the output in Vietnamese (Tiếng Việt), regardless of the source text language. Use simple, clear, and easy-to-understand language.

### GRAPH REQUIREMENTS:
- Extract 5 to 10 core, high-level concepts (nodes) from the text. Keep the graph simple and beginner-friendly.
- Connect them with clear, logical relationships (edges).
- Provide a concise summary for each node.
- Assign an importance score to each node (1 = lowest, 3 = highest core concept).
- Give a descriptive \`label\` for every edge explaining the relationship (e.g., "is a type of", "leads to", "depends on").
- Ensure all \`from\` and \`to\` references in edges correspond to valid node \`id\`s.

### SOURCE TEXT:
"""
${contextText.substring(0, 50000)}
"""
  `;

  try {
    const response = await ai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      response_format: zodResponseFormat(KnowledgeGraphSchema, "knowledge_graph"),
    });

    const parsedJson = JSON.parse(response.choices[0].message.content || '{"nodes":[],"edges":[]}');
    
    // Ensure edge integrity
    const nodeIds = new Set(parsedJson.nodes.map((n: any) => n.id));
    parsedJson.edges = parsedJson.edges.filter(
      (edge: any) => nodeIds.has(edge.from) && nodeIds.has(edge.to)
    );

    return parsedJson as GeneratedKnowledgeGraph;
  } catch (error) {
    console.error("Azure OpenAI API error generating knowledge graph:", error);
    throw new Error("Lỗi khi tạo sơ đồ kiến thức");
  }
};
