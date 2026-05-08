import { api } from "./client";
import type {
  MyLevelResponse,
  LevelPoliciesResponse,
  LevelUpResponse,
  LevelUpHistoriesResponse,
  XpLedgerResponse,
} from "../types/level";

/**
 * 레벨 및 XP 관련 API 서비스
 */
export const levelService = {
  /**
   * 내 현재 레벨 정보 조회
   */
  async getMyLevel(): Promise<MyLevelResponse> {
    const response = await api.get("/users/me/level");
    return response.data.data;
  },

  /**
   * 레벨 및 XP 정책 조회
   */
  async getLevelPolicies(): Promise<LevelPoliciesResponse> {
    const response = await api.get("/levels/policies");
    return response.data.data;
  },

  /**
   * 레벨업 수행
   */
  async levelUp(): Promise<LevelUpResponse> {
    const response = await api.post("/users/me/level-ups");
    return response.data.data;
  },

  /**
   * 레벨업 히스토리 조회
   */
  async getMyLevelUpHistories(
    page = 0,
    size = 20
  ): Promise<LevelUpHistoriesResponse> {
    const response = await api.get("/users/me/level-up-histories", {
      params: { page, size },
    });
    return response.data.data;
  },

  /**
   * XP 원장 조회
   */
  async getMyXpLedger(page = 0, size = 20): Promise<XpLedgerResponse> {
    const response = await api.get("/users/me/xp-ledger", {
      params: { page, size },
    });
    return response.data.data;
  },
};
