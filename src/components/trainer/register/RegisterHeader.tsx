import { ChevronLeft } from "lucide-react";

interface RegisterHeaderProps {
  title: string;
  desc?: string;
  onBack: () => void;
  nextLabel?: string;
  onNext?: () => void;
  isNextDisabled?: boolean;
  step?: "photo" | "info";
}

const RegisterHeader = ({
  title,
  desc,
  onBack,
  nextLabel,
  onNext,
  isNextDisabled,
  step,
}: RegisterHeaderProps) => {
  return (
    <div className="flex flex-col font-pretendard relative">
      {/* Sticky Top Progress Bar - Fixed to the mobile container width */}
      {step && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] h-[4px] bg-gray-50 z-[110] overflow-hidden">
          <div
            className="h-full bg-main transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(250,177,47,0.6)]"
            style={{ width: step === "photo" ? "50%" : "100%" }}
          />
        </div>
      )}

      {/* Floating Buttons Wrapper - Moved lower to avoid being cramped */}
      <div className="sticky top-10 z-[100] px-6 h-0 flex items-center justify-between pointer-events-none">
        <button
          onClick={onBack}
          className="w-12 h-12 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-[0_10px_35px_rgba(0,0,0,0.12)] border border-white/50 active:scale-95 transition-all pointer-events-auto"
        >
          <ChevronLeft size={26} className="text-gray-900" />
        </button>

        {nextLabel && (
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className={`px-6 py-3.5 rounded-2xl text-[14px] font-black tracking-tight transition-all duration-300 shadow-2xl pointer-events-auto active:scale-95 ${
              isNextDisabled
                ? "bg-gray-100 text-gray-300"
                : "bg-main text-white shadow-main/25"
            }`}
          >
            {nextLabel}
          </button>
        )}
      </div>

      {/* Large Immersive Title Section */}
      <div className="px-6 pt-24 pb-6 flex flex-col">
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

export default RegisterHeader;
