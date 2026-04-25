import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Standard PDF Viewer using native Embed/Iframe.
 * Why Native?
 * 1. Performance: Uses browser's highly optimized PDF rendering engine.
 * 2. Features: Built-in Search (Ctrl+F), Zoom, Print, Pagination.
 * 3. Bundle Size: Zero JS overhead compared to PDF.js.
 */
interface PdfViewerProps {
  url: string;
  className?: string;
}

const PdfViewer = ({ url, className = "" }: PdfViewerProps) => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // Auto-hide loader after 2s if iframe doesn't report load (common with iframes)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [url]);

  return (
    <div className={`relative w-full h-full min-h-[600px] bg-gray-200 rounded-lg overflow-hidden border border-gray-300 ${className}`}>
      
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      )}

      {/* Fallback for Error */}
      {loadError ? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <p className="text-gray-600 mb-4">Không thể hiển thị PDF trực tiếp.</p>
          <button 
            onClick={() => window.open(url, '_blank')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Mở trong tab mới
          </button>
        </div>
      ) : (
        <iframe
          src={`${url}#toolbar=1&view=FitH`} // Parameters to optimize view
          className="w-full h-full absolute inset-0 block"
          title="PDF Content"
          onLoad={() => setLoading(false)}
          onError={() => setLoadError(true)}
        />
      )}
    </div>
  );
};

export default PdfViewer;
