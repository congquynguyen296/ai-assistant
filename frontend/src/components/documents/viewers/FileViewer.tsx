import React from "react";
import { Download } from "lucide-react";
import PdfViewer from "@/components/documents/viewers/PdfViewer";
import DocxViewer from "@/components/documents/viewers/DocxViewer";
import ExcelViewer from "@/components/documents/viewers/ExcelViewer";
import UnsupportedViewer from "@/components/documents/viewers/UnsupportedViewer";

/**
 * Main File Viewer Component
 * Switches renderer based on MIME type or extension
 */
interface FileViewerProps {
  url: string;
  mimeType?: string;
  fileName?: string;
  className?: string;
}

const FileViewer = ({ url, mimeType, fileName, className = "" }: FileViewerProps) => {
  if (!url) return null;

  // Normalized check
  const isPdf = mimeType?.includes("pdf") || fileName?.toLowerCase().endsWith(".pdf");
  
  const isDocx = 
    mimeType?.includes("wordprocessingml") || 
    mimeType?.includes("msword") || 
    fileName?.toLowerCase().endsWith(".docx");

  const isExcel = 
    mimeType?.includes("spreadsheet") || 
    mimeType?.includes("excel") || 
    fileName?.toLowerCase().endsWith(".xlsx") || 
    fileName?.toLowerCase().endsWith(".xls");

  // Select component
  let Component;
  if (isPdf) Component = PdfViewer;
  else if (isDocx) Component = DocxViewer;
  else if (isExcel) Component = ExcelViewer;
  else Component = UnsupportedViewer;

  return (
    <div className={`flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm ${className}`}>
      {/* Universal Document Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2 overflow-hidden mr-4">
          <span className="text-sm font-semibold text-slate-700 truncate" title={fileName}>
            {fileName || "Tài liệu"}
          </span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={url}
            download={fileName} // Note: This attribute helps but might be ignored for cross-origin URLs
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all focus:ring-2 focus:ring-slate-200 outline-none shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Tải về</span>
          </a>
        </div>
      </div>

      {/* Viewer Body */}
      <div className="flex-1 relative min-h-0 bg-slate-100/50">
        <Component 
          url={url} 
          fileName={fileName} // Pass fileName if needed (e.g. UnsupportedViewer)
          mimeType={mimeType} // Pass mimeType if needed
          className="h-full border-none rounded-none shadow-none" // Reset internal styles to fit container
        />
      </div>
    </div>
  );
};

export default FileViewer;
