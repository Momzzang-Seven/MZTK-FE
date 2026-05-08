/**
 * XP 획득 유형
 */
export type XpType = "CHECK_IN" | "STREAK_7D" | "WORKOUT" | "POST" | "COMMENT";

/**
 * 레벨업 보상 처리 상태
 */
export type RewardStatus = "PENDING" | "SUCCESS" | "FAILED";

/**
 * 보상 트랜잭션 수치 상태
 */
export type RewardTxStatus =
  | "CREATED"
  | "SIGNED"
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED_ONCHAIN"
  | "UNCONFIRMED";

/**
 * 보상 트랜잭션 단계 (FE 친화적 그룹화)
 */
export type RewardTxPhase = "PENDING" | "SUCCESS" | "FAILED";

/**
 * 내 레벨 정보 응답 형태
 */
export interface MyLevelResponse {
  level: number;
  availableXp: number;
  requiredXpForNext: number;
  rewardMztkForNext: number;
}

/**
 * 레벨 정책 아이템
 */
export interface LevelPolicyItem {
  currentLevel: number;
  toLevel: number;
  requiredXp: number;
  rewardMztk: number;
}

/**
 * XP 정책 아이템
 */
export interface XpPolicyItem {
  type: XpType;
  xpAmount: number;
  dailyCap: number;
}

/**
 * 레벨 및 XP 정책 응답 형태
 */
export interface LevelPoliciesResponse {
  levelPolicies: LevelPolicyItem[];
  xpPolicies: XpPolicyItem[];
}

/**
 * 레벨업 결과 응답 형태
 */
export interface LevelUpResponse {
  levelUpHistoryId: number;
  fromLevel: number;
  toLevel: number;
  spentXp: number;
  rewardMztk: number;
  rewardStatus: RewardStatus;
  rewardTxStatus: RewardTxStatus;
  rewardTxPhase: RewardTxPhase;
  rewardTxHash?: string;
  rewardExplorerUrl?: string;
}

/**
 * 레벨업 히스토리 아이템
 */
export interface LevelUpHistoryItem extends LevelUpResponse {
  createdAt: string;
}

/**
 * 레벨업 히스토리 목록 응답 형태
 */
export interface LevelUpHistoriesResponse {
  page: number;
  size: number;
  hasNext: boolean;
  histories: LevelUpHistoryItem[];
}

/**
 * XP 일일 제한 상태 아이템
 */
export interface XpDailyCapStatusItem {
  type: XpType;
  dailyCap: number;
  grantedCount: number;
  remainingCount: number;
}

/**
 * XP 원장 엔트리 아이템
 */
export interface XpLedgerEntryItem {
  xpLedgerId: number;
  type: XpType;
  xpAmount: number;
  earnedOn: string;
  occurredAt: string;
  idempotencyKey: string;
  sourceRef: string;
  createdAt: string;
}

/**
 * XP 원장 응답 형태
 */
export interface XpLedgerResponse {
  page: number;
  size: number;
  hasNext: boolean;
  earnedOn: string;
  entries: XpLedgerEntryItem[];
  todayCaps: XpDailyCapStatusItem[];
}
