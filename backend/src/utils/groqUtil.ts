import Groq from "groq-sdk";
import { AppError } from "@/middlewares/errorHandle.js";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

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
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 4096,
    });

    const generatedText = completion.choices[0]?.message?.content || "";

    return generatedText;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new AppError("Lỗi khi generate summary", 500);
  }
};
