import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { UI_TEXT } from "@constant/index";

export const LocationHeader = () => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md px-4 pt-12 pb-4 flex items-center gap-3">
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
      >
        <ChevronLeft size={24} className="text-gray-900" />
      </button>
      <h1 className="text-xl font-black text-gray-900 tracking-tight">
        {UI_TEXT.HEADER_TITLE}
      </h1>
    </div>
  );
};
