import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, Brain, Briefcase, MessageSquare, Trash2 } from 'lucide-react';
import { InterviewSession } from '@/types/interview';

interface InterviewCardProps {
  interview: InterviewSession;
  onDelete?: (id: string) => void;
}

export default function InterviewCard({ interview, onDelete }: InterviewCardProps) {
  const navigate = useNavigate();

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'job': return <Briefcase className="w-5 h-5 text-blue-500" />;
      case 'knowledge': return <Brain className="w-5 h-5 text-purple-500" />;
      default: return <MessageSquare className="w-5 h-5 text-emerald-500" />;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'job': return 'Phỏng vấn Công việc';
      case 'knowledge': return 'Phỏng vấn Kiến thức';
      case 'cv_only': return 'Phỏng vấn CV';
      case 'jd_only': return 'Phỏng vấn JD Focus';
      default: return 'Phỏng vấn';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-slate-50 rounded-xl">
          {getModeIcon(interview.mode)}
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
          interview.status === 'completed' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
            : 'bg-amber-50 text-amber-700 border border-amber-100'
        }`}>
          {interview.status === 'completed' ? 'Đã hoàn thành' : 'Đang diễn ra'}
        </span>
      </div>
      
      <h3 className="font-semibold text-lg text-slate-800 line-clamp-2 mb-2">
        {(interview.blueprint as any)?.title || getModeLabel(interview.mode)}
      </h3>
      
      <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
        <Clock className="w-4 h-4" />
        <span>{new Date(interview.createdAt).toLocaleDateString('vi-VN')}</span>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-600">
            {interview.messages.filter(m => m.role === 'assistant').length} câu hỏi
          </span>
          {interview.status !== 'completed' && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(interview.id || (interview as any)._id);
              }}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Xóa phiên phỏng vấn"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <button 
          onClick={() => {
            const sessionId = interview.id || (interview as any)._id;
            navigate(`/interviews/${sessionId}/room`);
          }}
          className="flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 group-hover:translate-x-1 transition-transform"
        >
          {interview.status === 'completed' ? 'Xem lại' : 'Tiếp tục'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
