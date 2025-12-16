import { Check } from "lucide-react";

const PaymentCard = ({ plan, isPopular, isCurrent }) => {
  return (
    <div
      className={`relative w-full flex flex-col ${
        isPopular ? "md:-mt-4 md:mb-4" : ""
      }`}
    >
      {isPopular && (
        <div className="absolute inset-x-0 -top-4 flex justify-center z-20">
          <span className="rounded-full bg-linear-to-r from-emerald-500 to-teal-500 px-4 py-1 text-xs font-bold text-white shadow-lg shadow-emerald-500/30 uppercase tracking-wide">
            Phổ biến nhất
          </span>
        </div>
      )}

      <div
        className={`h-full flex flex-col rounded-2xl bg-white transition-all duration-300 
        ${
          isPopular
            ? "border-2 border-emerald-500 shadow-xl shadow-emerald-500/10 scale-100 z-10"
            : "border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
        }
        ${
          isCurrent
            ? "border-2 border-purple-500 shadow-xl shadow-purple-500/10 scale-100 z-10"
            : ""
        }`}
      >
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`p-2.5 rounded-xl ${
                isPopular
                  ? "bg-emerald-100 text-emerald-600"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {plan.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
              <p className="text-xs text-slate-500">{plan.description}</p>
            </div>
          </div>

          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-slate-900">
              {plan.price}
            </span>
            <span className="ml-1.5 text-sm font-medium text-slate-500">
              /{plan.period}
            </span>
          </div>
        </div>

        <div className="flex-1 p-6">
          <ul className="space-y-3">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <div
                  className={`mt-0.5 p-0.5 rounded-full ${
                    isPopular
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-sm text-slate-600 font-medium">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 pt-0 mt-auto">
          <button
            className={`w-full h-12 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98]
            ${
              isPopular
                ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl hover:shadow-emerald-500/30"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }
            ${isCurrent ? "disabled cursor-not-allowed opacity-50" : ""}`}
          >
            {plan.buttonText}
          </button>
          {plan.note && (
            <p className="mt-4 text-xs text-center text-slate-400">
              {plan.note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;
