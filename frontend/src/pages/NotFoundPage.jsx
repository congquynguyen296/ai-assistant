import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileQuestion, Home } from "lucide-react";
import Button from "../components/common/Button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 p-6 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl opacity-40 mix-blend-multiply animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl opacity-40 mix-blend-multiply animate-pulse delay-700"></div>

      <div className="relative w-full max-w-lg">
        <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-xl shadow-slate-200/50 p-10 rounded-3xl text-center transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-100 mb-8 shadow-inner group">
            <FileQuestion
              className="w-12 h-12 text-emerald-500 group-hover:scale-110 transition-transform duration-300"
              strokeWidth={1.5}
            />
          </div>

          <h1 className="text-8xl font-bold tracking-tighter bg-linear-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-2">
            404
          </h1>

          <h2 className="text-2xl font-semibold text-slate-800 mb-4 tracking-tight">
            Không tìm thấy trang
          </h2>

          <p className="text-slate-500 mb-10 max-w-sm mx-auto leading-relaxed text-base font-medium">
            Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển
            đến địa chỉ khác.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate(-1)}
              variant="secondary"
              className="w-full sm:w-auto hover:bg-slate-200/80"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
              Quay lại
            </Button>

            <Button onClick={() => navigate("/")} className="w-full sm:w-auto">
              <Home className="w-4 h-4" strokeWidth={2.5} />
              Về trang chủ
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-400 mt-8 font-medium">
          Một trang web tuyệt vời của Huỳnh Mỹ Huyền
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
