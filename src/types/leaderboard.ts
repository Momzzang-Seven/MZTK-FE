export interface LeaderboardUser {
  rank: number;
  userId: number;
  nickname: string;
  profileImageUrl: string | null;
  level: number;
  lifetimeXp: number;
}

export interface GetLeaderboardResponse {
  users: LeaderboardUser[];
}
