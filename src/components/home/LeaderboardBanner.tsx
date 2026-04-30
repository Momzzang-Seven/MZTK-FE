import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { leaderboardService } from "@services";
import { useUserStore } from "@store";

export const LeaderboardBanner = () => {
  const navigate = useNavigate();
  const myUserId = useUserStore((s) => s.user?.userId);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await leaderboardService.getLeaderboard();
        const users = data?.users ?? [];
        setTotalUsers(users.length);
        const me = users.find((u) => u.userId === myUserId);
        if (me) setMyRank(me.rank);
      } catch {
        // 배너는 조용히 실패 처리
      }
    };
    if (myUserId) void fetch();
  }, [myUserId]);

  const topPercent =
    myRank !== null && totalUsers > 0
      ? ((myRank / totalUsers) * 100).toFixed(1)
      : null;

  return (
    <div
      onClick={() => navigate("/leaderboard")}
      className="w-full bg-gray-900 rounded-[20px] p-5 text-white shadow-md relative overflow-hidden flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
    >
      {/* 배경 장식 */}
      <div className="absolute -right-4 -top-8 w-32 h-32 bg-white opacity-[0.03] rounded-full blur-2xl pointer-events-none" />

      {/* 좌측 아이콘 */}
      <div className="shrink-0 mr-4">
        <img
          src="/icon/leaderboard.svg"
          alt="leaderboard"
          width={40}
          height={40}
          className="brightness-0 invert transform scale-110 opacity-90 drop-shadow-md"
        />
      </div>

      {/* 우측 컨텐츠 */}
      <div className="flex flex-col flex-1 items-start gap-2">
        <span className="font-bold text-[16px] tracking-tight text-white/95">
          내 현재 등수
        </span>

        <div className="flex items-end gap-1.5 h-6">
          {myRank !== null ? (
            <>
              <span className="text-[28px] font-extrabold leading-none tracking-tighter text-main translate-y-1">
                {myRank.toLocaleString()}
              </span>
              <span className="text-[15px] font-bold text-white/90">위</span>
            </>
          ) : (
            <span className="text-[18px] font-bold text-white/40 leading-none translate-y-1">
              —
            </span>
          )}
        </div>

        <p className="text-[12px] font-bold opacity-90 text-white">
          {topPercent !== null
            ? `전체 상위 ${topPercent}% 달성 중! 🚀`
            : "리더보드를 확인해보세요"}
        </p>
      </div>
    </div>
  );
};

export default LeaderboardBanner;
