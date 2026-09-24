import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LogOut, CheckCircle, Briefcase, Brain } from 'lucide-react';
import InterviewLogSidebar from '@/components/interviews/room/InterviewLogSidebar';
import ActiveQuestionArea from '@/components/interviews/room/ActiveQuestionArea';
import { useInterviews } from '@/hooks/useInterviews';

export default function InterviewRoomPage() {
  const navigate = useNavigate();
  const { interviewId } = useParams();
  const { currentSession, fetchSessionById, chat, finishSession } = useInterviews();

  useEffect(() => {
    if (interviewId && (!currentSession || currentSession._id !== interviewId)) {
      fetchSessionById(interviewId);
    }
  }, [interviewId, currentSession, fetchSessionById]);

  const [inputValue, setInputValue] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const isDragging = useRef(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [currentSession?.messages, isAiTyping]);

  const handleMouseDown = () => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const newWidth = e.clientX;
      if (newWidth > 250 && newWidth < 800) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !interviewId) return;

    setInputValue('');
    setIsAiTyping(true);

    const response = await chat({ sessionId: interviewId, message: inputValue });
    
    setIsAiTyping(false);
    
    if (response?.isFinished) {
      handleFinish();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFinish = async () => {
    if (interviewId) {
      await finishSession(interviewId);
      navigate(`/interviews/${interviewId}/report`);
    }
  };

  const currentInterviewerMessage = currentSession?.messages 
    ? ([...currentSession.messages].reverse().find(m => m.role === 'assistant') as any)
    : undefined;

  return (
    <div className="-m-6 h-[calc(100vh-4rem)] flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Dotted Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none z-0" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 shadow-sm z-10 gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4 max-w-full sm:max-w-[60%] w-full sm:w-auto">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-100 rounded-full flex items-center justify-center border border-emerald-200 overflow-hidden shrink-0">
             <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-bold text-slate-800 text-sm sm:text-base truncate">{currentSession?.blueprint?.title || 'Phỏng vấn'}</h2>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> Technical Interviewer
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full sm:w-auto justify-end border-t border-slate-100 sm:border-0 pt-2 sm:pt-0">
          <button 
            onClick={() => navigate('/interviews')}
            className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Rời khỏi</span>
            <span className="sm:hidden">Thoát</span>
          </button>
          
          {currentSession?.status === 'completed' ? (
            <button 
              onClick={() => navigate(`/interviews/${interviewId}/report`)}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600 rounded-lg transition-colors shadow-sm shadow-emerald-500/25 whitespace-nowrap"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Xem Báo Cáo</span>
            </button>
          ) : (
            <button 
              onClick={handleFinish}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-600 rounded-lg transition-colors shadow-sm shadow-emerald-500/25 whitespace-nowrap"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nộp bài & Đánh giá</span>
              <span className="sm:hidden">Nộp bài</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative z-10">
        <div 
          style={{ width: `${sidebarWidth}px` }} 
          className="hidden lg:block h-full shrink-0"
        >
          <InterviewLogSidebar 
            messages={(currentSession?.messages || []) as any[]} 
            isAiTyping={isAiTyping} 
            chatHistoryRef={chatHistoryRef as any} 
            isCompleted={currentSession?.status === 'completed'}
          />
        </div>
        
        {/* Resize Handle */}
        <div 
          onMouseDown={handleMouseDown}
          className="w-1.5 bg-slate-200 hover:bg-emerald-400 cursor-col-resize transition-colors z-20 h-full hidden lg:block shrink-0"
        />

        {/* Mobile sidebar (full width) */}
        <div className="lg:hidden h-1/3 border-b border-slate-200">
          <InterviewLogSidebar 
            messages={(currentSession?.messages || []) as any[]} 
            isAiTyping={isAiTyping} 
            chatHistoryRef={chatHistoryRef as any} 
            isCompleted={currentSession?.status === 'completed'}
          />
        </div>

        <div className="flex-1 h-full min-w-0 flex flex-col">
          <ActiveQuestionArea 
            currentInterviewerMessage={currentInterviewerMessage}
            isAiTyping={isAiTyping}
            inputValue={inputValue}
            setInputValue={setInputValue}
            handleKeyDown={handleKeyDown}
            handleSendMessage={handleSendMessage}
            isCompleted={currentSession?.status === 'completed'}
          />
        </div>
      </div>
    </div>
  );
}
