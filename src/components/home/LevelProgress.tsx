import { useUserStore } from "@store";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const LevelProgress = () => {
  const navigate = useNavigate();
  const level = useUserStore((state) => state.level);
  const xp = useUserStore((state) => state.xp);
  const maxXp = useUserStore((state) => state.maxXp);
  const levelUp = useUserStore((state) => state.levelUp);
  const showSnackbar = useUserStore((state) => state.showSnackbar);
  const [animatedXp, setAnimatedXp] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setAnimatedXp(xp), 300);
    const t2 = setTimeout(() => setIsLoaded(true), 100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [xp]);

  const percentage = Math.min((animatedXp / maxXp) * 100, 100);
  const isLevelUpAvailable = xp >= maxXp;

  const handleLevelUp = async () => {
    const walletAddr = localStorage.getItem("wallet_address");
    if (!walletAddr) {
      navigate("/register-wallet");
      return;
    }
    try {
      const result = await levelUp();
      showSnackbar(result.message, {
        variant: result.success ? "success" : "error",
      });
    } catch {
      showSnackbar("서버와 통신하는 중 문제가 발생했습니다.", {
        variant: "error",
      });
    }
  };

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (!isLoaded) {
    return (
      <div className="w-full bg-white rounded-[28px] p-6 shadow-xl shadow-gray-100/50 border border-gray-50 h-[160px] skeleton" />
    );
  }

  return (
    <div className="group relative w-full bg-white rounded-[28px] p-7 shadow-2xl shadow-gray-200/50 border border-gray-100/50 overflow-hidden card-hover">
      {/* Subtle Background Pattern */}
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
        <svg
          width="120"
          height="120"
          viewBox="0 0 100 100"
          fill="currentColor"
          className="text-main"
        >
          <circle cx="90" cy="10" r="40" />
        </svg>
      </div>

      <div className="flex items-center gap-8 relative z-10">
        {/* Left: Refined Ring */}
        <div className="relative w-[120px] h-[120px] shrink-0">
          <svg
            className="w-full h-full transform -rotate-90 drop-shadow-md"
            viewBox="0 0 160 160"
          >
            <defs>
              <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FAB12F" />
                <stop offset="100%" stopColor="#FFC107" />
              </linearGradient>
            </defs>
            {/* Inner Track Shadow */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#F9FAFB"
              strokeWidth="14"
              fill="transparent"
            />
            {/* Progress */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#xpGrad)"
              strokeWidth="14"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-main text-[40px] font-black font-gmarket leading-none tracking-tighter">
              LV.{level}
            </span>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="mb-auto">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                Status: Healthy
              </span>
            </div>
            <h3 className="text-gray-900 text-xl font-black leading-tight mb-4">
              성장까지 <br />
              <span className="text-main">
                {Math.max(0, maxXp - xp).toLocaleString()} EXP
              </span>{" "}
              남음
            </h3>
          </div>

          {/* XP Mini Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                Progress
              </span>
              <span className="text-[13px] font-black text-gray-900">
                {Math.round(percentage)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
              <div
                className="h-full bg-gradient-to-r from-main to-orange-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Level Up Overlay Button (only when available) */}
      {isLevelUpAvailable && (
        <button
          onClick={handleLevelUp}
          className="absolute inset-0 bg-main/95 flex flex-col items-center justify-center gap-3 animate-fade-in z-20 cursor-pointer group-hover:bg-main transition-colors border-none px-6 text-center rounded-[28px]"
        >
          {/* Lucide: Sparkles / Zap */}
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <div>
            <span className="text-white font-black text-xl tracking-tight block">
              지금 바로 레벨업!
            </span>
            <span className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 block">
              Unlock New Potential
            </span>
          </div>
        </button>
      )}
    </div>
  );
};

export default LevelProgress;
