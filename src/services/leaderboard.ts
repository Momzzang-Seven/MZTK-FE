import { api } from "./client";
import type { GetLeaderboardResponse } from "@types";

export const leaderboardService = {
  /**
   * 전체 리더보드 조회
   */
  async getLeaderboard(): Promise<GetLeaderboardResponse> {
    const response = await api.get("/users/leaderboard");
    return response.data.data;
  },
};
