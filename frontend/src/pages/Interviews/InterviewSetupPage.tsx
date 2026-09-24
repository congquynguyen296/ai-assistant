import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Brain, FileText, ChevronRight, Settings, Loader2, ArrowRight } from 'lucide-react';

import JobInterviewSetup from '@/components/interviews/setup/JobInterviewSetup';
import KnowledgeSetup from '@/components/interviews/setup/KnowledgeSetup';
import CVDeepDiveSetup from '@/components/interviews/setup/CVDeepDiveSetup';
import JDOnlySetup from '@/components/interviews/setup/JDOnlySetup';

import { useInterviews } from '@/hooks/useInterviews';

type InterviewModeType = 'job' | 'knowledge' | 'cv_only' | 'jd_only' | null;

export default function InterviewSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [mode, setMode] = useState<InterviewModeType>(null);
  const [level, setLevel] = useState<string>('Junior/Middle');
  const [setupParams, setSetupParams] = useState<{ documentIds?: string[]; customText?: string; topicName?: string }>({});
  
  const { setupSession, currentSession, loading: isGenerating } = useInterviews();

  const handleGenerateBlueprint = async () => {
    if (!mode) return;
    
    await setupSession({
      mode,
      level,
      ...setupParams
    });
  };

  const handleStartInterview = () => {
    if (currentSession?._id) {
      navigate(`/interviews/${currentSession._id}/room`);
    }
  };

  const renderSetupForm = () => {
    switch (mode) {
      case 'knowledge':
        return <KnowledgeSetup onChange={setSetupParams} />;
      case 'jd_only':
        return <JDOnlySetup onChange={setSetupParams} />;
      case 'cv_only':
        return <CVDeepDiveSetup onChange={setSetupParams} />;
      case 'job':
        return <JobInterviewSetup onChange={setSetupParams} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative h-full flex flex-col bg-slate-50/50">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0" />
      <div className="container max-w-7xl mx-auto py-8 px-4 flex-1 flex flex-col relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => step === 2 ? setStep(1) : navigate('/interviews')}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors bg-white/50"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Thiết lập Phỏng vấn</h1>
            <p className="text-slate-500 mt-1">Cấu hình buổi phỏng vấn mô phỏng của bạn</p>
          </div>
        </div>

        <div className="flex-1 bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Progress bar */}
        <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>1</div>
            <span className={`font-medium ${step >= 1 ? 'text-slate-800' : 'text-slate-500'}`}>Chọn Chế độ</span>
            
            <div className="w-8 h-[2px] bg-slate-200 mx-2"></div>
            
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>2</div>
            <span className={`font-medium ${step >= 2 ? 'text-slate-800' : 'text-slate-500'}`}>Tài liệu & Kế hoạch</span>
          </div>
        </div>

        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Bạn muốn luyện tập điều gì hôm nay?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('knowledge')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${mode === 'knowledge' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'}`}
                >
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg mb-2">Knowledge Focus</h3>
                  <p className="text-slate-500 text-sm">Kiểm tra kiến thức chuyên sâu về một chủ đề kỹ năng (Trending Skills).</p>
                </button>

                <button
                  disabled
                  onClick={() => setMode('jd_only')}
                  className="p-6 rounded-2xl border-2 text-left transition-all border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed relative overflow-hidden group"
                >
                  <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 text-xs px-2 py-1 rounded-md font-medium">Sắp ra mắt</div>
                  <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center mb-4 grayscale opacity-70">
                    <Settings className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg mb-2">JD Focus</h3>
                  <p className="text-slate-500 text-sm">Phỏng vấn bám sát yêu cầu từ Job Description bạn cung cấp.</p>
                </button>

                <button
                  disabled
                  onClick={() => setMode('cv_only')}
                  className="p-6 rounded-2xl border-2 text-left transition-all border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed relative overflow-hidden group"
                >
                  <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 text-xs px-2 py-1 rounded-md font-medium">Sắp ra mắt</div>
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4 grayscale opacity-70">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg mb-2">CV Deep Dive</h3>
                  <p className="text-slate-500 text-sm">Đào sâu vào kinh nghiệm và các dự án bạn đã nêu trong CV.</p>
                </button>

                <button
                  disabled
                  onClick={() => setMode('job')}
                  className="p-6 rounded-2xl border-2 text-left transition-all border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed relative overflow-hidden group"
                >
                  <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 text-xs px-2 py-1 rounded-md font-medium">Sắp ra mắt</div>
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 grayscale opacity-70">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-lg mb-2">Job Interview</h3>
                  <p className="text-slate-500 text-sm">Phỏng vấn toàn diện kết hợp cả JD cụ thể và CV của bạn.</p>
                </button>
              </div>

              <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
                <button
                  disabled={!mode}
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <span>Tiếp tục</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 max-w-3xl mx-auto">
              
              {/* Render specific setup component based on mode */}
              {renderSetupForm()}

              {!currentSession?.blueprint && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mt-8">
                  <h3 className="font-semibold text-slate-800 mb-4">Chọn cấp độ phỏng vấn</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Intern/Fresher', 'Junior/Middle', 'Senior'].map((l) => (
                      <button
                        key={l}
                        onClick={() => setLevel(l)}
                        className={`py-3 px-4 rounded-xl border-2 font-medium text-sm transition-all ${
                          level === l 
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                            : 'border-slate-200 text-slate-600 hover:border-emerald-200 hover:bg-slate-50'
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!currentSession?.blueprint && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 text-center mt-8">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-700 mb-2">Tạo cấu trúc phỏng vấn</h3>
                  <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                    Hyra sẽ phân tích các thông tin bạn cung cấp để tạo ra một bản Blueprint (kế hoạch phỏng vấn) được cá nhân hóa.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                    <button
                      onClick={() => setStep(1)}
                      className="inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 hover:bg-slate-200 text-slate-700 bg-slate-100 h-11 px-5 text-sm w-full sm:w-auto"
                    >
                      <span>Quay lại</span>
                    </button>
                    <button
                      onClick={() => handleGenerateBlueprint()}
                      disabled={isGenerating}
                      className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30 h-11 px-5 text-sm w-full sm:w-auto"
                    >
                      {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings className="w-5 h-5" />}
                      <span>{isGenerating ? 'Đang phân tích...' : 'Tạo Blueprint'}</span>
                    </button>
                  </div>
                </div>
              )}

              {currentSession?.blueprint && (
                <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-sm mt-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 mb-1">Interview Blueprint</h3>
                      <p className="text-sm text-slate-500">
                        <span className="font-semibold text-slate-700">{currentSession.blueprint.title}</span>
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
                      {currentSession.blueprint.recommendedMaxQuestions} Câu hỏi
                    </span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Focus Areas</h4>
                    <ul className="space-y-3">
                      {currentSession.blueprint.focusAreas?.map((area: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                          <span className="text-sm text-slate-700">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={handleStartInterview}
                      className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all hover:shadow-lg hover:shadow-emerald-500/20 font-bold"
                    >
                      <span>Bắt đầu Phỏng vấn</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
