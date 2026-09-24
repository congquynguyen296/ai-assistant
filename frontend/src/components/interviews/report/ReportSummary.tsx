import { Award, Clock, FileText } from 'lucide-react';
import { InterviewReport, InterviewSessionData } from '@/types/interview';

interface ReportSummaryProps {
  report: InterviewReport;
  sessionData: InterviewSessionData;
}

export default function ReportSummary({ report, sessionData }: ReportSummaryProps) {
  const duration = sessionData.createdAt && sessionData.updatedAt
    ? Math.round((new Date(sessionData.updatedAt).getTime() - new Date(sessionData.createdAt).getTime()) / 60000)
    : 0;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Award className="w-5 h-5 text-emerald-600" />
        Tổng quan
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-500 mb-1">Điểm đánh giá tổng quát</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-emerald-600">{report.overallScore}</span>
            <span className="text-sm text-slate-500">/ 100</span>
          </div>
        </div>
        <div className="flex justify-between items-center py-3 border-y border-slate-100">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">Thời lượng</span>
          </div>
          <span className="font-semibold text-slate-800">{duration > 0 ? `${duration} phút` : 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">Số câu hỏi</span>
          </div>
          <span className="font-semibold text-slate-800">{sessionData.messages?.filter(m => m.role === 'assistant').length || 0} câu</span>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Nhận xét chung</h4>
        <p className="text-sm text-blue-700 leading-relaxed break-words whitespace-pre-wrap">
          {report.overallFeedback}
        </p>
      </div>
    </div>
  );
}
