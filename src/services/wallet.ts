import { api } from "./client";
import type {
  CreateChallengeRequest,
  ChallengeResponse,
  RegisterWalletRequest,
  RegisterWalletResponse,
  WalletRegistrationStatusResponse,
} from "../types/wallet";

/**
 * 지갑 관련 API 서비스
 */
export const walletService = {
  /**
   * 지갑 등록을 위한 챌린지(메시지) 생성
   */
  async createChallenge(
    request: CreateChallengeRequest
  ): Promise<ChallengeResponse> {
    const response = await api.post("/web3/challenges", request);
    return response.data.data;
  },

  /**
   * ownership 서명을 보내 지갑 등록 시작 (EIP-7702 승인 플로우 진입)
   */
  async registerWallet(
    request: RegisterWalletRequest
  ): Promise<RegisterWalletResponse> {
    const response = await api.post("/web3/wallets", request);
    return response.data.data;
  },

  /**
   * wallet registration 상태 조회 (polling 용)
   */
  async getWalletRegistrationStatus(
    registrationId: string
  ): Promise<WalletRegistrationStatusResponse> {
    const response = await api.get(
      `/web3/wallet-registrations/${registrationId}`
    );
    return response.data.data;
  },

  /**
   * 새 approval intent 재발급 (사용자가 직접 "다시 시도" 누른 경우)
   */
  async retryWalletApprovalIntent(
    registrationId: string
  ): Promise<WalletRegistrationStatusResponse> {
    const response = await api.post(
      `/web3/wallet-registrations/${registrationId}/approval-intent`
    );
    return response.data.data;
  },

  /**
   * 지갑 연결 해제 (Unlink)
   */
  async unlinkWallet(walletAddress: string): Promise<void> {
    await api.delete(`/web3/wallets/${walletAddress}`);
  },
};
