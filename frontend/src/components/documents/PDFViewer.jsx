import React from "react";
import { DoorOpen } from "lucide-react";

const PDFViewer = ({ pdfUrl }) => {
  return (
    <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300">
        <span className="text-sm text-gray-700 font-medium">
          Tài liệu chi tiết
        </span>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <DoorOpen size={16} />
          Mở trong cửa sổ mới
        </a>
      </div>

      <div className="bg-gray-100 p-1">
        <iframe
          src={pdfUrl}
          className="w-full h-[70vh] bg-white rounded border border-gray-300"
          title="PDF Viewer"
          style={{ colorScheme: "light" }}
          frameBorder="0"
        ></iframe>
      </div>
    </div>
  );
};

export default PDFViewer;
