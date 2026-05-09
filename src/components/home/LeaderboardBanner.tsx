import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { leaderboardService } from "@services";
import { useUserStore } from "@store";

export const LeaderboardBanner = () => {
  const navigate = useNavigate();
  const myUserId = useUserStore((s) => s.user?.userId);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await leaderboardService.getLeaderboard();
        const users = data?.users ?? [];
        setTotalUsers(users.length);
        const me = users.find((u) => u.userId === myUserId);
        if (me) setMyRank(me.rank);
      } catch {
        /* FAIL SILENTLY */
      } finally {
        setLoading(false);
      }
    };
    if (myUserId) void fetch();
    else setLoading(false);
  }, [myUserId]);

  const topPercent =
    myRank !== null && totalUsers > 0
      ? ((myRank / totalUsers) * 100).toFixed(0)
      : null;

  if (loading) {
    return (
      <div className="flex-1 bg-white rounded-[28px] h-40 skeleton shadow-xl shadow-gray-100/50" />
    );
  }

  return (
    <div
      className="flex-1 rounded-[28px] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden relative animate-fade-slide-up card-hover"
      style={{ animationDelay: "0.2s" }}
    >
      <button
        onClick={() => navigate("/leaderboard")}
        className="w-full h-40 bg-white p-5 text-left flex flex-col justify-between relative"
        style={{ borderRadius: 0 }}
      >
        {/* Background Decor */}
        <div className="absolute top-[-10px] right-[-10px] w-12 h-12 bg-main/5 rounded-full blur-xl" />

        <div className="flex items-center justify-between">
          <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center shadow-sm">
            {/* Lucide: Trophy */}
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
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          </div>
          <div className="text-[10px] text-gray-300 font-black uppercase tracking-tighter">
            Global Rank
          </div>
        </div>

        <div>
          <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-[0.1em] mb-1">
            현재 내 순위
          </h4>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-main leading-none">
              {myRank || "—"}
            </span>
            <span className="text-xs text-gray-400 font-bold uppercase">
              위
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-gray-400 font-bold leading-tight">
            상위{" "}
            <span className="text-gray-900 font-black">
              {topPercent || "—"}%
            </span>{" "}
            달성 중
          </p>
          <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
};

export default LeaderboardBanner;
