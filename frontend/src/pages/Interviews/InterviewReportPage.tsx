import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ReportSummary from '@/components/interviews/report/ReportSummary';
import SoftSkillsChart from '@/components/interviews/report/SoftSkillsChart';
import TechnicalRadarChart from '@/components/interviews/report/TechnicalRadarChart';
import DetailedFeedback from '@/components/interviews/report/DetailedFeedback';
import { useInterviews } from '@/hooks/useInterviews';

export default function InterviewReportPage() {
  const navigate = useNavigate();
  const { interviewId } = useParams();
  const { currentSession, fetchSessionById, loading } = useInterviews();

  useEffect(() => {
    if (interviewId && (!currentSession || currentSession._id !== interviewId)) {
      fetchSessionById(interviewId);
    }
  }, [interviewId, currentSession, fetchSessionById]);

  const report = currentSession?.report;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy báo cáo hoặc phiên phỏng vấn chưa kết thúc</h2>
        <button onClick={() => navigate('/interviews')} className="mt-4 text-emerald-600 font-medium">Quay lại danh sách</button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/interviews')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Báo Cáo Đánh Giá Phỏng Vấn</h1>
          <p className="text-slate-500 mt-1">Phân tích chi tiết năng lực và gợi ý cải thiện</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Summary & Soft Skills */}
        <div className="lg:col-span-1 space-y-6">
          <ReportSummary 
            report={report as any} 
            sessionData={currentSession}
          />
          <SoftSkillsChart skills={report.softSkills || []} />
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <TechnicalRadarChart skills={report.technicalSkills || []} />
          <DetailedFeedback 
            technicalSkills={report.technicalSkills || []} 
            softSkills={report.softSkills || []}
          />
        </div>
      </div>
    </div>
  );
}
