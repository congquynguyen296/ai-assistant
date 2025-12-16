import { X, Check, Copy, Smartphone } from "lucide-react";
import { useState } from "react";

const PaymentModal = ({ isOpen, onClose, plan }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !plan) return null;

  // Thông tin ngân hàng
  const bankInfo = {
    accVia: import.meta.env.VITE_SEPAY_ACC_VIA_QR,
    bank: "MBBank",
    amount: plan.price === "39.000đ" ? 39000 : 0,
    desc: "HQ29062020",
    accountName: "Nguyễn Công Quý",
    accountNumber: "0976870127",
  };

  // Tạo link Sepay QR
  const qrUrl = `https://qr.sepay.vn/img?acc=${bankInfo.accVia}&bank=${bankInfo.bank}&amount=${bankInfo.amount}&des=${bankInfo.desc}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 top-16 md:left-64 z-40 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all"
        >
          <X size={20} />
        </button>

        {/* Left Side - QR Code */}
        <div className="w-full md:w-1/2 bg-slate-50 p-8 flex flex-col items-center justify-center border-r border-slate-100 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Thanh toán qua QR
            </h3>
            <p className="text-sm text-slate-500">
              Mở ứng dụng ngân hàng để quét mã
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6">
            <img
              alt="QR Code Payment"
              className="w-48 h-48 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/200?text=QR+Error";
              }}
              src={qrUrl}
            />
          </div>

          <div className="w-full max-w-xs space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Ngân hàng</span>
              <span className="font-medium text-slate-900">MB Bank</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Số tài khoản</span>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900">
                  {bankInfo.accountNumber}
                </span>
                <button
                  onClick={() => handleCopy(bankInfo.accountNumber)}
                  className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded"
                  title="Sao chép"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Chủ tài khoản</span>
              <span className="font-medium text-slate-900">
                {bankInfo.accountName}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Số tiền</span>
              <span className="font-bold text-emerald-600 text-lg">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(bankInfo.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Nội dung</span>
              <div className="flex items-center gap-2">
                <span
                  className="font-medium text-slate-900 truncate max-w-[150px]"
                  title={bankInfo.desc}
                >
                  {bankInfo.desc}
                </span>
                <button
                  onClick={() => handleCopy(bankInfo.content)}
                  className="text-emerald-600 hover:text-emerald-700 p-1 hover:bg-emerald-50 rounded"
                  title="Sao chép"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>
          </div>

          {copied && (
            <div className="mt-4 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full animate-fade-in-up">
              Đã sao chép vào bộ nhớ tạm
            </div>
          )}
        </div>

        {/* Right Side - Plan Info */}
        <div className="w-full md:w-1/2 p-8 flex flex-col bg-white overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium mb-4">
              {plan.period === "tháng" ? "Gói tháng" : "Gói năm"}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {plan.name}
            </h2>
            <p className="text-slate-500">{plan.description}</p>
          </div>

          <div className="flex items-baseline mb-8">
            <span className="text-4xl font-bold text-slate-900">
              {plan.price}
            </span>
            <span className="text-slate-500 ml-2">/{plan.period}</span>
          </div>

          <div className="space-y-4 mb-8 flex-1">
            <h4 className="font-medium text-slate-900">Quyền lợi bao gồm:</h4>
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="mt-0.5 p-0.5 rounded-full bg-emerald-100 text-emerald-600 shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className="text-sm text-slate-600">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400 text-center mb-4">
              Sau khi chuyển khoản, hệ thống sẽ tự động kích hoạt gói trong vòng
              5-10 phút.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
