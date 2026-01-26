import React from "react";
import { FileDown, FileSpreadsheet, ExternalLink } from "lucide-react";

const UnsupportedViewer = ({ url, fileName, mimeType, className = "" }) => {
  const isExcel = mimeType?.includes("spreadsheet") || mimeType?.includes("excel") || fileName?.endsWith(".xlsx");
  
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] bg-gray-50 border border-gray-200 rounded-lg p-8 ${className}`}>
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        {isExcel ? (
          <FileSpreadsheet className="text-green-600" size={32} />
        ) : (
          <FileDown className="text-gray-600" size={32} />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {isExcel ? "Bảng tính Excel" : "File không hỗ trợ xem trước"}
      </h3>
      
      <p className="text-gray-500 text-center max-w-md mb-6">
        {isExcel 
          ? "Để đảm bảo tính chính xác của dữ liệu và công thức, vui lòng tải xuống hoặc mở bằng Google Sheets."
          : `Chúng tôi chưa hỗ trợ xem trực tiếp định dạng này trên trình duyệt.`
        }
      </p>

      <div className="flex gap-3">
        <a 
          href={url}
          download
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-medium transition-all"
        >
          <FileDown size={18} />
          Tải xuống
        </a>
        
        {/* Helper link for Google Sheets (Optional) */}
        {/* If public URL, we could use: `https://docs.google.com/viewer?url=${encodeURIComponent(url)}` 
            But Signed URLs might not work with Google's viewer immediately if IP restricted or short expiry.
        */}
      </div>
    </div>
  );
};

export default UnsupportedViewer;
