import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { InterviewSkill } from '@/types/interview';

interface DetailedFeedbackProps {
  technicalSkills: InterviewSkill[];
  softSkills: InterviewSkill[];
}

export default function DetailedFeedback({ technicalSkills, softSkills }: DetailedFeedbackProps) {
  const renderFeedbackIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (score >= 50) return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    return <AlertCircle className="w-5 h-5 text-red-500" />;
  };

  const renderFeedbackColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-100 text-emerald-800';
    if (score >= 50) return 'bg-amber-50 border-amber-100 text-amber-800';
    return 'bg-red-50 border-red-100 text-red-800';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 50) return 'Medium';
    return 'Weak';
  };

  const allSkills = [...technicalSkills, ...softSkills];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-6">Đánh giá chi tiết & Cần cải thiện</h3>
      <div className="space-y-4">
        {allSkills.map((comp, idx) => (
          <div key={idx} className={`p-4 rounded-xl border ${renderFeedbackColor(comp.score)}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {renderFeedbackIcon(comp.score)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-2">
                  <h4 className="font-semibold break-words w-full">{comp.skillName}</h4>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-white/50 whitespace-nowrap shrink-0">
                    {getScoreLabel(comp.score)} ({comp.score}/100)
                  </span>
                </div>
                {comp.feedback && (
                  <p className="text-sm mt-2 opacity-90 break-words whitespace-pre-wrap">{comp.feedback}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
