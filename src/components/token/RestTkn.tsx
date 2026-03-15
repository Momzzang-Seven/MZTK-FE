import { useState } from "react";

interface RestTknProps {
  amt: number;
  onRefresh?: () => void;
}

export const RestTkn = ({ amt, onRefresh }: RestTknProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    if (onRefresh) {
      onRefresh();
    } else {
      alert("잔액이 새로고침 되었습니다.");
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <section className="w-full p-6 rounded-lg bg-gradient-to-r from-main to-sub text-white">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-x-2">
          <div className="p-1 rounded-full bg-white/20">
            <img src="/icon/token.svg" alt="MZTK Token" className="w-6 h-6" />
          </div>
          <span className="font-bold text-sm">사용 가능한 잔액</span>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="flex items-center gap-x-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-xs"
        >
          <img
            src="/icon/refresh.svg"
            alt="refresh"
            className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
          />
          <span>새로고침</span>
        </button>
      </div>

      {/* Amount Area */}
      <div className="flex items-baseline justify-end gap-x-2">
        <span className="text-[32px] font-extrabold leading-tight">
          {amt.toLocaleString()}
        </span>
        <span className="text-lg opacity-90">MZTK</span>
      </div>
    </section>
  );
};
