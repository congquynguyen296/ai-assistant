import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import InterviewCard from '@/components/interviews/list/InterviewCard';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useInterviews } from '@/hooks/useInterviews';

export default function InterviewListPage() {
  const navigate = useNavigate();
  const { sessions, loading, fetchSessions, deleteSession } = useInterviews();
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleDeleteConfirm = async () => {
    if (!sessionToDelete) return;
    setIsDeleting(true);
    await deleteSession(sessionToDelete);
    setIsDeleting(false);
    setSessionToDelete(null);
  };

  return (
    <div className="relative min-h-full w-full">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none z-0"></div>
      <div className="relative z-10 container max-w-5xl mx-auto py-8 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Phỏng Vấn</h1>
          <p className="text-slate-500 mt-1">Luyện tập phỏng vấn với Hyra dựa trên JD và CV của bạn</p>
        </div>
        <button
          onClick={() => navigate('/interviews/setup')}
          className="inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30 h-11 px-5 text-sm w-full sm:w-auto"
        >
          <Plus className="w-5 h-5" />
          <span>Bắt đầu phiên mới</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.length > 0 ? (
            sessions.map((interview) => (
              <InterviewCard key={interview._id} interview={interview as any} onDelete={(id) => setSessionToDelete(id)} />
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-500 mb-4">Bạn chưa có phiên phỏng vấn nào.</p>
              <button
                onClick={() => navigate('/interviews/setup')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" /> Bắt đầu luyện tập ngay
              </button>
            </div>
          )}
        </div>
      )}
      </div>

      <ConfirmModal
        isOpen={!!sessionToDelete}
        onClose={() => setSessionToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Xóa phiên phỏng vấn"
        message="Bạn có chắc chắn muốn xóa phiên phỏng vấn này? Hành động này không thể hoàn tác."
        isLoading={isDeleting}
        icon={Trash2}
      />
    </div>
  );
}
