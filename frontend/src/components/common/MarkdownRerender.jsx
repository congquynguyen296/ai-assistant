import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

// Component nút Copy riêng để xử lý logic state gọn gàng
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
      title="Copy to clipboard"
    >
      {copied ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-emerald-400"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      )}
    </button>
  );
};

const MarkdownRenderer = ({ content }) => {
  return (
    <div className="text-slate-700 leading-7 text-[15px]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // --- Headings ---
          h1: ({ node, ...props }) => (
            <h1
              className="text-2xl md:text-3xl font-bold text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2 tracking-tight"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-xl md:text-2xl font-semibold text-slate-800 mt-8 mb-3 tracking-tight"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-lg md:text-xl font-semibold text-slate-800 mt-6 mb-2"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-base font-semibold text-slate-800 mt-4 mb-2"
              {...props}
            />
          ),

          // --- Text & Lists ---
          p: ({ node, ...props }) => (
            <p className="mb-4 leading-relaxed text-slate-600" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-emerald-600 font-medium hover:text-emerald-700 hover:underline underline-offset-2 transition-colors"
              {...props}
            />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-outside mb-4 ml-5 space-y-1 text-slate-600"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-outside mb-4 ml-5 space-y-1 text-slate-600"
              {...props}
            />
          ),
          li: ({ node, ...props }) => <li className="pl-1" {...props} />,

          // --- Emphasis ---
          strong: ({ node, ...props }) => (
            <strong className="font-semibold text-slate-900" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-emerald-500 pl-4 py-1 my-6 bg-slate-50 text-slate-600 italic rounded-r-lg"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-8 border-slate-200" {...props} />
          ),

          // --- Tables (Quan trọng cho document) ---
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-slate-200 shadow-xs">
              <table
                className="min-w-full divide-y divide-slate-200"
                {...props}
              />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-50" {...props} />
          ),
          tbody: ({ node, ...props }) => (
            <tbody className="divide-y divide-slate-200 bg-white" {...props} />
          ),
          tr: ({ node, ...props }) => (
            <tr className="transition-colors hover:bg-slate-50/50" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap"
              {...props}
            />
          ),

          // --- Code Blocks & Inline Code ---
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");

            if (!inline && match) {
              return (
                <div className="relative group my-6 rounded-xl overflow-hidden shadow-lg border border-slate-200/50">
                  {/* Header giả lập giống macOS */}
                  <div className="flex items-center justify-between px-4 py-2 bg-[#282a36] border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-xs text-slate-400 font-mono opacity-50 lowercase">
                      {match[1]}
                    </span>
                  </div>

                  {/* Nội dung Code */}
                  <SyntaxHighlighter
                    style={dracula}
                    language={match[1]}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: "0 0 0.75rem 0.75rem", // Bo góc dưới
                      padding: "1.5rem",
                      fontSize: "0.9rem",
                    }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>

                  {/* Nút Copy */}
                  <CopyButton text={codeString} />
                </div>
              );
            }

            // Inline code (ví dụ: `const a = 1`)
            return (
              <code
                className="px-1.5 py-0.5 rounded-md bg-slate-100 text-pink-500 font-mono text-[0.9em] border border-slate-200"
                {...props}
              >
                {children}
              </code>
            );
          },

          // --- Images ---
          img: ({ node, ...props }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="rounded-xl shadow-md my-6 max-w-full h-auto border border-slate-100"
              alt={props.alt || "image"}
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
