import React from 'react';
import { Check } from 'lucide-react';
import { InterviewMessage } from '@/types/interview';
import MarkdownRerender from '@/components/common/MarkdownRerender';

interface ActiveQuestionAreaProps {
  currentInterviewerMessage?: InterviewMessage;
  isAiTyping: boolean;
  inputValue: string;
  setInputValue: (val: string) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleSendMessage: () => void;
  isCompleted?: boolean;
}

export default function ActiveQuestionArea({
  currentInterviewerMessage,
  isAiTyping,
  inputValue,
  setInputValue,
  handleKeyDown,
  handleSendMessage,
  isCompleted
}: ActiveQuestionAreaProps) {
  return (
    <div className="flex-1 flex flex-col bg-white h-full">
      {/* Active Question Display */}
      <div className="flex-none p-6 md:p-8 bg-emerald-50/30 border-b border-slate-100">
         <div className="max-w-3xl mx-auto">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-full mb-4">Câu hỏi hiện tại</span>
            {isAiTyping ? (
              <div className="animate-pulse flex flex-col gap-3">
                <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              </div>
            ) : (
              <div className="prose prose-lg text-slate-800 font-medium">
                <MarkdownRerender content={currentInterviewerMessage?.content || ''} />
              </div>
            )}
         </div>
      </div>

      {/* Answer Input Area - Hide if completed */}
      {!isCompleted ? (
        <div className="flex-1 p-6 md:p-8 flex flex-col">
          <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
            <div className="flex justify-between items-end mb-3">
              <label className="font-semibold text-slate-700 text-sm">Câu trả lời của bạn</label>
              <span className="text-xs text-slate-400">Hỗ trợ Markdown • Ctrl + Enter để gửi</span>
            </div>
            
            <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all bg-white flex flex-col">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isAiTyping}
                  placeholder="Viết câu trả lời của bạn ở đây một cách cẩn thận và chi tiết..."
                  className="flex-1 w-full resize-none p-5 outline-none text-slate-700 leading-relaxed disabled:bg-slate-50 disabled:opacity-70"
                />
                
                <div className="bg-slate-50 border-t border-slate-200 p-3 flex justify-between items-center">
                  <div className="text-xs text-slate-500">
                    Độ dài: {inputValue.length} ký tự
                  </div>
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isAiTyping}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                  >
                    <Check className="w-4 h-4" />
                    <span>Gửi câu trả lời</span>
                  </button>
                </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center">
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center max-w-md">
            <h3 className="font-semibold text-emerald-800 mb-2">Buổi phỏng vấn đã kết thúc</h3>
            <p className="text-emerald-600 text-sm">
              Bạn có thể xem lại lịch sử trò chuyện ở cột bên trái hoặc nhấn nút "Xem Báo Cáo" ở góc phải màn hình để xem chi tiết kết quả.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
