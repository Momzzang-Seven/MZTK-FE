import { useUserStore } from "@store/userStore";

export const LevelReward = () => {
  const { level } = useUserStore();
  const reward = 5; // 레벨업당 지급 MZTK

  return (
    <div
      className="w-full bg-white rounded-[28px] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden animate-fade-slide-up"
      style={{ animationDelay: "0.2s" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FAB12F"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 12V22H4V12" />
            <path d="M22 7H2v5h20V7Z" />
            <path d="M12 22V7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
          </svg>
        </div>
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            Reward
          </p>
          <h3 className="text-gray-900 font-black text-[15px]">레벨업 보상</h3>
        </div>
        <span className="ml-auto text-[11px] font-black text-gray-400 bg-gray-50 px-2.5 py-1 rounded-xl">
          다음 레벨 달성 시
        </span>
      </div>

      {/* Reward banner */}
      <div className="mx-6 mb-6 bg-gradient-to-br from-main to-amber-400 rounded-[20px] p-5 shadow-lg shadow-main/20 relative overflow-hidden">
        {/* Deco */}
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />

        <div className="relative flex items-center justify-between">
          {/* Level transition */}
          <div>
            <p className="text-white/70 text-[11px] font-black uppercase tracking-widest mb-1">
              Level Up
            </p>
            <div className="flex items-center gap-2">
              <span className="text-white/60 font-black text-[18px]">
                Lv.{level}
              </span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-50"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
              <span className="text-white font-black text-[22px]">
                Lv.{level + 1}
              </span>
            </div>
          </div>

          {/* Token reward */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-2 border border-white/20">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8.5 9.5A2.5 2.5 0 0 1 12 8a2.5 2.5 0 0 1 2.5 2.5c0 2-2.5 3-2.5 3s-2.5-1-2.5-3Z" />
            </svg>
            <span className="text-white font-black text-[16px]">
              +{reward} MZTK
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
