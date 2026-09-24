import { Sparkles } from "lucide-react";

const testimonials = [
  {
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    name: 'Tuấn Đạt',
    handle: '@tuandat.dev',
    content: 'Hyra giúp mình chuẩn bị phỏng vấn cực tốt. Việc mock interview trực tiếp với AI sát với JD giúp mình tự tin hơn hẳn!'
  },
  {
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    name: 'Mai Phương',
    handle: '@maiphuong_99',
    content: 'Từ ngày dùng Hyra để phân tích tài liệu, thời gian ôn thi của mình giảm đi một nửa. Flashcard tạo tự động quá xịn.'
  },
  {
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
    name: 'Hải Đăng',
    handle: '@haidang.tech',
    content: 'Tính năng tạo câu hỏi trắc nghiệm từ PDF thật sự đột phá. Mình không còn phải cặm cụi tự soạn đề cương nữa.'
  },
  {
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop',
    name: 'Lan Anh',
    handle: '@lananh_hr',
    content: 'Rất thích cách Hyra tổng hợp và liên kết các kiến thức. Giao diện mượt mà và tập trung, đúng thứ mình cần.'
  },
];

const TestimonialCard = ({ card }: { card: typeof testimonials[0] }) => (
  <div className="p-5 rounded-3xl bg-white/80 border border-slate-200/60 mx-4 shadow-lg backdrop-blur-md hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200 transition-all duration-300 w-80 shrink-0 relative overflow-hidden">
      <div className="flex gap-3 relative z-10">
          <img className="size-12 rounded-full border-2 border-white shadow-sm object-cover" src={card.image} alt="User Image" />
          <div className="flex flex-col justify-center">
              <div className="flex items-center gap-1.5">
                  <p className="font-bold text-slate-900 leading-none">{card.name}</p>
                  <svg className="fill-blue-500 w-3.5 h-3.5" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M4.555.72a4 4 0 0 1-.297.24c-.179.12-.38.202-.59.244a4 4 0 0 1-.38.041c-.48.039-.721.058-.922.129a1.63 1.63 0 0 0-.992.992c-.071.2-.09.441-.129.922a4 4 0 0 1-.041.38 1.6 1.6 0 0 1-.245.59 3 3 0 0 1-.239.297c-.313.368-.47.551-.56.743-.213.444-.213.96 0 1.404.09.192.247.375.56.743.125.146.187.219.24.297.12.179.202.38.244.59.018.093.026.189.041.38.039.48.058.721.129.922.163.464.528.829.992.992.2.071.441.09.922.129.191.015.287.023.38.041.21.042.411.125.59.245.078.052.151.114.297.239.368.313.551.47.743.56.444.213.96.213 1.404 0 .192-.09.375-.247.743-.56.146-.125.219-.187.297-.24.179-.12.38-.202.59-.244a4 4 0 0 1 .38-.041c.48-.039.721-.058.922-.129.464-.163.829-.528.992-.992.071-.2.09-.441.129-.922a4 4 0 0 1 .041-.38c.042-.21.125-.411.245-.59.052-.078.114-.151.239-.297.313-.368.47-.551.56-.743.213-.444.213-.96 0-1.404-.09-.192-.247-.375-.56-.743a4 4 0 0 1-.24-.297 1.6 1.6 0 0 1-.244-.59 3 3 0 0 1-.041-.38c-.039-.48-.058-.721-.129-.922a1.63 1.63 0 0 0-.992-.992c-.2-.071-.441-.09-.922-.129a4 4 0 0 1-.38-.041 1.6 1.6 0 0 1-.59-.245A3 3 0 0 1 7.445.72C7.077.407 6.894.25 6.702.16a1.63 1.63 0 0 0-1.404 0c-.192.09-.375.247-.743.56m4.07 3.998a.488.488 0 0 0-.691-.69l-2.91 2.91-.958-.957a.488.488 0 0 0-.69.69l1.302 1.302c.19.191.5.191.69 0z" />
                  </svg>
              </div>
              <span className="text-xs font-medium text-slate-500">{card.handle}</span>
          </div>
      </div>
      <p className="text-sm pt-4 text-slate-700 leading-relaxed font-medium relative z-10">"{card.content}"</p>
      <div className="absolute -bottom-6 -right-6 opacity-5 rotate-12">
          <Sparkles className="w-24 h-24" />
      </div>
  </div>
);

export const TestimonialsSection = () => {
  return (
    <section className="mt-32">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
          Được tin dùng bởi những người không ngừng học hỏi
        </h2>
        <p className="text-slate-600 text-lg">
          Khám phá cách Hyra đã giúp cộng đồng thay đổi phương pháp học tập và tự tin hơn trong sự nghiệp.
        </p>
      </div>

      <div className="w-full mx-auto max-w-[100vw] overflow-hidden relative -mx-6 sm:mx-0 px-6 sm:px-0">
        <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none bg-gradient-to-r from-slate-50 to-transparent"></div>
        <div className="flex transform-gpu w-max py-4 animate-[marqueeScroll_35s_linear_infinite]">
            {[...testimonials, ...testimonials].map((card, index) => (
                <TestimonialCard key={index} card={card} />
            ))}
        </div>
        <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none bg-gradient-to-l from-slate-50 to-transparent"></div>
      </div>

      <div className="w-full mx-auto max-w-[100vw] overflow-hidden relative mt-4 -mx-6 sm:mx-0 px-6 sm:px-0">
        <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none bg-gradient-to-r from-slate-50 to-transparent"></div>
        <div className="flex transform-gpu w-max py-4 animate-[marqueeScroll_40s_linear_infinite] [animation-direction:reverse]">
            {[...testimonials, ...testimonials].map((card, index) => (
                <TestimonialCard key={index} card={card} />
            ))}
        </div>
        <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none bg-gradient-to-l from-slate-50 to-transparent"></div>
      </div>
    </section>
  );
};
