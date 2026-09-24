import { BookOpen, Network, BrainCircuit } from "lucide-react";

export const TrustSection = () => {
  return (
    <section className="mt-32 pt-10 border-t border-slate-200/60">
      <p className="text-center text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">
        Được thiết kế để tối ưu hóa hiệu suất
      </p>
      <div className="flex flex-wrap justify-center gap-12 sm:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-700"><BookOpen className="w-6 h-6"/> EduTech</div>
        <div className="flex items-center gap-2 font-bold text-xl text-slate-700"><Network className="w-6 h-6"/> ConnectWork</div>
        <div className="flex items-center gap-2 font-bold text-xl text-slate-700"><BrainCircuit className="w-6 h-6"/> SmartLearn</div>
      </div>
    </section>
  );
};
