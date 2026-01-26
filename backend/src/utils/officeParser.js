import mammoth from "mammoth";
import xlsx from "xlsx";
import { AppError } from "../middlewares/errorHandle.js";

/**
 * Extract text content from a DOCX file buffer
 *
 * @param {Buffer} buffer DOCX file buffer
 * @returns {Promise<string>} Extracted text
 */
export const extractTextFromDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value; // The raw text
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new AppError("Không thể đọc nội dung file DOCX", 500);
  }
};

/**
 * Extract text content from an Excel file buffer
 *
 * @param {Buffer} buffer Excel file buffer
 * @returns {Promise<string>} Extracted text
 */
export const extractTextFromExcel = async (buffer) => {
  try {
    // codepage: 65001 enforces UTF-8 encoding which fixes issues with Vietnamese fonts (Mojibake)
    // when reading files that might be interpreted as text/csv or have ambiguous encoding.
    const workbook = xlsx.read(buffer, { type: "buffer", codepage: 65001 });
    let text = "";

    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];
      // Use sheet_to_json with header: 1 to get array of arrays (safer for encoding)
      // defval: "" ensures empty cells are empty strings
      const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: "" });
      const sheetText = rows.map((row) => row.join("\t")).join("\n");
      
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
