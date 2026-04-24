import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiService";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import MarkdownRenderer from "../common/MarkdownRerender";
import ConfirmModal from "../common/ConfirmModal";
import { toast } from "sonner";
import logo from "../../assets/logo.svg";
import LoadingSpinner from "../common/LoadingSpinner";

const ChatInterface = () => {
  // Define props and state
  const { documentId } = useParams();
  const { user } = useAuth();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState("");

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Handle delete request function
  const handleDeleteRequest = () => {
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete function
  const handleConfirmDelete = async () => {
    setDeleting(true);

    try {
      await aiService.deleteChatHistory(documentId);
      // Clear history state immediately
      setHistory([]);
      // Close modal
      setIsDeleteModalOpen(false);
      // Show success message
      toast.success("Xóa lịch sử chat thành công");
      // Fetch again to ensure sync (should return empty)
      await fetchChatHistory();
    } catch (error) {
      console.error("Xóa lịch sử chat thất bại:", error);
      toast.error("Xóa lịch sử chat không thành công");
    } finally {
      setDeleting(false);
    }
  };

  // Scroll to bottom helper
  const messageEndRef = useRef(null);
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const scrollToBottom = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // String escap regext
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Get chat history func
  const fetchChatHistory = async () => {
    try {
      setInitialLoading(true);
      const response = await aiService.getChatHistory(documentId);
      // Handle both array and object with messages property
      const messages = Array.isArray(response.data)
        ? response.data
        : response.data?.messages || [];
      setHistory(messages);
    } catch (error) {
      console.error("Error fetching chat history:", error);
      setHistory([]);
    } finally {
      setInitialLoading(false);
    }
  };

  // Fetch chat history on mount and when documentId changes
  useEffect(() => {
    if (!documentId) return;
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
        escapeRegExp(userMessage.content),
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
        className={`flex items-end gap-3 my-5 ${
          isUser ? "justify-end" : "justify-start"
        }`}
      >
        {/* 1. AI Avatar (Chỉ hiện bên TRÁI khi KHÔNG phải user) */}
        {!isUser && (
          <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 shadow-lg shadow-emerald-500/15 flex items-center justify-center shrink-0 p-1">
            <img
              src={logo}
              alt="Hyra"
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* 2. Message Bubble (Nội dung tin nhắn) */}
        <div
          className={`max-w-2xl p-4 rounded-2xl shadow-sm backdrop-blur-sm
            ${
              isUser
                ? "bg-linear-to-br from-emerald-500 to-teal-500 text-white rounded-br-md shadow-emerald-500/25"
                : "bg-white/95 border border-slate-200/70 rounded-bl-md shadow-slate-200/70"
            }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{msg.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none prose-slate">
              <MarkdownRenderer content={msg.content} />
            </div>
          )}
          <p
            className={`mt-2 text-[11px] ${
              isUser ? "text-emerald-50/90" : "text-slate-400"
            }`}
          >
            {formatTime(msg.timestamp)}
          </p>
        </div>

        {/* 3. User Avatar (Chỉ hiện bên PHẢI khi LÀ user) */}
        {isUser && (
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-slate-200 to-slate-300 flex items-center justify-center text-slate-700 font-semibold text-sm shrink-0 shadow-sm">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt="User Avatar"
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              "U"
            )}
          </div>
        )}
      </div>
    );
  };

  // Return UI
  if (initialLoading) {
    return (
      <div className="flex flex-col h-[70vh] bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-3xl items-center justify-center shadow-xl shadow-slate-200/50">
        <LoadingSpinner />;
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[72vh] bg-white/90 backdrop-blur-xl border border-slate-200/70 rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200/70 bg-linear-to-r from-white via-emerald-50/40 to-teal-50/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Hyra</h3>
              <p className="text-xs text-slate-500">
                Trò chuyện theo ngữ cảnh tài liệu của bạn
              </p>
            </div>
          </div>
          <button
            onClick={handleDeleteRequest}
            className="shrink-0 h-10 px-3 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl flex items-center gap-2 text-slate-600 hover:text-rose-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Xóa lịch sử chat"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
            <span className="text-xs font-medium">Xóa chat</span>
          </button>
        </div>
      </div>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-6 py-5 bg-linear-to-br from-slate-50/70 via-white to-slate-100/50">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-5 shadow-lg shadow-emerald-200/50">
              <MessageSquare
                className="w-9 h-9 text-emerald-600"
                strokeWidth={2}
              />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Bắt đầu cuộc trò chuyện
            </h3>
            <p className="text-sm text-slate-500 max-w-md">
              Hỏi bất kỳ điều gì liên quan đến tài liệu. AI sẽ trả lời dựa trên
              nội dung đã được phân tích.
            </p>
          </div>
        ) : (
          history.map(renderMessages)
        )}

        {/* Final msg to useRef */}
        <div ref={messageEndRef} />

        {loading && (
          <div className="flex items-center gap-3 my-4">
            <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 flex items-center justify-center shadow-lg shadow-emerald-500/15 p-1">
              <img
                src={logo}
                alt="Hyra"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-200/60 shadow-sm">
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
              <span className="text-xs text-slate-400 ml-1">
                Đang phản hồi...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-5 py-4 border-t border-slate-200/70 bg-white/80">
        <form
          onSubmit={handleSendMessage}
          className="flex items-end gap-3 p-2 rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-100/80"
        >
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              // Nếu nhấn Enter mà KHÔNG nhấn Shift
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault(); // Chặn xuống dòng
                // Kiểm tra nếu có nội dung thì mới submit (để tránh submit rỗng)
                if (message.trim()) {
                  handleSendMessage(e);
                }
              }
            }}
            placeholder="Hỏi bất kỳ điều gì"
            className="flex-1 min-h-12 max-h-36 py-3 px-4 border border-transparent rounded-xl bg-slate-50/70 text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:bg-white focus:border-emerald-200 transition-all duration-200 resize-none overflow-y-auto"
            disabled={loading}
            rows={1}
          />

          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="shrink-0 w-12 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50 text-white disabled:cursor-not-allowed disabled:shadow-none"
            title="Gửi tin nhắn"
          >
            <Send className="" strokeWidth={2} />
          </button>
        </form>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc muốn xóa lịch sử đoạn chat này? Hành động này không thể hoàn tác sau khi được xác nhận."
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deleting}
        icon={Trash2}
        variant="danger"
      />
    </div>
  );
};

export default ChatInterface;
