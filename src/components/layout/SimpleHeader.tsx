import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { headerByPath } from "@constant";

interface SimpleHeaderProps {
  onBackClick?: () => void;
  button?: React.ReactNode;
}

export const SimpleHeader = ({ onBackClick, button }: SimpleHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const currentHeader = headerByPath.find((part) => path.startsWith(part.path));

  return (
    <header className="z-[998] w-full sticky max-w-[420px] flex items-center justify-between px-6 py-6 border-b border-gray-300">
      <img
        src="/icon/backArrow.svg"
        alt="back"
        className="cursor-pointer text-gray-900"
        onClick={onBackClick ? onBackClick : () => navigate(-1)}
      />
      <div className="font-bold text-lg">{currentHeader?.label ?? ""}</div>
      {button && <div>{button}</div>}
      {!button && <div className="w-5 h-4" />}
    </header>
  );
};
