import { GoogleGenAI } from "@google/genai";
import { AppError } from "@/middlewares/errorHandle.js";

export interface GeneratedFlashcard {
  question: string;
  answer: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "Lỗi biến môi trường: GEMINI_API_KEY is not set in the environment variables.",
  );
  process.exit(1);
}

export const generateFlashcards = async (
  text: string,
  numFlashcards: number,
  requirements?: string | Record<string, unknown>,
): Promise<GeneratedFlashcard[]> => {
  const reqString =
    typeof requirements === "object"
      ? JSON.stringify(requirements)
      : requirements;

  const prompt = `
    You are an expert educational content creator and curriculum designer.
    Your task is to extract key concepts from the provided text and convert them into exactly ${numFlashcards} high-quality flashcards.

    ### STRICT CONFIGURATION:
    - **Quantity:** ${numFlashcards} cards.
    - **Source Language:** Detect and use the EXACT SAME LANGUAGE as the source text for all questions and answers.
    - **Output Format:** Return ONLY a raw JSON array. Do not use Markdown code blocks (no \`\`\`json). Do not add any introductory or concluding text.

    ### USER CUSTOM REQUIREMENTS (Must Follow):
    "${reqString}"

    ### QUALITY GUIDELINES:
    1. **Focus:** Prioritize main ideas, definitions, and critical facts over trivial details.
    2. **Clarity:** Questions must be unambiguous. Answers must be concise and accurate.
    3. **Difficulty:** Assign "easy", "medium", or "hard" based on the cognitive load required.
    4. **Safety:** If the text does not contain enough info for ${numFlashcards} cards, generate as many valid ones as possible. DO NOT hallucinate or invent facts.

    ### REQUIRED JSON SCHEMA:
    [
      { "question": "Concise question string", "answer": "Clear answer string", "difficulty": "easy|medium|hard" }
    ]

    ### SOURCE TEXT:
    """
    ${text.substring(0, 15000)}
    """
    `;

  try {
    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash-lite",
      contents: prompt,
    });

    let generatedText = String(response?.text ?? "");

    const firstBracket = generatedText.indexOf("[");
    const lastBracket = generatedText.lastIndexOf("]");
    if (
      firstBracket !== -1 &&
      lastBracket !== -1 &&
      lastBracket > firstBracket
    ) {
      const candidate = generatedText.slice(firstBracket, lastBracket + 1);
      try {
        const parsed = JSON.parse(candidate) as Array<
          Partial<GeneratedFlashcard>
        >;
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .map((c) => ({
              question: String(c.question ?? "").trim(),
              answer: String(c.answer ?? "").trim(),
              difficulty: String(c.difficulty ?? "medium")
                .trim()
                .toLowerCase(),
            }))
            .filter((c) => c.question && c.answer)
            .map((c) => ({
              question: c.question,
              answer: c.answer,
              difficulty: ["easy", "medium", "hard"].includes(c.difficulty)
                ? (c.difficulty as GeneratedFlashcard["difficulty"])
                : "medium",
            }));
          return normalized.slice(0, numFlashcards);
        }
      } catch {
        // fall through to text parsing
      }
    }

    const flashcards: GeneratedFlashcard[] = [];

    const parts = generatedText
      .split(/_{3,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    for (const part of parts) {
      const lines = part
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      let q = "";
      let a = "";
      let d: GeneratedFlashcard["difficulty"] = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          q = line.substring(2).trim();
        } else if (line.startsWith("A:")) {
          a = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            d = diff as GeneratedFlashcard["difficulty"];
          }
        } else {
          if (!q && /[?？]$/.test(line)) {
            q = (q ? q + " " : "") + line;
          } else if (q && !a) {
            a = (a ? a + " " : "") + line;
          }
        }
      }

      if (q && a) {
        flashcards.push({ question: q, answer: a, difficulty: d });
      }
    }

    if (flashcards.length === 0) {
      const lines = generatedText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      let tmp: GeneratedFlashcard | null = null;
      for (const line of lines) {
        if (line.startsWith("Q:")) {
          if (tmp && tmp.question && tmp.answer) flashcards.push(tmp);
          tmp = {
            question: line.substring(2).trim(),
            answer: "",
            difficulty: "medium",
          };
        } else if (line.startsWith("A:")) {
          if (!tmp) {
            tmp = { question: "", answer: "", difficulty: "medium" };
          }
          tmp.answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          if (!tmp) {
            tmp = { question: "", answer: "", difficulty: "medium" };
          }
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            tmp.difficulty = diff as GeneratedFlashcard["difficulty"];
          }
        }
      }
      if (tmp && tmp.question && tmp.answer) flashcards.push(tmp);
    }

    return flashcards.slice(0, numFlashcards);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

export const generateQuiz = async (
  text: string,
  numQuestions: number,
  requirements?: string | Record<string, unknown>,
): Promise<GeneratedQuizQuestion[]> => {
  const reqString =
    typeof requirements === "object"
      ? JSON.stringify(requirements)
      : requirements;

  const prompt = `
    You are an expert assessment specialist and educational content creator.
    Your task is to create a high-quality multiple-choice quiz based strictly on the provided text.

    ### STRICT CONFIGURATION:
    - **Quantity:** Exactly ${numQuestions} questions.
    - **Language:** Detect and use the EXACT SAME LANGUAGE as the source text.
    - **Output Format:** Return ONLY a raw JSON array. Do not use Markdown code blocks (no \`\`\`json). Do not add any conversational text.

    ### USER CUSTOM REQUIREMENTS (Must Follow):
    "${reqString}"

    ### QUALITY GUIDELINES:
    1. **Distractors:** The wrong options must be plausible and related to the context, not obviously fake or silly.
    2. **Unambiguous:** Ensure there is exactly one clearly correct answer per question.
    3. **Explanation:** The "explanation" field must provide a clear reasoning for why the answer is correct, serving as a learning point.
    4. **Variety:** Unless specified otherwise, cover different difficulty levels (easy, medium, hard).

    ### REQUIRED JSON SCHEMA:
    [
      {
        "question": "The question stem here?",
        "options": [
          "Option A string",
          "Option B string",
          "Option C string",
          "Option D string"
        ],
        "correctAnswer": "Exact string matching one of the options",
        "explanation": "Educational explanation of why this is correct.",
        "difficulty": "easy|medium|hard"
      }
    ]

    ### SOURCE TEXT:
    """
    ${text.substring(0, 15000)}
    """
    `;

  try {
    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash-lite",
      contents: prompt,
    });

    let generatedText = String(response?.text ?? "");

    const firstBracket = generatedText.indexOf("[");
    const lastBracket = generatedText.lastIndexOf("]");
    if (
      firstBracket !== -1 &&
      lastBracket !== -1 &&
      lastBracket > firstBracket
    ) {
      const candidate = generatedText.slice(firstBracket, lastBracket + 1);
      try {
        const parsed = JSON.parse(candidate) as Array<
          Partial<GeneratedQuizQuestion>
        >;
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .map((q) => ({
              question: String(q.question ?? "").trim(),
              options: Array.isArray(q.options)
                ? q.options.map((o) => String(o).trim())
                : [],
              correctAnswer: String(q.correctAnswer ?? "").trim(),
              explanation: String(q.explanation ?? "").trim(),
              difficulty: String(q.difficulty ?? "medium")
                .trim()
                .toLowerCase(),
            }))
            .filter((q) => q.question && q.options.length && q.correctAnswer)
            .map((q) => ({
              question: q.question,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              difficulty: ["easy", "medium", "hard"].includes(q.difficulty)
                ? (q.difficulty as GeneratedQuizQuestion["difficulty"])
                : "medium",
            }));
          return normalized.slice(0, numQuestions);
        }
      } catch {
        // fall through to text parsing
      }
    }

    const questionBlocks = generatedText
      .split(/_{3,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    const questions: GeneratedQuizQuestion[] = [];

    for (const block of questionBlocks) {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      let question = "";
      let options: string[] = [];
      let correctAnswer = "";
      let explanation = "";
      let difficulty: GeneratedQuizQuestion["difficulty"] = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (
          /^\d{1,2}[:.)]/.test(line) ||
          /^[0-9][0-9]?[:]/.test(line) ||
          /^[A-D][).:]/i.test(line)
        ) {
          const m =
            line.match(/^[A-Da-d0-9]{1,2}[:\).]\s*(.*)$/) ||
            line.match(/^[0-9]{1,2}[:]\s*(.*)$/);
          if (m) options.push(m[1].trim());
        } else if (
          line.startsWith("01:") ||
          line.startsWith("02:") ||
          line.startsWith("03:") ||
          line.startsWith("04:")
        ) {
          const idx = line.indexOf(":");
          options.push(line.slice(idx + 1).trim());
        } else if (line.startsWith("C:")) {
          correctAnswer = line.substring(2).trim();
        } else if (line.startsWith("E:")) {
          explanation = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff as GeneratedQuizQuestion["difficulty"];
          }
        }
      }

      if (question && options.length && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return questions.slice(0, numQuestions);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate quiz questions");
  }
};

export const generateSummary = async (
  text: string,
  language: string,
): Promise<string> => {
  const inputData = text.length > 100000 ? text.substring(0, 100000) : text;

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
  ${inputData}`;

  try {
    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.4,
      },
    });

    const generatedText = String(response?.text ?? "").trim();
    return generatedText;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new AppError("Lỗi khi generate summary", 500);
  }
};

export const chatWithContext = async (
  question: string,
  chunks: Array<{ content: string; pageNumber?: number }> | null,
  ragContextText: string | null = null,
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
       - Nếu người dùng KHEN (vd: "Khá nhể", "Giỏi quá", "Thông minh đấy"): Hãy nhận lời khen một cách tự nhiên, khiêm tốn hoặc hài hước nhẹ nhàng. **TUYỆT ĐỐI KHÔNG** hỏi lại ngay câu "Bạn cần giúp gì thêm?" gây mất hứng.
         * Ví dụ: "Cảm ơn bạn! Được khen là tôi vui cả ngày đấy 😄" hoặc "Cũng thường thôi, do tài liệu của bạn viết rõ ràng mà."
       - Nếu người dùng TRÊU ĐÙA hoặc CHÀO HỎI: Hãy đáp lại thoải mái, như hai người bạn.
       - Nếu người dùng hỏi VU VƠ không liên quan tài liệu: Trả lời ngắn gọn theo kiến thức của bạn rồi khéo léo quay lại chủ đề chính nếu cần.
    
    2. **Nhóm Hỏi về Tài liệu (Chuyên môn)**:
       - Nếu câu hỏi liên quan đến kiến thức trong tài liệu: Hãy trả lời CHÍNH XÁC, SÂU SẮC dựa trên "TÀI LIỆU CỦA NGƯỜI DÙNG" ở trên.
       - Trích dẫn thông tin cụ thể để chứng minh bạn hiểu bài.
    
    3. **Nguyên tắc chung**:
       - KHÔNG lặp lại các mẫu câu robot như "Tôi là AI", "Dựa trên tài liệu".
       - Dùng ngôn ngữ tự nhiên, không cứng nhắc.
    
    Câu trả lời của bạn:`;

  try {
    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.6,
      },
    });

    const generatedText = String(response?.text ?? "").trim();
    return generatedText
      ? generatedText.trim()
      : "Xin lỗi, tôi chưa thể xử lý câu trả lời ngay lúc này.";
  } catch (error) {
    console.error("Lỗi Gemini API:", error);
    throw new Error("Không thể kết nối với AI Server.");
  }
};

export const explainConcept = async (
  concept: string,
  context: string,
): Promise<string> => {
  const prompt = `Explain the concept of "${concept}" based on the following context.
- Use the SAME LANGUAGE as the input.
- Provide a clear, educational explanation that's easy to understand.
- Include examples if relevant.
- Respond ONLY with the explanation.

Context:
${context.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = String(response?.text ?? "").trim();
    return generatedText;
  } catch (error) {
    console.error("Lỗi Gemini API:", error);
    throw new Error("Không thể kết nối với AI Server.");
  }
};
