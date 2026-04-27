import { useEffect, useState, useRef } from "react";
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
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isMobile =
    typeof navigator !== "undefined" &&
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Dùng PDF.js CDN cho mobile — ổn định hơn Google Docs Viewer
  const getViewerUrl = () => {
    if (!isMobile) return `${url}#toolbar=1&view=FitH`;

    // Option 1: PDF.js hosted (không phụ thuộc Google)
    return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}`;

    // Option 2 (fallback): Google Docs Viewer
    // return `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(url)}&t=${Date.now()}`;
  };

  useEffect(() => {
    setLoading(true);
    setLoadError(false);

    // Timeout dài hơn cho mobile (network chậm hơn)
    const timeout = isMobile ? 8000 : 3000;
    const timer = setTimeout(() => {
      // Nếu iframe vẫn chưa load sau timeout → thử detect lỗi
      try {
        const iframe = iframeRef.current;
        if (iframe) {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          // Nếu blank hoặc có error icon → coi là lỗi
          if (!doc || doc.body?.innerHTML === "") {
            setLoadError(true);
          }
        }
      } catch {
        // Cross-origin block = iframe đang load content bình thường
      }
      setLoading(false);
    }, timeout);

    return () => clearTimeout(timer);
  }, [url, retryCount]);

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
  };

  const viewerUrl = getViewerUrl();

  return (
    <div
      className={`relative w-full h-full min-h-[600px] bg-gray-200 rounded-lg overflow-hidden border border-gray-300 ${className}`}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <Loader2 className="animate-spin text-gray-400" size={32} />
        </div>
      )}

      {/* Error State */}
      {loadError ? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-3">
          <p className="text-gray-600">Không thể hiển thị PDF trực tiếp.</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Thử lại
          </button>
          <button
            onClick={() => window.open(url, "_blank")}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Mở trong tab mới
          </button>
        </div>
      ) : (
        <iframe
          key={`${url}-${retryCount}`} // Force remount on retry
          ref={iframeRef}
          src={viewerUrl}
          className="w-full h-full absolute inset-0 block"
          title="PDF Content"
          onLoad={() => setLoading(false)}
          // onError không fire đáng tin cậy với iframe cross-origin
        />
      )}
    </div>
  );
};

export default PdfViewer;
