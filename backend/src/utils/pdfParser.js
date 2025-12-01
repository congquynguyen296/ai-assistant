import fs from "fs/promises";
import { AppError } from "../middlewares/errorHandle.js";
import { PDFParse } from "pdf-parse";

/**
 * Extract text content from a PDF file
 *
 * @param {*} filePath Path to PDF file
 * @returns {Promise<text: string, numPages: number>} Extracted text and number of pages
 */
export const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = await fs.readFile(filePath);

    // pdf-parse expects a Unit8Array
    const pdfParser = new PDFParse(new Uint8Array(dataBuffer));
    const data = await pdfParser.getText();

    return {
      text: data.text,
      numPages: data.numpages,
      info: data.info,
    };
  } catch (error) {
    console.log(`Không thể phân tích file PDF: ${error.message}`);
    throw new AppError("Không thể phân tích file PDF", 500);
  }
};
