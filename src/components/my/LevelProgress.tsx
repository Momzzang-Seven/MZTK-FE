import { useUserStore } from "@store/userStore";

export const LevelProgress = () => {
  const { level, xp, maxXp } = useUserStore();
  const pct = maxXp > 0 ? Math.min((xp / maxXp) * 100, 100) : 0;
  const remainingXp = Math.max(0, maxXp - xp);

  return (
    <div
      className="w-full bg-white rounded-[28px] border border-gray-100 shadow-xl shadow-gray-100/50 p-6 animate-fade-slide-up"
      style={{ animationDelay: "0.1s" }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-main/10 flex items-center justify-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#FAB12F"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <span className="text-gray-900 font-black text-[15px]">
            EXP · 레벨
          </span>
        </div>
        <div className="px-3 py-1 rounded-xl bg-main text-white text-[12px] font-black shadow-md shadow-main/30">
          Lv.{level}
        </div>
      </div>

      {/* XP numbers */}
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
            현재 EXP
          </p>
          <p className="text-gray-900 font-black text-[22px] leading-none">
            {xp.toLocaleString()}
            <span className="text-gray-400 text-[14px] font-bold ml-1">XP</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
            다음 레벨
          </p>
          <p className="text-gray-500 font-black text-[16px] leading-none">
            {maxXp.toLocaleString()}
            <span className="text-gray-400 text-[12px] font-bold ml-1">XP</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-main to-amber-300 transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-[11px] text-gray-400 font-bold">
          {Math.floor(pct)}% 달성
        </span>
        <span className="text-[11px] text-gray-400 font-bold">
          {remainingXp.toLocaleString()} XP 남음
        </span>
      </div>
    </div>
  );
};
