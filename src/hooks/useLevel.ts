import { useState, useEffect, useCallback } from "react";
import { levelService } from "@services/level";
import { useUserStore } from "@store";
import { getKoreanErrorMessageFromError } from "@constant";
import type {
  MyLevelResponse,
  LevelUpResponse,
  XpLedgerResponse,
} from "../types/level";

/**
 * 레벨 및 XP 관련 기능을 관리하는 커스텀 훅
 */
export const useLevel = () => {
  const [levelInfo, setLevelInfo] = useState<MyLevelResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { setLevel, setXp, setMaxXp, setRewardMztkForNext } = useUserStore();

  /**
   * 내 레벨 정보 조회 및 스토어 동기화
   */
  const fetchLevelInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await levelService.getMyLevel();
      setLevelInfo(data);

      // 유저 스토어 동기화
      setLevel(data.level);
      setXp(data.availableXp);
      setMaxXp(data.requiredXpForNext); // Fix: use total requirement directly
      setRewardMztkForNext(data.rewardMztkForNext);
    } catch (err) {
      console.error("레벨 정보 조회 실패:", err);
      setError("레벨 정보를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [setLevel, setXp, setMaxXp, setRewardMztkForNext]);

  /**
   * 레벨업 수행
   */
  const handleLevelUp = async (): Promise<LevelUpResponse | null> => {
    try {
      setLoading(true);
      const result = await levelService.levelUp();
      // 레벨업 성공 후 정보 갱신
      await fetchLevelInfo();
      return result;
    } catch (err) {
      console.error("레벨업 실패:", err);
      setError(getKoreanErrorMessageFromError(err, "레벨업에 실패했습니다."));
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * XP 원장 조회
   */
  const getXpLedger = async (
    page = 0,
    size = 20
  ): Promise<XpLedgerResponse | null> => {
    try {
      return await levelService.getMyXpLedger(page, size);
    } catch (err) {
      console.error("XP 원장 조회 실패:", err);
      return null;
    }
  };

  useEffect(() => {
    fetchLevelInfo();
  }, [fetchLevelInfo]);

  return {
    levelInfo,
    loading,
    error,
    levelUp: handleLevelUp,
    getXpLedger,
    refreshLevel: fetchLevelInfo,
  };
};
