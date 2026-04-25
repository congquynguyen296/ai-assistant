import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import { Loader2, AlertCircle } from "lucide-react";

/**
 * Render DOCX file client-side using docx-preview
 * Requires Supabase Bucket CORS to be configured!
 */
interface DocxViewerProps {
  url: string;
  className?: string;
}

const DocxViewer = ({ url, className = "" }: DocxViewerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const renderDocx = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch data as Blob
        const response = await fetch(url);
        if (!response.ok) throw new Error("Không thể tải file DOCX");
        const blob = await response.blob();

        if (!active) return;

        // 2. Render to container
        if (containerRef.current) {
          containerRef.current.innerHTML = ""; // Clear old content
          await renderAsync(blob, containerRef.current, containerRef.current, {
            className: "docx-viewer-content", // Custom class for styling
            inWrapper: false, // Don't wrap via library, we handle it
            ignoreWidth: false,
            ignoreHeight: false, 
            breakPages: true, // Show page breaks
            useBase64URL: true, // Safe for images
            experimental: true,
          });
        }
      } catch (err) {
        if (active) {
          console.error("Docx render error:", err);
          setError("Không thể hiển thị nôi dung file này.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (url) {
      renderDocx();
    }

    return () => {
      active = false;
    };
  }, [url]);

  return (
    <div className={`relative bg-gray-100 min-h-[400px] flex flex-col ${className}`}>
      {/* Loading State */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-600" size={32} />
            <span className="text-sm text-gray-500">Đang xử lý giao diện Word...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50">
          <AlertCircle className="text-red-500 mb-2" size={32} />
          <p className="text-gray-700 font-medium">{error}</p>
          <a 
            href={url} 
            download 
            className="mt-4 text-sm text-blue-600 hover:underline"
          >
            Tải xuống để xem
          </a>
        </div>
      )}

      {/* Document Content */}
      <div 
        ref={containerRef} 
        className="w-full h-full overflow-auto p-4 md:p-8 bg-gray-100 docx-wrapper shadow-inner"
        style={{ minHeight: '600px' }}
      >
        {/* Docx renders here */}
      </div>

      <style>{`
        /* Minimal styles to make docx look like pages */
        .docx-wrapper .docx_page {
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          margin-left: auto;
          margin-right: auto;
          padding: 2rem !important; /* Force padding */
        }
      `}</style>
    </div>
  );
};

export default DocxViewer;
