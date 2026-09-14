import { SearchX, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface NotFoundProps {
  title?: string;
  message?: string;
  backUrl?: string;
  backText?: string;
  icon?: React.ReactNode;
}

const NotFound = ({
  title = "Không tìm thấy dữ liệu",
  message = "Dữ liệu bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.",
  backUrl = "/",
  backText = "Quay lại trang chủ",
  icon = <SearchX size={48} className="text-slate-300" />,
}: NotFoundProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="mb-6 p-6 bg-slate-50 rounded-full border border-slate-100 shadow-sm">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-slate-800 mb-2">{title}</h2>
      <p className="text-slate-500 mb-8 max-w-md">{message}</p>
      {backUrl && (
        <Link
          to={backUrl}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
        >
          <ArrowLeft size={16} />
          {backText}
        </Link>
      )}
    </div>
  );
};

export default NotFound;
