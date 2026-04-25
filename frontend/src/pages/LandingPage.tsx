import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  FileText,
  Layers,
  ShieldCheck,
} from "lucide-react";
import Logo from "@/assets/logo.svg";

const LandingPage = () => {
  const featureCards = [
    {
      title: "Tài liệu rõ ràng",
      description: "Tổng hợp nội dung và chia theo chủ đề gợi nhớ.",
      icon: FileText,
      blob: "from-sky-300/80 via-cyan-200/40 to-transparent",
      iconTone: "text-sky-600",
    },
    {
      title: "Flashcard dễ ôn",
      description: "Tạo thẻ ghi nhớ từ nội dung quan trọng, ôn nhanh.",
      icon: BookOpen,
      blob: "from-rose-300/80 via-pink-200/40 to-transparent",
      iconTone: "text-rose-500",
    },
    {
      title: "Quiz đánh giá",
      description: "Kiểm tra nhanh mức độ hiểu, đúng trọng tâm.",
      icon: BrainCircuit,
      blob: "from-emerald-300/80 via-teal-200/40 to-transparent",
      iconTone: "text-emerald-600",
    },
    {
      title: "Bảo mật an toàn",
      description: "Nội dung học tập được lưu trữ an toàn và tin cậy.",
      icon: ShieldCheck,
      blob: "from-amber-300/80 via-orange-200/40 to-transparent",
      iconTone: "text-amber-600",
    },
  ];

  const steps = [
    {
      title: "Tải tài liệu",
      description: "Kéo thả file, Hyra sắp xếp và chuẩn hóa nội dung.",
    },
    {
      title: "Tạo gói học",
      description: "Sinh flashcard và quiz tự động theo nội dung chính.",
    },
    {
      title: "Theo dõi tiến độ",
      description: "Nhìn rõ những phần đã vững và phần cần ôn.",
    },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-linear-to-br from-slate-50 via-white to-slate-50 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-70 pointer-events-none" />
      <div className="absolute inset-0 bg-linear-to-b from-white/70 via-transparent to-white/60 pointer-events-none" />
      <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="absolute top-40 right-6 h-96 w-96 rounded-full bg-sky-300/18 blur-3xl" />
      <div className="absolute bottom-10 left-1/3 h-80 w-80 rounded-full bg-amber-300/18 blur-3xl" />
      <div className="absolute -bottom-24 right-1/4 h-64 w-64 rounded-full bg-teal-300/15 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Hyra" className="h-10 w-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Hyra</p>
              <p className="text-xs text-slate-500">Trợ lý học tập</p>
            </div>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 transition-all"
            >
              Bắt đầu ngay
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </div>
        </header>

        <section className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/80 px-4 py-1 text-xs font-semibold text-slate-600 shadow-sm">
              Nền tảng học tập gọn gàng
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
              Sắp xếp việc học rõ ràng, ôn tập thông minh hơn.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Hyra giúp bạn chuẩn hóa tài liệu, tạo flashcard và quiz, theo dõi tiến độ học theo mục tiêu. Mọi thứ nhẹ nhàng, dễ nhìn, đúng trọng tâm.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition-transform duration-200 hover:-translate-y-0.5"
              >
                Trải nghiệm ngay
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-slate-300"
              >
                Đăng nhập
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Tổng quan hôm nay</p>
                <p className="mt-2 text-xl font-semibold text-slate-900">Nhịp học tập</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <Layers className="h-3.5 w-3.5" />
                3 mục học
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {[
                {
                  label: "Tài liệu đang học",
                  value: "2 bộ tài liệu",
                  detail: "UI hiện đại · Kiến trúc dữ liệu",
                },
                {
                  label: "Flashcard cần ôn",
                  value: "36 thẻ",
                  detail: "Nhóm thẻ khó ưu tiên",
                },
                {
                  label: "Quiz sắp tới",
                  value: "1 bài",
                  detail: "Hoàn thành trước 20:00",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
                >
                  <p className="text-xs font-semibold text-slate-400">{item.label}</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="grid gap-4 rounded-3xl border border-slate-200/60 bg-white/70 p-6 shadow-lg shadow-slate-200/40 backdrop-blur-xl sm:grid-cols-3">
            {[
              { value: "40%", label: "Giảm thời gian chuẩn bị" },
              { value: "3x", label: "Tăng tốc ôn tập" },
              { value: "95%", label: "Duy trì nhịp học" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-18">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase text-emerald-600">
                Tính năng chính
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Đủ dùng, đơn giản, tập trung vào học tập
              </h2>
            </div>
            <Link
              to="/register"
              className="hidden items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 sm:flex"
            >
              Trải nghiệm ngay
              <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {featureCards.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 p-6 shadow-lg shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className={`absolute -top-12 right-4 h-36 w-36 rounded-full bg-linear-to-br ${feature.blob} blur-2xl opacity-90 transition-opacity duration-300 group-hover:opacity-100`}
                />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <feature.icon
                    className={`h-6 w-6 ${feature.iconTone}`}
                    strokeWidth={2}
                  />
                </div>
                <h3 className="relative mt-4 text-lg font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="relative mt-2 text-sm text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-18 grid gap-4 lg:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-md shadow-slate-200/40 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
                  {index + 1}
                </div>
                <p className="text-base font-semibold text-slate-900">
                  {step.title}
                </p>
              </div>
              <p className="mt-3 text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-18">
          <div className="rounded-3xl border border-slate-200/70 bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/30">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-emerald-300">
                  Bắt đầu ngay
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Tạo tài khoản miễn phí trong 1 phút
                </h2>
                <p className="mt-3 text-sm text-emerald-100/80">
                  Thiết lập nhanh, nhẹ nhàng và sẵn sàng học tập.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-slate-900"
                >
                  Bắt đầu miễn phí
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 px-6 py-3 text-sm font-semibold text-white"
                >
                  Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-14 flex flex-col items-center gap-3 text-center text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <img src={Logo} alt="Hyra" className="h-6 w-auto" />
            <span className="text-sm font-semibold text-slate-500">Hyra</span>
          </div>
          <p>Nền tảng học tập gọn gàng, tập trung.</p>
          <p>© 2026 Hyra. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
