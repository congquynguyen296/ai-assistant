import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { AppError } from "../middlewares/errorHandle.js";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.error(
    "Lỗi biến môi trường: GEMINI_API_KEY is not set in the environment variables."
  );
  process.exit(1);
}

/**
 * Generate flashcards from text
 * - Requests the model to RETURN STRICT JSON (array of objects).
 * - Instructs the model to respond in the SAME LANGUAGE as the input text.
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.
- Use the SAME LANGUAGE as the input text when creating questions and answers.
- Format: Return a STRICTLY PARSEABLE JSON array (no extra commentary), for example:
[
  { "question": "Question 1 ...", "answer": "Answer 1 ...", "difficulty": "easy" },
  { "question": "Question 2 ...", "answer": "Answer 2 ...", "difficulty": "medium" }
]
- Allowed difficulty values: "easy", "medium", "hard".
- If information to make a question is missing, skip that card (do not invent unrelated facts).

Text:
${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash-lite",
      contents: prompt,
    });

    let generatedText = String(response?.text ?? "");

    // Try to extract JSON array first (strip fences or extra text)
    // Find first '[' and last ']' to try to get JSON even if wrapped in text
    const firstBracket = generatedText.indexOf("[");
    const lastBracket = generatedText.lastIndexOf("]");
    if (
      firstBracket !== -1 &&
      lastBracket !== -1 &&
      lastBracket > firstBracket
    ) {
      const candidate = generatedText.slice(firstBracket, lastBracket + 1);
      try {
        const parsed = JSON.parse(candidate);
        if (Array.isArray(parsed)) {
          // Normalize and ensure fields exist
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
                ? c.difficulty
                : "medium",
            }));
          return normalized.slice(0, count);
        }
      } catch (e) {
        // fall through to text parsing
        // console.warn('JSON parse failed, fallback to text parser', e);
      }
    }

    // Fallback: robust text parser (handle "___" separators and Q:/A:/D: lines)
    // This path will parse outputs like your sample if model didn't output JSON.
    const flashcards = [];
    let current = null;

    // Normalize separators: ensure "___" recognized even with spaces
    const parts = generatedText
      .split(/_{3,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    for (const part of parts) {
      // Each part may contain Q/A/D lines; parse lines inside
      const lines = part
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      let q = "",
        a = "",
        d = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          q = line.substring(2).trim();
        } else if (line.startsWith("A:")) {
          a = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) d = diff;
        } else {
          // If line doesn't start with a label, try to heuristically append to current Q or A
          // If Q is empty, treat as question continuation; else if A is empty treat as answer continuation
          if (!q && /[?？]$/.test(line)) {
            q = (q ? q + " " : "") + line;
          } else if (q && !a) {
            a = (a ? a + " " : "") + line;
          }
        }
      }

      // Only push valid cards with both question and answer
      if (q && a) {
        flashcards.push({ question: q, answer: a, difficulty: d });
      }
    }

    // As a final fallback: if no separators found, try line-by-line scanning for multiple Q/A pairs
    if (flashcards.length === 0) {
      const lines = generatedText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      let tmp = null;
      for (const line of lines) {
        if (line.startsWith("Q:")) {
          if (tmp && tmp.question && tmp.answer) flashcards.push(tmp);
          tmp = {
            question: line.substring(2).trim(),
            answer: "",
            difficulty: "medium",
          };
        } else if (line.startsWith("A:")) {
          if (!tmp) tmp = { question: "", answer: "", difficulty: "medium" };
          tmp.answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          if (!tmp) tmp = { question: "", answer: "", difficulty: "medium" };
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) tmp.difficulty = diff;
        }
      }
      if (tmp && tmp.question && tmp.answer) flashcards.push(tmp);
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

/**
 * Generate quiz questions
 * - Requests model to return STRICT JSON array of objects:
 *   [{ question, options: [...], correctAnswer, explanation, difficulty }]
 * - Ensures SAME LANGUAGE as input text.
 * @param {string} text
 * @param {number} numQuestions
 * @returns {Promise<Array<{question: string, options: string[], correctAnswer: string, explanation: string, difficulty: string}>>}
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
- Use the SAME LANGUAGE as the input text.
- Return a STRICT JSON array, example:
[
  {
    "question": "Question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option B",
    "explanation": "Explain for this correctAnswer. Talk reason why this is the correct answer.",
    "difficulty": "medium"
  }
]
- Allowed difficulty values: "easy", "medium", "hard".
- Respond ONLY with the JSON array and nothing else.

Text:
${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash-lite",
      contents: prompt,
    });

    let generatedText = String(response?.text ?? "");

    // Try JSON parse first
    const firstBracket = generatedText.indexOf("[");
    const lastBracket = generatedText.lastIndexOf("]");
    if (
      firstBracket !== -1 &&
      lastBracket !== -1 &&
      lastBracket > firstBracket
    ) {
      const candidate = generatedText.slice(firstBracket, lastBracket + 1);
      try {
        const parsed = JSON.parse(candidate);
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
                ? q.difficulty
                : "medium",
            }));
          return normalized.slice(0, numQuestions);
        }
      } catch (e) {
        // fall through to text parsing
      }
    }

    // Fallback: text parsing (split by separators)
    const questionBlocks = generatedText
      .split(/_{3,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    const questions = [];

    for (const block of questionBlocks) {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      let question = "",
        options = [],
        correctAnswer = "",
        explanation = "",
        difficulty = "medium";

      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (
          /^\d{1,2}[:.)]/.test(line) ||
          /^[0-9][0-9]?[:]/.test(line) ||
          /^[A-D][).:]/i.test(line)
        ) {
          // capture option after "01:" "1." "A)" "A:"
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
          if (["easy", "medium", "hard"].includes(diff)) difficulty = diff;
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

/**
 * Generate document summary
 * - Requests the model to produce a concise summary.
 * - Model should use the SAME LANGUAGE as input.
 * @param {string} text
 * @returns {Promise<string>}
 */
/**
 * Generate document summary
 * - Model: models/gemini-2.5-flash (Cân bằng giữa context lớn và giá)
 * - Format: Markdown (Dễ render lên UI)
 */
export const generateSummary = async (text, language) => {
  // Không dùng substring cắt cứng nữa, Gemini 2.5 chịu được context rất lớn.
  // Tuy nhiên, nếu sợ tốn tiền token thì có thể cắt ở mức an toàn khoảng 100k ký tự.
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
      model: "models/gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.4, // Giữ thấp để AI tập trung vào nội dung gốc, không bịa đặt
      },
    });

    const generatedText = String(response?.text ?? "").trim();
    return generatedText;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new AppError("Lỗi khi generate summary", 500);
  }
};

/**
 * Chat with document context
 * - Answer user's question based strictly on the provided chunks.
 * - Model should use the SAME LANGUAGE as the input.
 * - If the answer is not in the context, respond with "I don't know" (or in the same language).
 * @param {string} question
 * @param {Array<{content: string}>} chunks
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((c, i) => `[Chunk ${i + 1}]\n${c.content}`)
    .join("\n\n");

  const prompt = `Based on the following context from a document, analyze the context and answer the user's question using ONLY the provided context.
- Use the SAME LANGUAGE as the context.
- If the answer is not present in the context, say "I don't know" (or the equivalent in the context's language).
- Be concise and factual. Respond ONLY with the answer (no step-by-step chain-of-thought).

Context:
${context.substring(0, 20000)}

Question: ${question}

Answer:`;

  try {
    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash",
      contents: prompt,
    });

    const generatedText = String(response?.text ?? "").trim();
    return generatedText;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to process chat request");
  }
};

/**
 * Explain a specific concept
 * - Provide an educational explanation based on provided context.
 * - Use the SAME LANGUAGE as input.
 * @param {string} concept
 * @param {string} context
 * @returns {Promise<string>}
 */
export const explainConcept = async (concept, context) => {
  const prompt = `Explain the concept of "${concept}" based on the following context.
- Use the SAME LANGUAGE as the input.
- Provide a clear, educational explanation that's easy to understand.
- Include examples if relevant.
- Respond ONLY with the explanation.

Context:
${context.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "models/gemini-2.5-flash",
      contents: prompt,
    });

    const generatedText = String(response?.text ?? "").trim();
    return generatedText;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to explain concept");
  }
};
