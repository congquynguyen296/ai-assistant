import { MessageSquare, FileText, Target, BookOpen } from "lucide-react";

const featureCards = [
  {
    title: "Phỏng Vấn Thực Chiến",
    description: "Mô phỏng buổi phỏng vấn 1-1 chuyên nghiệp. Câu hỏi được thiết kế riêng biệt dựa trên CV và vị trí bạn ứng tuyển.",
    icon: MessageSquare,
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=600&q=80",
    blob: "from-emerald-400/20 to-teal-300/20",
    iconTone: "text-emerald-600",
    bgTone: "bg-emerald-50",
  },
  {
    title: "Phân Tích Tài Liệu Tốc Độ",
    description: "Chắt lọc và tóm tắt kiến thức từ hàng trăm trang tài liệu trong tích tắc. Tiết kiệm 80% thời gian nghiên cứu.",
    icon: FileText,
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&h=600&q=80",
    blob: "from-sky-400/20 to-cyan-300/20",
    iconTone: "text-sky-600",
    bgTone: "bg-sky-50",
  },
  {
    title: "Bộ Câu Hỏi Trắc Nghiệm",
    description: "Tự động sinh ra các bài kiểm tra trắc nghiệm từ nội dung tài liệu. Đánh giá chính xác mức độ hiểu bài của bạn.",
    icon: Target,
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&h=600&q=80",
    blob: "from-indigo-400/20 to-violet-300/20",
    iconTone: "text-indigo-600",
    bgTone: "bg-indigo-50",
  },
  {
    title: "Thẻ Ghi Nhớ Thông Minh",
    description: "Lưu trữ các khái niệm quan trọng dưới dạng thẻ ghi nhớ (Flashcard). Tiện lợi để bạn ôn tập nhanh mọi lúc mọi nơi.",
    icon: BookOpen,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&h=600&q=80",
    blob: "from-rose-400/20 to-pink-300/20",
    iconTone: "text-rose-600",
    bgTone: "bg-rose-50",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="mt-32">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-4">
          Không chỉ là lưu trữ, đây là một môi trường rèn luyện
        </h2>
        <p className="text-slate-600 text-lg">
          Quy trình khép kín từ lúc bạn tiếp thu kiến thức mới đến khi bạn ngồi vào ghế phỏng vấn thực sự.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {featureCards.map((feature, idx) => (
          <div
            key={idx}
            className="group flex flex-col sm:flex-row overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white/80 shadow-lg shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200"
          >
            {/* Image side */}
            <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.blob} mix-blend-multiply z-10 opacity-60 group-hover:opacity-30 transition-opacity duration-300`} />
              <img 
                src={feature.image} 
                alt={feature.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            
            {/* Content side */}
            <div className="sm:w-3/5 p-6 sm:p-8 flex flex-col justify-center">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.bgTone} mb-4`}>
                <feature.icon
                  className={`h-6 w-6 ${feature.iconTone}`}
                  strokeWidth={2.5}
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
