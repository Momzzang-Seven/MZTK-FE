import { useEffect, useState } from "react";
import { LeaderboardItem } from "@components/leaderboard";
import { leaderboardService } from "@services";
import { useUserStore } from "@store";
import type { LeaderboardUser } from "@types";

const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const myUserId = useUserStore((s) => s.user?.userId);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await leaderboardService.getLeaderboard();
        setUsers(data?.users ?? []);
      } catch {
        setError("리더보드를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    void fetch();
  }, []);

  const me = users.find((u) => u.userId === myUserId);
  const others = users.filter((u) => u.userId !== myUserId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-main border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ul className="flex flex-col">
        {/* 내 랭킹 (항상 최상단) */}
        {me && <LeaderboardItem user={me} isMe />}

        {/* 나머지 유저 목록 */}
        {others.map((user) => (
          <LeaderboardItem key={user.userId} user={user} isMe={false} />
        ))}

        {users.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <span className="text-4xl opacity-20">🏆</span>
            <p className="text-[13px] text-gray-400">
              아직 리더보드 데이터가 없습니다.
            </p>
          </div>
        )}
      </ul>
    </div>
  );
};

export default Leaderboard;
