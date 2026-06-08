import type { SignRequestUnavailableReason, Web3Execution } from "./web3";

/**
 * 지갑 등록 목적 (Backend의 ChallengePurpose와 매칭)
 */
export type ChallengePurpose = "WALLET_REGISTRATION";

/**
 * 챌린지 생성 요청 DTO
 */
export interface CreateChallengeRequest {
  purpose: ChallengePurpose;
  walletAddress: string;
}

/**
 * 챌린지 응답 DTO
 */
export interface ChallengeResponse {
  nonce: string;
  message: string;
  expiresIn: number;
}

/**
 * 지갑 등록 요청 DTO
 */
export interface RegisterWalletRequest {
  walletAddress: string;
  signature: string;
  nonce: string;
}

/**
 * MOM-439 EIP-7702 승인 플로우에서의 wallet registration 상태
 */
export type WalletRegistrationStatus =
  | "APPROVAL_REQUIRED"
  | "APPROVAL_SIGNED"
  | "APPROVAL_PENDING_ONCHAIN"
  | "APPROVAL_RETRYABLE"
  | "REGISTERED"
  | "FINALIZATION_FAILED"
  | "LOCAL_CONFLICT"
  | "APPROVAL_FAILED"
  | "EXPIRED"
  | "CANCELED";

/**
 * FE 다음 동작 힌트
 */
export type WalletRegistrationNextAction =
  | "SIGN_APPROVAL"
  | "WAIT_FOR_APPROVAL_TRANSACTION"
  | "RETRY_APPROVAL"
  | "DONE"
  | "CONTACT_SUPPORT"
  | "NONE";

/**
 * approval transaction 요약 (상태 조회 응답에 포함)
 */
export interface WalletRegistrationTransaction {
  transactionId: number;
  transactionStatus: string;
  txHash: string | null;
}

/**
 * POST /web3/wallets 응답 DTO
 */
export interface RegisterWalletResponse {
  registrationId: string | null;
  status: WalletRegistrationStatus;
  walletId: number | null;
  walletAddress: string;
  registeredAt: string | null;
  nextAction: WalletRegistrationNextAction;
  web3: Web3Execution | null;
}

/**
 * GET /web3/wallet-registrations/{registrationId} 및 retry 응답 DTO
 */
export interface WalletRegistrationStatusResponse {
  registrationId: string;
  status: WalletRegistrationStatus;
  walletAddress: string;
  registeredWalletId: number | null;
  latestExecutionIntentId: string | null;
  latestExecutionStatus: string | null;
  approvalExpiresAt: string | null;
  transaction: WalletRegistrationTransaction | null;
  lastErrorCode: string | null;
  lastErrorReason: string | null;
  signRequestUnavailableReason: SignRequestUnavailableReason | null;
  nextAction: WalletRegistrationNextAction;
  web3: Web3Execution | null;
}
