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
 * 지갑 등록 응답 DTO
 */
export interface RegisterWalletResponse {
  id: number;
  walletAddress: string;
  registeredAt: string;
}
