interface RegisterHeaderProps {
  title: string;
  onBack: () => void;
  nextLabel?: string;
  onNext?: () => void;
  isNextDisabled?: boolean;
  step?: "photo" | "info";
}

const RegisterHeader = ({
  title,
  onBack,
  nextLabel,
  onNext,
  isNextDisabled,
  step,
}: RegisterHeaderProps) => {
  return (
    <div className="flex flex-col bg-white sticky top-0 z-50">
      <div className="flex items-center justify-between px-5 h-16 border-b border-gray-50">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center -ml-2 btn-press rounded-full hover:bg-gray-50 transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111827"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-[17px] font-black text-gray-900 tracking-tight">
          {title}
        </h1>
        <div className="min-w-[56px] flex justify-end">
          {nextLabel && (
            <button
              onClick={onNext}
              disabled={isNextDisabled}
              className={`px-4 py-2 rounded-full text-[13px] font-black tracking-tight transition-all duration-300 border-none outline-none btn-press ${
                isNextDisabled
                  ? "bg-gray-50 text-gray-300"
                  : "bg-main text-white shadow-lg shadow-main/20 active:scale-95"
              }`}
            >
              {nextLabel}
            </button>
          )}
        </div>
      </div>

      {/* Dynamic Progress Bar */}
      {step && (
        <div className="h-[2px] w-full bg-gray-50">
          <div
            className="h-full bg-main transition-all duration-500 ease-out shadow-[0_0_8px_rgba(250,177,47,0.4)]"
            style={{ width: step === "photo" ? "50%" : "100%" }}
          />
        </div>
      )}
    </div>
  );
};

export default RegisterHeader;
