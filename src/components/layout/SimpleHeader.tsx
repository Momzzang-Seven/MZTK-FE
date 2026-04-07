import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { headerByPath } from "@constant";

interface SimpleHeaderProps {
  onBackClick?: () => void;
  button?: React.ReactNode;
  title?: string;
}

export const SimpleHeader = ({ onBackClick, button, title }: SimpleHeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  const currentHeader = headerByPath.find((part) => path.startsWith(part.path));
  const displayTitle = title ?? currentHeader?.label ?? "";

  return (
    <header className="z-[998] w-full sticky max-w-[450px] mx-auto flex items-center justify-between px-6 py-6 border-b border-gray-300 bg-white">
      <svg
        width="20"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="cursor-pointer text-gray-900"
        onClick={onBackClick ? onBackClick : () => navigate(-1)}
      >
        <path
          d="M9.57 5.92993L3.5 11.9999L9.57 18.0699M20.5 11.9999H3.67"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="font-bold text-lg">{displayTitle}</div>
      {button && <div>{button}</div>}
      {!button && <div className="w-5 h-4" />}
    </header>
  );
};
