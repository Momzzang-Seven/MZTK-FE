import type { LeaderboardUser } from "@types";

interface LeaderboardItemProps {
  user: LeaderboardUser;
  isMe?: boolean;
}

const LeaderboardItem = ({ user, isMe = false }: LeaderboardItemProps) => {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3
        ${isMe ? "bg-main" : ""}
      `}
    >
      {/* 랭킹 */}
      <span
        className={`w-6 text-center font-semibold
          ${isMe ? "text-white" : "text-main"}
        `}
      >
        {user.rank}
      </span>

      {/* 프로필 원 */}
      <div
        className={`w-10 h-10 rounded-full
          ${isMe ? "bg-white" : "bg-main"}
        `}
      />

      {/* 유저 정보 */}
      <div className="flex flex-col">
        <span
          className={`font-semibold
            ${isMe ? "text-white" : "text-main"}
          `}
        >
          {user.nickname}
        </span>
        <span
          className={`text-sm
            ${isMe ? "text-white/90" : "text-gray-600"}
          `}
        >
          레벨 {user.level} / {user.xp}XP
        </span>
      </div>
    </div>
  );
};

export default LeaderboardItem;
