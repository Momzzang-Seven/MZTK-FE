import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

interface TrainerHeaderProps {
  title: string;
  desc?: string;
  showBack?: boolean;
  backTo?: string;
  isLarge?: boolean;
}

const TrainerHeader = ({
  title,
  desc,
  showBack = false,
  backTo,
  isLarge = true,
}: TrainerHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
      return;
    }
    navigate(-1);
  };

  if (!isLarge) {
    return (
      <div className="flex items-center justify-between p-5 bg-white sticky top-0 z-50 border-b border-gray-100 font-pretendard">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={handleBack}
              aria-label="back"
              className="w-10 h-10 flex items-center justify-center -ml-2 rounded-full hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-900" />
            </button>
          )}
          <h1 className="text-[17px] font-black text-gray-900 tracking-tight">
            {title}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col font-pretendard relative">
      {/* Sticky Floating Back Button */}
      {showBack && (
        <div className="sticky top-6 z-[100] px-6 h-0 pointer-events-none">
          <button
            onClick={handleBack}
            aria-label="back"
            className="w-12 h-12 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white/50 active:scale-95 transition-all pointer-events-auto"
          >
            <ChevronLeft size={26} className="text-gray-900" />
          </button>
        </div>
      )}

      {/* Large Immersive Title Section */}
      <div
        className={`px-6 pb-6 flex flex-col ${showBack ? "pt-24" : "pt-12"}`}
      >
        <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight animate-in fade-in slide-in-from-left-4 duration-700">
          {title}
        </h1>
        {desc && (
          <p className="text-[14px] font-bold text-gray-400 mt-2 animate-in fade-in slide-in-from-left-6 duration-700 delay-100 leading-relaxed">
            {desc}
          </p>
        )}
      </div>
    </div>
  );
};

export default TrainerHeader;
