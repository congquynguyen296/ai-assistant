import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustSection } from "@/components/landing/TrustSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CTASection } from "@/components/landing/CTASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

const LandingPage = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[24px_24px] opacity-50 pointer-events-none" />
      
      {/* Soft gradient blobs */}
      <div className="absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-emerald-300/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] -right-[10%] h-[600px] w-[600px] rounded-full bg-sky-300/15 blur-[120px] pointer-events-none animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute -bottom-[10%] left-[20%] h-[500px] w-[500px] rounded-full bg-teal-300/15 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-8">
        <LandingNavbar />
        <HeroSection />
        <TrustSection />
        <FeaturesSection />
        <TestimonialsSection />
        <CTASection />
        <LandingFooter />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes reverseOrbit {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes marqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </div>
  );
};

export default LandingPage;
