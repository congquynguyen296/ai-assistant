
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subTitle?: string;
  description?: string;
  icon?: React.ElementType;
  action?: ReactNode;
  children?: ReactNode;
}

const PageHeader = ({ title, subTitle, children }: PageHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="">
        <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
          {title}
        </h1>
        {subTitle && <p className="text-sm text-slate-500">{subTitle}</p>}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
};

export default PageHeader;
