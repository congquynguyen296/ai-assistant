import { useEffect, useState, useMemo } from "react";
import { Joyride, STATUS, Step } from "react-joyride";
import { useLocation } from "react-router-dom";

export const OnboardingTour = () => {
  const [run, setRun] = useState(false);
  const location = useLocation();

  const getPageKey = (pathname: string) => {
    if (pathname === "/dashboard") return "dashboard";
    if (pathname === "/documents") return "documents";
    if (pathname === "/quizzes") return "quizzes";
    if (pathname === "/interviews") return "interviews";
    if (pathname === "/interviews/setup") return "interview_setup";
    return null;
  };

  const pageKey = getPageKey(location.pathname);

  const steps = useMemo(() => {
    if (pageKey === "dashboard") {
      return [
        {
          target: "body",
          content: (
            <div className="text-left font-sans">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Chào mừng đến với Hyra! 🎉</h3>
              <p className="text-sm text-slate-600">
                Hãy cùng chúng tôi dành ra 30 giây để tìm hiểu các tính năng mạnh mẽ nhất giúp bạn bứt phá nhé.
              </p>
            </div>
          ),
          placement: "center",
        },
        {
          target: "#tour-dashboard-focus",
          content: (
            <div className="text-left font-sans">
              <h3 className="text-base font-bold text-slate-900 mb-1">Mục tiêu hiện tại</h3>
              <p className="text-sm text-slate-600">
                Khu vực này sẽ luôn gợi ý cho bạn biết bạn nên làm gì tiếp theo, từ việc tải tài liệu đến ôn tập Flashcards.
              </p>
            </div>
          ),
          placement: "bottom",
        },
        {
          target: "#tour-dashboard-stats-documents",
          content: (
            <div className="text-left font-sans">
              <h3 className="text-base font-bold text-slate-900 mb-1">Thống kê tài liệu</h3>
              <p className="text-sm text-slate-600">
                Nơi bạn theo dõi số lượng tài liệu đã tải lên và phân tích.
              </p>
            </div>
          ),
          placement: "bottom",
        },
        {
          target: "#tour-dashboard-stats-flashcards",
          content: (
            <div className="text-left font-sans">
              <h3 className="text-base font-bold text-slate-900 mb-1">Thống kê Flashcard</h3>
              <p className="text-sm text-slate-600">
                Lưu lại quá trình học Flashcard của bạn.
              </p>
            </div>
          ),
          placement: "bottom",
        },
        {
          target: "#tour-dashboard-stats-quizzes",
          content: (
            <div className="text-left font-sans">
              <h3 className="text-base font-bold text-slate-900 mb-1">Kết quả kiểm tra</h3>
              <p className="text-sm text-slate-600">
                Lịch sử hoàn thành trắc nghiệm và điểm số trung bình của bạn.
              </p>
            </div>
          ),
          placement: "bottom",
        },
        {
          target: "#tour-dashboard-stats-interviews",
          content: (
            <div className="text-left font-sans">
              <h3 className="text-base font-bold text-slate-900 mb-1">Phỏng vấn</h3>
              <p className="text-sm text-slate-600">
                Quản lý số buổi phỏng vấn mô phỏng mà bạn đã trải qua.
              </p>
            </div>
          ),
          placement: "bottom",
        },
        {
          target: "#tour-nav-documents",
          content: (
            <div className="text-left font-sans">
              <h3 className="text-base font-bold text-emerald-600 mb-1">Tài liệu của bạn</h3>
              <p className="text-sm text-slate-600">
                Tải lên tài liệu mới để AI phân tích và tự động tạo ra bộ từ vựng, trắc nghiệm cho bạn.
              </p>
            </div>
          ),
          placement: "right",
        },
        {
          target: "#tour-nav-quizzes",
          content: (
            <div className="text-left font-sans">
              <h3 className="text-base font-bold text-emerald-600 mb-1">Trắc nghiệm</h3>
              <p className="text-sm text-slate-600">
                Ôn luyện nhanh chóng với các bài kiểm tra được tạo ra từ tài liệu của bạn.
              </p>
            </div>
          ),
          placement: "right",
        },
        {
          target: "#tour-nav-interviews",
          content: (
            <div className="text-left font-sans">
              <h3 className="text-base font-bold text-emerald-600 mb-1">Phỏng vấn thực chiến!</h3>
              <p className="text-sm text-slate-600">
                Phỏng vấn 1-1 với AI dựa trên chính CV của bạn. Khám phá tính năng này ngay!
              </p>
            </div>
          ),
          placement: "right",
        }
      ] as Step[];
    }
    
    if (pageKey === "documents") {
      return [
        {
          target: "#tour-upload-doc",
          content: (
            <div className="text-left font-sans">
              <h3 className="text-base font-bold text-slate-900 mb-1">Tải tài liệu mới</h3>
              <p className="text-sm text-slate-600">
                Bấm vào đây để tải lên tài liệu mới. Hệ thống sẽ phân tích và bóc tách kiến thức tự động.
              </p>
            </div>
          ),
          placement: "bottom",
        }
      ] as Step[];
    }

    if (pageKey === "interviews") {
      return [
        {
          target: "#tour-new-interview",
          content: (
            <div className="text-left font-sans">
              <h3 className="text-base font-bold text-slate-900 mb-1">Tạo phỏng vấn mới</h3>
              <p className="text-sm text-slate-600">
                Khởi tạo một phiên phỏng vấn mới, cung cấp JD và CV để AI đóng vai nhà tuyển dụng.
              </p>
            </div>
          ),
          placement: "bottom",
        }
      ] as Step[];
    }

    if (pageKey === "interview_setup") {
      return [
        {
          target: "#tour-interview-setup-modes",
          content: (
            <div className="text-left font-sans">
              <h3 className="text-base font-bold text-slate-900 mb-1">Thiết lập phỏng vấn</h3>
              <p className="text-sm text-slate-600">
                Lựa chọn loại phỏng vấn phù hợp. Bạn có thể kết hợp CV và Job Description để có buổi phỏng vấn sát thực tế nhất.
              </p>
            </div>
          ),
          placement: "bottom",
        }
      ] as Step[];
    }

    if (pageKey === "quizzes") {
      return [
        {
          target: "body",
          content: (
            <div className="text-left font-sans">
              <h3 className="text-base font-bold text-slate-900 mb-1">Khu vực Trắc nghiệm</h3>
              <p className="text-sm text-slate-600">
                Tại đây bạn có thể làm các bài kiểm tra được sinh ra tự động từ kiến thức trong tài liệu của bạn.
              </p>
            </div>
          ),
          placement: "center",
        }
      ] as Step[];
    }

    return [];
  }, [pageKey]);

  useEffect(() => {
    // Only run if user is a newly registered user
    const isNewUser = localStorage.getItem("hyra_is_new_user");
    if (isNewUser !== "true") {
      setRun(false);
      return;
    }

    if (!pageKey || steps.length === 0) {
      setRun(false);
      return;
    }

    // Check if the tour for THIS SPECIFIC PAGE has been completed
    const hasCompleted = localStorage.getItem(`hyra_onboarding_${pageKey}`);
    if (hasCompleted) {
      setRun(false);
    } else {
      setRun(false); // Reset run state before starting
      
      // Mark as completed IMMEDIATELY so if they navigate away it won't show again
      localStorage.setItem(`hyra_onboarding_${pageKey}`, "true");
      
      const timer = setTimeout(() => setRun(true), 800); // Wait for DOM
      return () => clearTimeout(timer);
    }
  }, [pageKey, steps.length]);

  const handleJoyrideCallback = (data: any) => {
    const { status, action } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status) || action === "close") {
      setRun(false);
    }
  };

  if (steps.length === 0) return null;

  return (
    <Joyride
      {...({
        steps,
        run,
        continuous: true,
        showSkipButton: true,
        showProgress: true,
        callback: handleJoyrideCallback,
        styles: {
          options: {
            primaryColor: "#10b981", // Emerald 500
            textColor: "#0f172a", // Slate 900
            backgroundColor: "#ffffff",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 10000,
          },
          tooltip: {
            padding: "24px",
            borderRadius: "16px",
          },
          tooltipContainer: {
            textAlign: "left",
          },
          tooltipContent: {
            padding: "8px 0",
          },
          buttonNext: {
            backgroundColor: "#10b981",
            borderRadius: "8px",
            padding: "8px 16px",
            fontWeight: 600,
          },
          buttonBack: {
            color: "#64748b",
            fontWeight: 600,
          },
          buttonSkip: {
            color: "#94a3b8",
            fontWeight: 600,
          },
        },
        locale: {
          back: "Quay lại",
          close: "Đóng",
          last: "Hoàn tất",
          next: "Tiếp theo",
          skip: "Bỏ qua",
        }
      } as any)}
    />
  );
};
