import { useMemo, useState } from "react";
import MessageThreadList from "@/components/messages/MessageThreadList";
import MessageConversationPanel from "@/components/messages/MessageConversationPanel";
import { useAuth } from "@/context/AuthContext";

const INITIAL_CONVERSATIONS = [
  {
    id: "conv-1",
    name: "Nhóm Study Squad",
    time: "12:45",
    members: "Bạn, Linh, Nam, Phúc",
    avatar:
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=200&auto=format&fit=crop",
    lastMessage: "Chiều nay học quiz chương 3 nhé!",
  },
  {
    id: "conv-2",
    name: "MyHuyen",
    time: "11:18",
    members: "Online 20 phút trước",
    avatar:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=200&auto=format&fit=crop",
    lastMessage: "Tớ gửi lại notes rồi đó.",
  },
  {
    id: "conv-3",
    name: "Phạm Minh",
    time: "10:32",
    members: "Đang offline",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    lastMessage: "Mai đi thư viện không?",
  },
];

const INITIAL_MESSAGES: Record<string, { id: string; senderId: string; senderName: string; text: string; time: string; }[]> = {
  "conv-1": [
    {
      id: "m1",
      senderId: "friend-1",
      senderName: "Linh",
      text: "Mọi người check lại slide ôn tập nhé.",
      time: "12:41",
    },
    {
      id: "m2",
      senderId: "friend-2",
      senderName: "Nam",
      text: "Tối nay mình làm 20 câu trắc nghiệm chung.",
      time: "12:43",
    },
    {
      id: "m3",
      senderId: "me",
      senderName: "Bạn",
      text: "Ok, mình vào sau 15 phút nhé.",
      time: "12:44",
    },
    {
      id: "m4",
      senderId: "friend-3",
      senderName: "Phúc",
      text: "Chiều nay học quiz chương 3 nhé!",
      time: "12:45",
    },
  ],
  "conv-2": [
    {
      id: "m5",
      senderId: "friend-1",
      senderName: "Nguyễn Linh",
      text: "Tớ gửi lại notes rồi đó.",
      time: "11:18",
    },
  ],
  "conv-3": [
    {
      id: "m6",
      senderId: "friend-2",
      senderName: "Phạm Minh",
      text: "Mai đi thư viện không?",
      time: "10:32",
    },
  ],
};

const MessagePage = () => {
  const { user } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState("conv-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [messagesByConversation, setMessagesByConversation] =
    useState(INITIAL_MESSAGES);

  const filteredConversations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return INITIAL_CONVERSATIONS;

    return INITIAL_CONVERSATIONS.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.lastMessage.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const activeConversation =
    INITIAL_CONVERSATIONS.find((item) => item.id === activeConversationId) ||
    INITIAL_CONVERSATIONS[0];

  const activeMessages = messagesByConversation[activeConversation.id] || [];

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    setIsConversationOpen(true);
  };

  const handleSendMessage = () => {
    const trimmed = draftMessage.trim();
    if (!trimmed) return;

    const now = new Date();
    const newMessage = {
      id: `m-${now.getTime()}`,
      senderId: "me",
      senderName: user?.username || "Bạn",
      text: trimmed,
      time: now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessagesByConversation((prev) => ({
      ...prev,
      [activeConversation.id]: [...(prev[activeConversation.id] || []), newMessage],
    }));
    setDraftMessage("");
  };

  return (
    <div className="-m-6 h-[calc(100vh-4rem)] overflow-hidden bg-white">
      <div className="h-full overflow-hidden flex flex-col lg:flex-row bg-white">
        <MessageThreadList
          currentUser={user}
          conversations={filteredConversations}
          activeConversationId={activeConversation.id}
          onSelectConversation={handleSelectConversation}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isHiddenOnMobile={isConversationOpen}
        />

        <MessageConversationPanel
          activeConversation={activeConversation}
          messages={activeMessages}
          draftMessage={draftMessage}
          onDraftChange={setDraftMessage}
          onSendMessage={handleSendMessage}
          currentUser={{ id: "me", username: user?.username || "Bạn" } as any}
          isOpenOnMobile={isConversationOpen}
          onBack={() => setIsConversationOpen(false)}
        />
      </div>
    </div>
  );
};

export default MessagePage;