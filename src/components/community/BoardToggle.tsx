import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, HelpCircle } from "lucide-react";

const BoardToggle = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isQuestion = pathname.includes("/community/question");
  const isFree = pathname.includes("/community/free");

  return (
    <div className="relative flex h-[56px] rounded-[24px] bg-gray-50/80 p-1.5 backdrop-blur-xl border border-gray-100 shadow-inner">
      {/* 슬라이드되는 선택 배경 */}
      <div
        className={`absolute top-1.5 left-1.5 h-[44px] w-[calc(50%-6px)] rounded-[20px] bg-main shadow-[0_12px_24px_rgba(250,177,47,0.25)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${isQuestion ? "translate-x-full" : "translate-x-0"}`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent rounded-[20px]" />
      </div>

      {/* 자유게시판 */}
      <div
        onClick={() => navigate("/community/free")}
        className={`relative z-10 flex-1 flex items-center justify-center gap-2.5 text-[14px] tracking-tight transition-all duration-300 cursor-pointer active:scale-95
        ${isFree ? "text-white font-black" : "text-gray-400 font-bold hover:text-gray-600"}`}
      >
        <MessageSquare
          size={18}
          strokeWidth={isFree ? 3 : 2.5}
          className={isFree ? "animate-pulse" : ""}
        />
        <span>자유게시판</span>
      </div>

      {/* 질문게시판 */}
      <div
        onClick={() => navigate("/community/question")}
        className={`relative z-10 flex-1 flex items-center justify-center gap-2.5 text-[14px] tracking-tight transition-all duration-300 cursor-pointer active:scale-95
        ${isQuestion ? "text-white font-black" : "text-gray-400 font-bold hover:text-gray-600"}`}
      >
        <HelpCircle
          size={18}
          strokeWidth={isQuestion ? 3 : 2.5}
          className={isQuestion ? "animate-pulse" : ""}
        />
        <span>질문게시판</span>
      </div>
    </div>
  );
};

export default BoardToggle;
