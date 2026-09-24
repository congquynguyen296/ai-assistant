import { AlignLeft } from 'lucide-react';
import { InterviewMessage } from '@/types/interview';

interface InterviewLogSidebarProps {
  messages: InterviewMessage[];
  isAiTyping: boolean;
  chatHistoryRef: React.RefObject<HTMLDivElement>;
  isCompleted?: boolean;
}

export default function InterviewLogSidebar({ messages, isAiTyping, chatHistoryRef, isCompleted }: InterviewLogSidebarProps) {
  return (
    <div className="flex w-full h-full bg-slate-50 border-r border-slate-200 flex-col">
      <div className="p-4 border-b border-slate-200 bg-white">
        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
          <AlignLeft className="w-4 h-4" /> Lịch sử phỏng vấn
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={chatHistoryRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <span className="text-xs font-semibold text-slate-400">
              {msg.role === 'assistant' ? 'Interviewer' : 'Bạn'} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className={`text-sm p-3 rounded-xl max-w-[90%] ${
              msg.role === 'assistant' 
                ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                : 'bg-emerald-50 border border-emerald-100 text-emerald-900 rounded-tr-none'
            }`}>
              <p className="line-clamp-3 hover:line-clamp-none transition-all">{msg.content}</p>
            </div>
          </div>
        ))}
        {isAiTyping && (
          <div className="flex flex-col gap-1 items-start">
             <span className="text-xs font-semibold text-slate-400">Interviewer</span>
             <div className="bg-white border border-slate-200 rounded-xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5 w-fit">
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
