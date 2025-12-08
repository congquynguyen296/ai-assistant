/**
 * LoadingSpinner Component
 *
 * Component hiển thị loading animation với 3 dots bounce theo brand colors
 * Có thể tùy chỉnh message và variant (overlay hoặc inline)
 *
 * @param {string} message - Text hiển thị dưới spinner
 * @param {string} variant - "overlay" (fullscreen) hoặc "inline" (trong container)
 * @param {string} size - "sm" | "md" | "lg" - kích thước của dots
 */

export default function LoadingSpinner({
  message = "Đang tải...",
  variant = "overlay",
  size = "md",
}) {
  // Kích thước dots dựa theo size prop
  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  const dotSize = dotSizes[size] || dotSizes.md;

  // Nếu variant là overlay, hiển thị fullscreen với backdrop
  if (variant === "overlay") {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          {/* 3 dots bounce animation */}
          <div className="flex items-center gap-1.5">
            <div
              className={`${dotSize} bg-indigo-600 rounded-full animate-bounce`}
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className={`${dotSize} bg-purple-600 rounded-full animate-bounce`}
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className={`${dotSize} bg-pink-600 rounded-full animate-bounce`}
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>

          {/* Message */}
          {message && (
            <div className="text-center">
              <p className="text-sm text-slate-700 font-semibold">{message}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Nếu variant là inline, chỉ hiển thị spinner không có backdrop
  return (
    <div className="flex flex-col items-center gap-4">
      {/* 3 dots bounce animation */}
      <div className="flex items-center gap-1.5">
        <div
          className={`${dotSize} bg-indigo-600 rounded-full animate-bounce`}
          style={{ animationDelay: "0ms" }}
        ></div>
        <div
          className={`${dotSize} bg-purple-600 rounded-full animate-bounce`}
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className={`${dotSize} bg-pink-600 rounded-full animate-bounce`}
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>

      {/* Message */}
      {message && (
        <div className="text-center">
          <p className="text-sm text-slate-700 font-semibold">{message}</p>
        </div>
      )}
    </div>
  );
}
