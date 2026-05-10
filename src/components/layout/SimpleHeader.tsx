import { useNavigate, useLocation } from "react-router-dom";
import { headerByPath } from "@constant";
import { ChevronLeft } from "lucide-react";

interface SimpleHeaderProps {
  onBackClick?: () => void;
  button?: React.ReactNode;
  title?: string;
}

export const SimpleHeader = ({
  onBackClick,
  button,
  title,
}: SimpleHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const currentHeader = headerByPath.find((part) => path.startsWith(part.path));
  const displayTitle = title ?? currentHeader?.label ?? "";

  return (
    <header className="z-[998] fixed top-0 w-full max-w-[450px] mx-auto flex items-center justify-between px-5 h-[72px] border-b border-gray-100/50 bg-white/80 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-500">
      <button
        onClick={onBackClick ? onBackClick : () => navigate(-1)}
        className="group flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100/50 transition-all active:scale-90"
      >
        <ChevronLeft
          className="text-gray-900 group-hover:text-main transition-colors"
          size={24}
          strokeWidth={2.5}
        />
      </button>

      <h1 className="absolute left-1/2 -translate-x-1/2 font-black text-[17px] text-gray-900 tracking-tight">
        {displayTitle}
      </h1>

      <div className="flex items-center justify-end min-w-[40px]">
        {button ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            {button}
          </div>
        ) : (
          <div className="w-10 h-10" />
        )}
      </div>
    </header>
  );
};
