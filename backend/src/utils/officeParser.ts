import mammoth from "mammoth";
import xlsx from "xlsx";
import { AppError } from "@/middlewares/errorHandle.js";

export const extractTextFromDOCX = async (buffer: Buffer): Promise<string> => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new AppError("Không thể đọc nội dung file DOCX", 500);
  }
};

export const extractTextFromExcel = async (buffer: Buffer): Promise<string> => {
  try {
    const workbook = xlsx.read(buffer, { type: "buffer", codepage: 65001 });
    let text = "";

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      const sheetText = rows
        .map((row) => (row as Array<string | number | boolean | null>)
          .map((cell) => String(cell ?? ""))
          .join("\t"),
        )
        .join("\n");

      if (sheetText.trim()) {
        text += `--- Sheet: ${sheetName} ---\n${sheetText}\n\n`;
      }
    });

    return text;
  } catch (error) {
    console.error("Error extracting text from Excel:", error);
    throw new AppError("Không thể đọc nội dung file Excel", 500);
  }
};
