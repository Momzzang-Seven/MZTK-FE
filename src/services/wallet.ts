import { api } from "./client";
import type {
  CreateChallengeRequest,
  ChallengeResponse,
  RegisterWalletRequest,
  RegisterWalletResponse,
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
   * 서명된 메시지로 지갑 등록
   */
  async registerWallet(
    request: RegisterWalletRequest
  ): Promise<RegisterWalletResponse> {
    const response = await api.post("/web3/wallets", request);
    return response.data.data;
  },

  /**
   * 지갑 연결 해제 (Unlink)
   */
  async unlinkWallet(walletAddress: string): Promise<void> {
    await api.delete(`/web3/wallets/${walletAddress}`);
  },
};
