import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Crown,
  Copy,
  MessageSquare,
  Send,
  Sparkles,
  Swords,
  Timer,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import { useAuth } from "@/context/AuthContext";

const INITIAL_PARTICIPANTS = [
  {
    id: "host-1",
    name: "Nguyen Cong Quy",
    role: "host",
    score: 120,
    status: "online",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "u-2",
    name: "Linh",
    role: "member",
    score: 98,
    status: "online",
    avatar:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "u-3",
    name: "Nam",
    role: "member",
    score: 74,
    status: "away",
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=200&auto=format&fit=crop",
  },
  {
    id: "u-4",
    name: "Phuc",
    role: "member",
    score: 52,
    status: "online",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop",
  },
];

const INITIAL_MESSAGES = [
  {
    id: "m-1",
    senderId: "host-1",
    senderName: "Nguyen Cong Quy",
    content: "Moi nguoi khoi dong quiz chuong 3 nha!",
    time: "12:45",
  },
  {
    id: "m-2",
    senderId: "u-2",
    senderName: "Linh",
    content: "Ok, minh da san sang.",
    time: "12:46",
  },
  {
    id: "m-3",
    senderId: "u-3",
    senderName: "Nam",
    content: "Cho 2 phut de mo tai lieu nhe.",
    time: "12:47",
  },
];

const QUIZ_QUESTIONS = [
  {
    id: "q-1",
    question: "Dinh nghia dung nhat ve phan ung oxi hoa - khu la gi?",
    options: [
      "Trao doi proton trong moi truong axit",
      "Trao doi electron giua cac chat",
      "Su chuyen pha tu ran sang long",
      "Su hoa tan chat trong dung moi",
    ],
    correctIndex: 1,
  },
  {
    id: "q-2",
    question: "Chat nao duoi day la chat oxi hoa manh?",
    options: ["NaCl", "H2O", "KMnO4", "CH3OH"],
    correctIndex: 2,
  },
];

const StudyRoomPage = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const messageEndRef = useRef<HTMLDivElement>(null);

  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [draftMessage, setDraftMessage] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  const joinCode = useMemo(() => "HYRA-8231", []);
  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleCopyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(joinCode);
      toast.success("Da sao chep ma phong");
    } catch (error) {
      toast.error("Khong the sao chep ma phong");
    }
  };

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = draftMessage.trim();
    if (!trimmed) return;

    const now = new Date();
    const newMessage = {
      id: `m-${now.getTime()}`,
      senderId: "me",
      senderName: user?.username || "Ban",
      content: trimmed,
      time: now.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setDraftMessage("");
  };

  const handleSelectAnswer = (optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: optionIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const scoreboard = useMemo(() => {
    const seed = participants.map((participant, index) => ({
      ...participant,
      rank: index + 1,
    }));
    return seed.sort((a, b) => b.score - a.score);
  }, [participants]);

  return (
    <div className="min-h-screen relative w-full">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[18px_18px] pointer-events-none z-0" />
      <div className="relative max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <PageHeader
            title="Study Room"
            subTitle={`Phong: ${roomId || "demo"} · Tai lieu: Hoa hoc co ban`}
          />

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleCopyJoinCode}
              className="inline-flex items-center gap-2 px-4 h-11 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all"
            >
              <Copy className="w-4 h-4" />
              Ma phong: {joinCode}
            </button>
            <button className="inline-flex items-center gap-2 px-4 h-11 rounded-xl bg-linear-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 transition-all">
              <Swords className="w-4 h-4" />
              Bat dau quiz
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[300px_minmax(0,1fr)_340px] gap-6">
          <section className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <Users className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Thanh vien
                  </h3>
                  <p className="text-xs text-slate-500">{participants.length} nguoi</p>
                </div>
              </div>

              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200/60 bg-white px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={participant.avatar}
                          alt={participant.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            participant.status === "online"
                              ? "bg-emerald-500"
                              : "bg-amber-400"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {participant.name}
                          </p>
                          {participant.role === "host" && (
                            <Crown className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {participant.status === "online"
                            ? "Dang online"
                            : "Dang tam vang"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {participant.score} diem
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <Timer className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Trang thai phong
                  </h3>
                  <p className="text-xs text-slate-500">Dang cho bat dau</p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Che do</span>
                  <span className="font-semibold text-slate-800">
                    Doi khang realtime
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Vong</span>
                  <span className="font-semibold text-slate-800">
                    1/{QUIZ_QUESTIONS.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Chu de</span>
                  <span className="font-semibold text-slate-800">
                    Hoa hoc co ban
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-col bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/60 bg-linear-to-br from-slate-50/50 to-white/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Chat phong hoc
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thao luan & chia se nhanh
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-linear-to-br from-slate-50/50 via-white/50 to-slate-50/50">
              {messages.map((msg) => {
                const isMe = msg.senderId === "me";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 mb-4 ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isMe && (
                      <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/25 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`max-w-lg p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                        isMe
                          ? "bg-linear-to-br from-emerald-400 to-teal-500 text-white rounded-br-md"
                          : "bg-white border border-slate-200/60 rounded-bl-md"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <span
                          className={`text-xs font-semibold ${
                            isMe ? "text-white/80" : "text-slate-500"
                          }`}
                        >
                          {msg.senderName}
                        </span>
                        <span
                          className={`text-xs ${
                            isMe ? "text-white/70" : "text-slate-400"
                          }`}
                        >
                          {msg.time}
                        </span>
                      </div>
                      <p>{msg.content}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={messageEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="px-5 py-4 border-t border-slate-200/60 bg-white/80 flex items-end gap-3"
            >
              <textarea
                value={draftMessage}
                onChange={(event) => setDraftMessage(event.target.value)}
                placeholder="Nhap tin nhan cho phong hoc..."
                rows={2}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all duration-200 resize-none"
              />
              <button
                type="submit"
                className="shrink-0 w-12 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-all duration-200 text-white"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </section>

          <section className="space-y-6">
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <Swords className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Quiz doi khang
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cau {currentQuestionIndex + 1} / {QUIZ_QUESTIONS.length}
                  </p>
                </div>
              </div>

              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm text-slate-700">
                {currentQuestion.question}
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === index;
                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectAnswer(index)}
                      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextQuestion}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all"
              >
                Cau tiep theo
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Bang xep hang
                  </h3>
                  <p className="text-xs text-slate-500">Cap nhat theo thoi gian</p>
                </div>
              </div>

              <div className="space-y-3">
                {scoreboard.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200/60 bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-linear-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-semibold text-slate-700">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.score} diem
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="text-xs font-semibold text-amber-600">
                        Dan dau
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudyRoomPage;
