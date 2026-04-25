import type { ReactNode } from "react";

interface ModalShellProps {
  isOpen: boolean;
  children: ReactNode;
  containerClassName?: string;
}

/**
 * ModalShell: Khung modal dùng chung cho overlay và khung nội dung.
 */
const ModalShell = ({
  isOpen,
  children,
  containerClassName = "",
}: ModalShellProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className={`relative w-full ${containerClassName}`}>{children}</div>
    </div>
  );
};

export default ModalShell;
