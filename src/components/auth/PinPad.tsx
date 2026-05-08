interface Props {
  title: string;
  desc?: React.ReactNode;
  pin: string;
  onInput: (num: number) => void;
  onDelete: () => void;
}

export const PinPad = ({ title, desc, pin, onInput, onDelete }: Props) => {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 bg-white">
      <div className="mt-16 mb-12 px-6">
        <div className="w-12 h-1.5 bg-main rounded-full mb-6" />
        <h1 className="text-gray-900 text-[28px] font-black leading-tight mb-3 tracking-tight">
          {title}
        </h1>
        <p className="text-gray-400 text-[14px] font-bold leading-relaxed tracking-tight">
          {desc || "6자리 숫자를 입력해 주세요."}
        </p>
      </div>

      <div className="flex gap-4 justify-center mb-16">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
              i < pin.length
                ? "bg-main scale-110 shadow-lg shadow-main/20"
                : "bg-gray-100 scale-100"
            }`}
          />
        ))}
      </div>

      <div className="mt-auto grid grid-cols-3 gap-y-3 gap-x-5 px-8 pb-12">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "back"].map((v, i) => {
          if (v === "") return <div key={i} />;
          if (v === "back")
            return (
              <button
                key={i}
                data-click-guard="off"
                onClick={onDelete}
                className="btn-press h-[64px] flex items-center justify-center text-gray-400 border-none bg-transparent"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                  <line x1="18" y1="9" x2="12" y2="15" />
                  <line x1="12" y1="9" x2="18" y2="15" />
                </svg>
              </button>
            );
          return (
            <button
              key={i}
              data-click-guard="off"
              onClick={() => pin.length < 6 && onInput(v as number)}
              className="btn-press h-[64px] bg-gray-50/50 hover:bg-gray-100/50 text-gray-900 rounded-2xl font-black text-2xl border-none transition-colors"
            >
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PinPad;
