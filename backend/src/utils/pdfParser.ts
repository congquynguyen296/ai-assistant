import { AppError } from "@/middlewares/errorHandle.js";
import { PDFParse } from "pdf-parse";

export const extractTextFromPDF = async (
  buffer: Buffer,
): Promise<{ text: string; numPages: number; info: unknown }> => {
  try {
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();

    return {
      text: data.text,
      numPages: data.total,
      info: null,
    };
  } catch (error) {
    console.log(`Không thể phân tích file PDF: ${(error as Error).message}`);
    throw new AppError("Không thể phân tích file PDF", 500);
  }
};
