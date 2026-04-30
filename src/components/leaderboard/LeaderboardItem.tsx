import type { LeaderboardUser } from "@types";

interface LeaderboardItemProps {
  user: LeaderboardUser;
  isMe?: boolean;
}

const RANK_MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

const LeaderboardItem = ({ user, isMe = false }: LeaderboardItemProps) => {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 ${
        isMe ? "bg-main" : ""
      }`}
    >
      {/* 랭킹 */}
      <span
        className={`w-8 text-center font-bold text-[15px] shrink-0 ${
          isMe ? "text-white" : "text-main"
        }`}
      >
        {RANK_MEDALS[user.rank] ?? user.rank}
      </span>

      {/* 프로필 이미지 */}
      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-main/20">
        {user.profileImageUrl ? (
          <img
            src={user.profileImageUrl}
            alt={user.nickname}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full ${isMe ? "bg-white/30" : "bg-main/30"}`} />
        )}
      </div>

      {/* 유저 정보 */}
      <div className="flex flex-col flex-1 min-w-0">
        <span
          className={`font-bold text-[14px] truncate ${
            isMe ? "text-white" : "text-gray-800"
          }`}
        >
          {user.nickname}
          {isMe && (
            <span className="ml-1.5 text-[11px] font-medium opacity-80">(나)</span>
          )}
        </span>
        <span
          className={`text-[12px] ${
            isMe ? "text-white/80" : "text-gray-500"
          }`}
        >
          Lv.{user.level} · {user.lifetimeXp.toLocaleString()} XP
        </span>
      </div>
    </div>
  );
};

export default LeaderboardItem;
