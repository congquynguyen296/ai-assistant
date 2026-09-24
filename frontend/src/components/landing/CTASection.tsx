import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="mt-32 mb-10">
      <div className="relative rounded-[3rem] bg-slate-900 px-6 py-20 text-center overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
        
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-6">
            Chinh phục nhà tuyển dụng ngay hôm nay
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl font-medium">
            Tham gia cùng hàng ngàn người dùng đang rèn luyện kỹ năng và nâng cấp kiến thức mỗi ngày. Đừng để cơ hội tuột mất vì thiếu sự chuẩn bị.
          </p>
          <Link
            to="/register"
            className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-white px-10 py-4 text-lg font-bold text-slate-900 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Tạo Tài Khoản Ngay
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};
