import PageHeader from "@/components/common/PageHeader";
import { Zap, Star, Shield } from "lucide-react";
import PaymentCard from "../../components/payment/PaymentCard";

const PaymentPage = () => {
  const plans = [
    {
      name: "Cơ bản",
      description: "Dành cho người mới bắt đầu",
      price: "0đ",
      period: "trọn đời",
      icon: <Star size={24} />,
      features: [
        "Tải lên tối đa 3 tài liệu/ngày",
        "Tạo Flashcard cơ bản", 
        "Tạo Quiz trắc nghiệm",
        "Lưu trữ 100MB",
        "Hỗ trợ cộng đồng",
      ],
      buttonText: "Đang sử dụng",
      isPopular: false,
      isCurrent: true,
    },
    {
      name: "Nâng cao",
      description: "Tốt nhất cho học tập",
      price: "39.000đ",
      period: "tháng",
      icon: <Zap size={24} />,
      features: [
        "Tải lên không giới hạn",
        "Tạo Flashcard & Quiz không giới hạn",
        "Chat với AI thông minh hơn",
        "Phân tích tiến độ học tập",
        "Lưu trữ 1GB",
        "Hỗ trợ ưu tiên 24/7",
      ],
      buttonText: "Nâng cấp ngay",
      isPopular: true,
      isCurrent: false,
      note: "Thanh toán an toàn qua SePay",
    },
    {
      name: "Chưa biết",
      description: "Tạm thời mấy tính năng này chưa đâu nghe",
      price: "Liên hệ",
      period: "năm",
      icon: <Shield size={24} />,
      features: [
        "Mọi tính năng của gói Nâng cao",
        "Quản lý thành viên nhóm",
        "Báo cáo thống kê chi tiết",
        "Hỗ trợ kỹ thuật 1-1",
      ],
      buttonText: "Liên hệ tư vấn",
      isPopular: false,
      isCurrent: false,
    },
  ];

  return (
    <div className="relative min-h-screen w-full bg-slate-50/50">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto p-6">
        <PageHeader
          title="Nâng cấp tài khoản"
          subTitle="Chọn gói dịch vụ phù hợp để mở khóa toàn bộ tiềm năng học tập"
        />

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, index) => (
            <PaymentCard
              key={index}
              plan={plan}
              isPopular={plan.isPopular}
              isCurrent={plan.isCurrent}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">
            Bạn có câu hỏi? Liên hệ với chúng tôi qua{" "}
            <a
              href="#"
              className="text-emerald-600 font-semibold hover:underline"
            >
              support@ai-assistant.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
