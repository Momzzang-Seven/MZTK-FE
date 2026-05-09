import { useTokenBalance } from "@hooks/useTokenBalance";

export const CurrentTkn = () => {
  const { balance, loading } = useTokenBalance();

  return (
    <div className="w-full bg-gradient-to-br from-main to-amber-400 rounded-[28px] p-6 shadow-xl shadow-main/20 overflow-hidden relative">
      {/* Decorative circle */}
      <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none" />
      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/5 rounded-full pointer-events-none" />

      <div className="relative flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
            {/* Coin/Token SVG */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v2" />
              <path d="M12 16v2" />
              <path d="M8.5 9.5A2.5 2.5 0 0 1 12 8a2.5 2.5 0 0 1 2.5 2.5c0 2-2.5 3-2.5 3s-2.5-1-2.5-3Z" />
            </svg>
          </div>
          <div>
            <p className="text-white/70 text-[11px] font-black uppercase tracking-widest">
              Balance
            </p>
            <p className="text-white font-black text-[15px]">보유 MZTK</p>
          </div>
        </div>

        {/* Right — balance */}
        <div className="text-right">
          <p className="text-white font-black text-[28px] leading-none">
            {loading ? (
              <span className="animate-pulse opacity-50">···</span>
            ) : (
              Number(balance).toLocaleString()
            )}
          </p>
          <p className="text-white/60 text-[12px] font-black mt-0.5">MZTK</p>
        </div>
      </div>
    </div>
  );
};
