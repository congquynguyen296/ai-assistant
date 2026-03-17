import { Search, MoreVertical, MessageCircle } from "lucide-react";

const MessageThreadList = ({
  currentUser,
  conversations,
  activeConversationId,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  isHiddenOnMobile = false,
}) => {
  return (
    <section
      className={`w-full h-full lg:w-1/5 bg-white/95 border-b lg:border-b-0 lg:border-r border-slate-200/70 flex flex-col min-h-0 ${
        isHiddenOnMobile ? "hidden lg:flex" : "flex"
      }`}
    >
      <div className="px-4 py-3 border-b border-slate-200/70 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-semibold shadow-md shadow-emerald-500/20">
            {(currentUser?.username?.charAt(0) || "U").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">
              {currentUser?.username || "Bạn"}
            </p>
            <p className="text-xs text-slate-500 truncate">Tin nhắn cá nhân</p>
          </div>
        </div>

        <button
          type="button"
          className="w-9 h-9 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <MoreVertical className="w-4 h-4 mx-auto" />
        </button>
      </div>

      <div className="px-3 py-3 border-b border-slate-200/70 bg-white">
        <label className="relative block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm kiếm hoặc bắt đầu chat mới"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 transition-all"
          />
        </label>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              Không tìm thấy hội thoại
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Thử từ khóa khác để tiếp tục
            </p>
          </div>
        ) : (
          conversations.map((conversation) => {
            const isActive = activeConversationId === conversation.id;
            return (
              <button
                key={conversation.id}
                type="button"
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 flex items-center gap-3 transition-colors ${
                  isActive
                    ? "bg-emerald-50/70 border-l-4 border-l-emerald-500"
                    : "hover:bg-slate-50"
                }`}
              >
                <img
                  src={conversation.avatar}
                  alt={conversation.name}
                  className="w-12 h-12 rounded-full object-cover shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {conversation.name}
                    </p>
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">
                      {conversation.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
};

export default MessageThreadList;
