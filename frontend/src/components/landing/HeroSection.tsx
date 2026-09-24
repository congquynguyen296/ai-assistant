import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, BrainCircuit, FileText, Sparkles, Target, CheckCircle2 } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="mt-16 lg:mt-24 grid lg:grid-cols-2 gap-12 items-center">
      <div className="flex flex-col items-start text-left relative z-10 animate-[slideInLeft_0.8s_ease-out]">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 shadow-sm mb-6">
          <Sparkles className="w-4 h-4" />
          Chuẩn bị cho bước tiến sự nghiệp tiếp theo
        </div>
        
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl leading-[1.1]">
          Học tập thông minh. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Tự tin bứt phá.</span>
        </h1>
        
        <p className="mt-6 text-lg sm:text-xl leading-relaxed text-slate-600 font-medium max-w-lg">
          Tổ chức tài liệu học tập, luyện tập phỏng vấn trực tiếp và cải thiện bản thân mỗi ngày. Hyra đồng hành cùng bạn trên con đường chinh phục đỉnh cao sự nghiệp.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            to="/register"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-500/30 transition-all hover:shadow-emerald-500/40 hover:-translate-y-1"
          >
            Trải nghiệm Miễn Phí
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
          </Link>
        </div>
        
        <div className="mt-8 flex items-center gap-4 text-sm font-medium text-slate-500">
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Miễn phí sử dụng</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Không cần thẻ tín dụng</div>
        </div>
      </div>
      
      <div className="relative group mx-auto w-full max-w-md lg:max-w-none lg:w-[500px] h-[500px] animate-[slideInRight_0.8s_ease-out]">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-sky-100 rounded-[2.5rem] transform rotate-3 scale-105 opacity-50 transition-transform duration-700 group-hover:rotate-6" />
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80" 
          alt="Students collaborating" 
          className="relative z-10 w-full rounded-[2.5rem] shadow-2xl object-cover h-[500px] border-4 border-white/50 backdrop-blur-sm transition-transform duration-700 group-hover:scale-[1.02]"
        />
        
        {/* The Orbiting Container */}
        <div className="absolute inset-0 z-20 pointer-events-none origin-center transition-transform animate-[orbit_8s_linear_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running]">
          {/* Badge 1: Interview */}
          <div className="absolute -bottom-4 -left-4 sm:-bottom-12 sm:-left-16 origin-center animate-[reverseOrbit_8s_linear_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running]">
            <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 animate-[bounce_4s_ease-in-out_infinite] w-36 sm:w-48">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="bg-emerald-100 text-emerald-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0"><Target className="w-4 h-4 sm:w-6 sm:h-6" /></div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-sm font-bold text-slate-900 truncate">Mục tiêu</p>
                  <p className="text-[8px] sm:text-xs text-slate-500 font-medium truncate">Đỗ phỏng vấn</p>
                </div>
              </div>
            </div>
          </div>

          {/* Badge 2: Documents */}
          <div className="absolute -top-4 -right-4 sm:-top-12 sm:-right-16 origin-center animate-[reverseOrbit_8s_linear_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running]">
            <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 animate-[bounce_5s_ease-in-out_infinite] w-36 sm:w-48">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="bg-sky-100 text-sky-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0"><FileText className="w-4 h-4 sm:w-6 sm:h-6" /></div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-sm font-bold text-slate-900 truncate">Xử lý 10s</p>
                  <p className="text-[8px] sm:text-xs text-slate-500 font-medium truncate">Hàng ngàn tài liệu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Badge 3: Quizzes */}
          <div className="absolute top-10 -left-6 sm:top-16 sm:-left-24 origin-center animate-[reverseOrbit_8s_linear_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running]">
            <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 animate-[bounce_4.5s_ease-in-out_infinite] w-36 sm:w-48 hidden sm:block">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="bg-indigo-100 text-indigo-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0"><BrainCircuit className="w-4 h-4 sm:w-6 sm:h-6" /></div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-sm font-bold text-slate-900 truncate">Trắc nghiệm</p>
                  <p className="text-[8px] sm:text-xs text-slate-500 font-medium truncate">Điểm TB 9.5+</p>
                </div>
              </div>
            </div>
          </div>

          {/* Badge 4: Flashcards */}
          <div className="absolute bottom-10 -right-6 sm:bottom-16 sm:-right-24 origin-center animate-[reverseOrbit_8s_linear_infinite] [animation-play-state:paused] group-hover:[animation-play-state:running]">
            <div className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-xl border border-slate-100 animate-[bounce_3.5s_ease-in-out_infinite] w-36 sm:w-48 hidden sm:block">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="bg-rose-100 text-rose-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0"><BookOpen className="w-4 h-4 sm:w-6 sm:h-6" /></div>
                <div className="min-w-0">
                  <p className="text-[10px] sm:text-sm font-bold text-slate-900 truncate">500+ Thẻ</p>
                  <p className="text-[8px] sm:text-xs text-slate-500 font-medium truncate">Đã ghi nhớ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
