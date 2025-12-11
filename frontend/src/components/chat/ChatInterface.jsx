import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import MarkdownRenderer from "../common/MarkdownRerender";

const ChatInterface = () => {
  // Define props and state
  const { documentId } = useParams();
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");
  const messageEndRef = useRef(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // String escap regext
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Fetch chat history on mount and when documentId changes
  useEffect(() => {
    if (!documentId) return;
    
    const fetchChatHistory = async () => {
      try {
        setInitialLoading(true);
        const response = await aiService.getChatHistory(documentId);
        // Handle both array and object with messages property
        const messages = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.messages || []);
        setHistory(messages);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setHistory([]);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchChatHistory();
  }, [documentId]);

  // Scroll to bottom when history changes
  useEffect(() => {
    scrollToBottom();
  }, [history]);

  // Send message handler
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = {
      role: "user",
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    setHistory((prev) => [...prev, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const response = await aiService.chat(
        documentId,
        escapeRegExp(userMessage.content)
      );
      const assistantMessage = {
        role: "assistant",
        content: response.data.answer,
        timestamp: new Date().toISOString(),
        revelantChunks: response.data.relevantChunks || [],
      };
      setHistory((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        role: "assistant",
        content: "Đã có lỗi xảy ra khi gửi tin nhắn.",
        timestamp: new Date().toISOString(),
      };
      setHistory((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Render component
  const renderMessages = (msg, index) => {
    const isUser = msg.role === "user";

    return (
      <div
        key={index}
        className={`flex items-start gap-3 my-4 ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        {/* 1. AI Avatar (Chỉ hiện bên TRÁI khi KHÔNG phải user) */}
        {!isUser && (
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
        )}

        {/* 2. Message Bubble (Nội dung tin nhắn) */}
        <div
          className={`max-w-lg p-4 rounded-2xl shadow-sm
            ${
              isUser
                ? "bg-linear-to-br from-emerald-400 to-teal-500 text-white rounded-br-md"
                : "bg-white border border-slate-200/60 rounded-bl-md"
            }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{msg.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-slate">
              <MarkdownRenderer content={msg.content} />
            </div>
          )}
        </div>

        {/* 3. User Avatar (Chỉ hiện bên PHẢI khi LÀ user) */}
        {isUser && (
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 font-semibold text-sm shrink-0 shadow-sm">
            {(user?.username?.charAt(0) || "U").toUpperCase()}
          </div>
        )}
      </div>
    );
  };

  // Return UI
  if (initialLoading) {
    return (
      <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl items-center justify-center shadow-xl shadow-slate-200/50">
        <div className="w-14 h-14 flex items-center justify-center bg-linear-to-br from-emerald-100 to-teal-100 rounded-2xl ">
          <MessageSquare className="w-7 h-7 text-emerald-600" strokeWidth={2} />
        </div>
        <p className="text-sm text-slate-500 mt-3 font-medium">
          Đang tải nội dung đoạn chat...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl p-6 shadow-xl shadow-slate-200/50 overflow-hidden">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto p-6 bg-linear-to-br from-slate-50/50 via-white/50 to-slate-50/50">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 shadow-lg shadow-emerald-200/50">
              <MessageSquare
                className="w-8 h-8 text-emerald-600"
                strokeWidth={2}
              />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              Bắt đầu cuộc trò chuyện
            </h3>
            <p className="text-sm text-slate-500">Embee một ngày tốt lành</p>
          </div>
        ) : (
          history.map(renderMessages)
        )}

        {/* Final msg to useRef */}
        <div ref={messageEndRef} />

        {loading && (
          <div className="flex items-center gap-3 my-4">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-200/60">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-5 border-t border-slate-200/60 bg-white/80">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hỏi bất kỳ điều gì trong tài liệu"
            className="flex-1 h-12 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all duration-200"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="shink-0 w-12 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50 text-white disabled:cursor-not-allowed"
          >
            <Send className="" strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
