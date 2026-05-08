import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { headerByPath } from "@constant";

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
    <header className="z-[998] fixed top-0 w-full max-w-[450px] mx-auto flex items-center justify-between px-6 py-6 border-b border-gray-300 bg-white">
      <img
        src="/icon/backArrow.svg"
        alt="back"
        className="cursor-pointer text-gray-900"
        onClick={onBackClick ? onBackClick : () => navigate(-1)}
      />
      <div className="font-bold text-lg">{displayTitle}</div>
      {button && <div>{button}</div>}
      {!button && <div className="w-5 h-4" />}
    </header>
  );
};
