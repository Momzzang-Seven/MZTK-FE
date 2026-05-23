import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { leaderboardService } from "@services";
import { useUserStore } from "@store";
import type { LeaderboardUser } from "@types";

/* ── Rank medal SVG icons ── */
const RankBadge = ({ rank }: { rank: number }) => {
  if (rank === 1)
    return (
      <div className="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center shadow-md shadow-yellow-300/40">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
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
    );
  if (rank === 2)
    return (
      <div className="w-8 h-8 rounded-xl bg-gray-300 flex items-center justify-center shadow-md shadow-gray-200/60">
        <span className="text-white font-black text-[13px]">2</span>
      </div>
    );
  if (rank === 3)
    return (
      <div className="w-8 h-8 rounded-xl bg-orange-300 flex items-center justify-center shadow-md shadow-orange-200/60">
        <span className="text-white font-black text-[13px]">3</span>
      </div>
    );
  return (
    <div className="w-8 h-8 flex items-center justify-center">
      <span className="text-gray-400 font-black text-[13px]">{rank}</span>
    </div>
  );
};

/* ── Single Row ── */
const LeaderboardRow = ({
  user,
  isMe,
}: {
  user: LeaderboardUser;
  isMe: boolean;
}) => {
  const initials = user.nickname?.slice(0, 1).toUpperCase() ?? "?";

  return (
    <div
      className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
        isMe
          ? "bg-main/5 border-l-4 border-main"
          : "border-l-4 border-transparent hover:bg-gray-50/70"
      }`}
    >
      {/* Rank */}
      <RankBadge rank={user.rank} />

      {/* Avatar */}
      <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 bg-main/10 flex items-center justify-center">
        {user.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={user.nickname}
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            className={`text-[15px] font-black ${isMe ? "text-main" : "text-gray-400"}`}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`font-black text-[14px] truncate ${isMe ? "text-gray-900" : "text-gray-800"}`}
          >
            {user.nickname}
          </span>
          {isMe && (
            <span className="text-[10px] font-black bg-main text-white px-1.5 py-0.5 rounded-md">
              나
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-400 font-bold">
            Lv.{user.level}
          </span>
          <span className="text-gray-200 text-[10px]">·</span>
          <span className="text-[11px] text-gray-400 font-bold">
            {user.lifetimeXp.toLocaleString()} XP
          </span>
        </div>
      </div>

      {/* XP rank chip */}
      <div
        className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-black ${
          isMe ? "bg-main/10 text-main" : "bg-gray-100 text-gray-500"
        }`}
      >
        #{user.rank}
      </div>
    </div>
  );
};

/* ── Skeleton ── */
const SkeletonRow = () => (
  <div className="flex items-center gap-4 px-5 py-3.5">
    <div className="w-8 h-8 skeleton rounded-xl" />
    <div className="w-10 h-10 skeleton rounded-2xl" />
    <div className="flex-1 space-y-2">
      <div className="h-3 skeleton rounded-full w-32" />
      <div className="h-2.5 skeleton rounded-full w-20" />
    </div>
    <div className="w-10 h-6 skeleton rounded-xl" />
  </div>
);

/* ── Page ── */
const Leaderboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const myUserId = useUserStore((s) => s.user?.userId);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await leaderboardService.getLeaderboard();
        setUsers(data?.users ?? []);
      } catch {
        setError("리더보드를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  const me = users.find((u) => u.userId === myUserId);
  const top3 = users.filter((u) => u.rank <= 3);
  const rest = users.filter((u) => u.rank > 3);
  const myRank = me?.rank ?? null;
  const topPct =
    myRank !== null && users.length > 0
      ? Math.round((myRank / users.length) * 100)
      : null;

  return (
    <div className="flex flex-col min-h-dvh bg-[#FDFDFD] pb-28">
      {/* ── Header ── */}
      <div className="relative pt-12 pb-20 px-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-56 h-56 bg-main opacity-[0.07] blur-[60px] rounded-full pointer-events-none" />
        <button
          onClick={() => navigate(-1)}
          className="btn-press w-10 h-10 rounded-xl bg-white shadow-md shadow-gray-100 flex items-center justify-center border-none mb-6"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#111827"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <p className="text-gray-400 text-xs font-bold tracking-widest uppercase mb-1">
          Rankings
        </p>
        <h1 className="text-gray-900 text-2xl font-black tracking-tight">
          글로벌 리더보드 🏆
        </h1>

        {/* My rank pill */}
        {myRank !== null && (
          <div className="mt-4 inline-flex items-center gap-2 bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-main animate-pulse" />
            <span className="text-[12px] font-black text-gray-700">
              내 순위: <span className="text-main">#{myRank}</span>
            </span>
            {topPct !== null && (
              <span className="text-[11px] text-gray-400 font-bold border-l border-gray-100 pl-2">
                상위 {topPct}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col gap-3 px-5 -mt-12 relative z-10">
        {/* Top 3 podium */}
        {!isLoading && !error && top3.length > 0 && (
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden animate-scale-in">
            <div className="px-5 pt-5 pb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Top 3
              </p>
            </div>
            {top3.map((u) => (
              <LeaderboardRow
                key={u.userId}
                user={u}
                isMe={u.userId === myUserId}
              />
            ))}
          </div>
        )}

        {/* Rest of list */}
        {!isLoading && !error && rest.length > 0 && (
          <div
            className="bg-white rounded-[28px] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden animate-fade-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="px-5 pt-5 pb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                All Rankings
              </p>
            </div>
            {rest.map((u) => (
              <div key={u.userId}>
                <LeaderboardRow user={u} isMe={u.userId === myUserId} />
                <div className="h-px bg-gray-50 mx-5" />
              </div>
            ))}
          </div>
        )}

        {/* Loading skeletons */}
        {isLoading && (
          <div className="bg-white rounded-[28px] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <p className="text-[13px] text-gray-500 font-bold">{error}</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-yellow-50 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FAB12F"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
            <p className="text-[13px] text-gray-500 font-bold">
              아직 리더보드 데이터가 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
