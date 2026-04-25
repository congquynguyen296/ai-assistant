import {
  ArrowLeft,
  Paperclip,
  Search,
  MoreVertical,
  Smile,
  Mic,
  SendHorizonal,
} from "lucide-react";
import type { User } from "@/types/models";
import type { Conversation } from "@/components/messages/MessageThreadList";

export interface ChatMessageItem {
  id: string;
  text: string;
  time: string;
  senderId: string;
  senderName: string;
}

interface MessageConversationPanelProps {
  activeConversation: Conversation;
  messages: ChatMessageItem[];
  draftMessage: string;
  onDraftChange: (draft: string) => void;
  onSendMessage: () => void;
  currentUser: User;
  isOpenOnMobile?: boolean;
  onBack: () => void;
}

const MessageConversationPanel = ({
  activeConversation,
  messages,
  draftMessage,
  onDraftChange,
  onSendMessage,
  currentUser,
  isOpenOnMobile = false,
  onBack,
}: MessageConversationPanelProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendMessage();
  };

  return (
    <section
      className={`w-full h-full lg:w-4/5 flex-col bg-[#f8f6f3] min-h-0 ${
        isOpenOnMobile ? "flex" : "hidden lg:flex"
      }`}
    >
      <div className="px-4 py-3 border-b border-slate-200/70 bg-slate-50/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors lg:hidden"
          >
            <ArrowLeft className="w-4 h-4 mx-auto" />
          </button>
          <img
            src={activeConversation.avatar}
            alt={activeConversation.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {activeConversation.name}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {activeConversation.members}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <button
            type="button"
            className="w-9 h-9 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Search className="w-4 h-4 mx-auto" />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Paperclip className="w-4 h-4 mx-auto" />
          </button>
          <button
            type="button"
            className="w-9 h-9 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <MoreVertical className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 bg-[linear-gradient(120deg,#f3efea,#f8f6f3,#f0ede8)]">
        <div className="flex justify-center mb-4">
          <p className="text-[11px] uppercase tracking-wider text-slate-600 bg-white/70 border border-slate-200 rounded-full px-3 py-1">
            Hôm nay
          </p>
        </div>

        {messages.map((message) => {
          const isMe = message.senderId === ((currentUser as any).id || (currentUser as any)._id);
          return (
            <div
              key={message.id}
              className={`flex mb-2 ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[65%] rounded-2xl px-3 py-2 shadow-sm ${
                  isMe
                    ? "bg-linear-to-r from-emerald-400 to-teal-500 text-white rounded-br-md"
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-md"
                }`}
              >
                {!isMe && (
                  <p className="text-[11px] font-semibold text-emerald-700 mb-1">
                    {message.senderName}
                  </p>
                )}
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p
                  className={`text-[11px] mt-1 text-right ${
                    isMe ? "text-emerald-50/90" : "text-slate-400"
                  }`}
                >
                  {message.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-4 py-3 bg-white/90 border-t border-slate-200/70 flex items-center gap-2"
      >
        <button
          type="button"
          className="w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Smile className="w-5 h-5 mx-auto" />
        </button>

        <input
          value={draftMessage}
          onChange={(e) => onDraftChange(e.target.value)}
          placeholder="Nhắn tin cho bạn bè..."
          className="flex-1 h-11 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 transition-all"
        />

        {draftMessage.trim() ? (
          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            <SendHorizonal className="w-5 h-5 mx-auto" />
          </button>
        ) : (
          <button
            type="button"
            className="w-10 h-10 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Mic className="w-5 h-5 mx-auto" />
          </button>
        )}
      </form>
    </section>
  );
};

export default MessageConversationPanel;
