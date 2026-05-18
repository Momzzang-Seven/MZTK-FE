import { useState } from "react";
import { walletService, web3Service } from "@services";
import { ethers, getBytes } from "ethers";
import { MZTK_ABI } from "@abi";
import type { SignRequest, Web3Execution } from "@types";
import { useUserStore } from "@store";
import { getNetworkConfig, getWalletRegistrationEip712Domain } from "@utils";

const QNA_ESCROW_ADDRESS = import.meta.env.VITE_QNA_ESCROW_CONTRACT;

if (!QNA_ESCROW_ADDRESS) {
  console.error("CRITICAL: VITE_QNA_ESCROW_CONTRACT is not defined in .env");
}

const INVALID_WEB3_SIGN_REQUEST_MESSAGE =
  "Web3 서명 요청 정보가 올바르지 않습니다. 잠시 후 다시 시도해 주세요.";

const isFilledString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const validateEip7702SignRequest = (
  signRequest: Partial<SignRequest> | undefined
) => {
  const authorization = signRequest?.authorization;
  const submit = signRequest?.submit;

  if (
    !authorization ||
    !submit ||
    !isFilledString(authorization.payloadHashToSign) ||
    !isFilledString(submit.executionDigest)
  ) {
    throw new Error(INVALID_WEB3_SIGN_REQUEST_MESSAGE);
  }
};

const validateEip1559SignRequest = (
  signRequest: Partial<SignRequest> | undefined
) => {
  const transaction = signRequest?.transaction;

  if (
    !transaction ||
    !isFiniteNumber(transaction.chainId) ||
    !isFilledString(transaction.toAddress) ||
    !isFilledString(transaction.valueHex) ||
    !isFilledString(transaction.data) ||
    !isFiniteNumber(transaction.nonce) ||
    !isFilledString(transaction.gasLimitHex) ||
    !isFilledString(transaction.maxPriorityFeePerGasHex) ||
    !isFilledString(transaction.maxFeePerGasHex)
  ) {
    throw new Error(INVALID_WEB3_SIGN_REQUEST_MESSAGE);
  }
};

export const useWalletService = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleWalletRegistration = async (
    wallet: ethers.HDNodeWallet,
    network: "OPT" | "BASE" = useUserStore.getState().selectedNetwork
  ) => {
    setLoading(true);

    try {
      // 🌐 선택된 네트워크에 따른 설정값 로드
      const { RPC_URL, TOKEN_ADDRESS: TARGET_TOKEN_ADDRESS } =
        getNetworkConfig(network);
      const walletRegistrationDomain = getWalletRegistrationEip712Domain();

      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const connectedWallet = wallet.connect(provider);

      // STEP 1: 챌린지 요청
      const challengeRes = await walletService.createChallenge({
        walletAddress: wallet.address,
        purpose: "WALLET_REGISTRATION",
      });

      const { nonce, message } = challengeRes;

      // STEP 2: EIP-712 서명 수행
      const signature = await wallet.signTypedData(
        walletRegistrationDomain,
        {
          AuthRequest: [
            { name: "content", type: "string" },
            { name: "nonce", type: "string" },
          ],
        },
        {
          content: message,
          nonce: nonce,
        }
      );

      // STEP 3: 서명값과 정보를 서버에 보내 최종 등록하기
      await walletService.registerWallet({
        walletAddress: wallet.address,
        signature: signature,
        nonce: nonce,
      });

      // STEP 4: 무제한 토큰 전송 권한 위임 (실패해도 등록 자체는 성공)
      try {
        const contract = new ethers.Contract(
          TARGET_TOKEN_ADDRESS,
          MZTK_ABI[0],
          connectedWallet
        );
        const allowance = ethers.MaxUint256;
        const tx = await contract.approve(QNA_ESCROW_ADDRESS, allowance);
        await tx.wait();
      } catch (approveErr) {
        // approve 실패는 등록 실패가 아님 — 경고 수준으로만 로깅
        console.warn("토큰 approve 트랜잭션 실패 (등록은 완료됨):", approveErr);
      }
    } catch (error) {
      const errorResponse = error as {
        response?: { data?: { message?: string } };
      };
      const message =
        errorResponse.response?.data?.message || "지갑 등록에 실패했습니다.";
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkWallet = async (address: string) => {
    setLoading(true);
    try {
      await walletService.unlinkWallet(address);
    } catch (error) {
      const errorResponse = error as {
        response?: { data?: { message?: string } };
      };
      const message =
        errorResponse.response?.data?.message || "지갑 해제에 실패했습니다.";
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleWeb3Signature = async (
    executionIntentId: string,
    wallet: ethers.HDNodeWallet,
    intent: Web3Execution
  ) => {
    setLoading(true);

    try {
      if (!isFilledString(executionIntentId)) {
        throw new Error(INVALID_WEB3_SIGN_REQUEST_MESSAGE);
      }

      let signatureData = {};

      if (intent.execution.mode === "EIP7702") {
        validateEip7702SignRequest(intent.signRequest);
        // EIP7702 - 2번 서명
        const authSig = await wallet.signMessage(
          getBytes(intent.signRequest.authorization.payloadHashToSign)
        );
        const submitSig = await wallet.signMessage(
          getBytes(intent.signRequest.submit.executionDigest)
        );
        signatureData = {
          authorizationSignature: authSig,
          submitSignature: submitSig,
        };
      } else if (intent.execution.mode === "EIP1559") {
        validateEip1559SignRequest(intent.signRequest);
        // EIP1559 - 1번 서명
        const txRequest = {
          chainId: intent.signRequest.transaction.chainId,
          to: intent.signRequest.transaction.toAddress,
          value: intent.signRequest.transaction.valueHex,
          data: intent.signRequest.transaction.data,
          nonce: intent.signRequest.transaction.nonce,
          gasLimit: intent.signRequest.transaction.gasLimitHex,
          maxPriorityFeePerGas:
            intent.signRequest.transaction.maxPriorityFeePerGasHex,
          maxFeePerGas: intent.signRequest.transaction.maxFeePerGasHex,
          type: 2,
        };
        const signedTx = await wallet.signTransaction(txRequest);
        signatureData = { signedRawTransaction: signedTx };
      } else {
        throw new Error(INVALID_WEB3_SIGN_REQUEST_MESSAGE);
      }

      return await web3Service.executeWeb3Transaction(
        executionIntentId,
        signatureData
      );
    } catch (error) {
      const errorResponse = error as {
        response?: { data?: { message?: string } };
      };
      const message =
        errorResponse.response?.data?.message ||
        (error instanceof Error ? error.message : "서명에 실패했습니다.");
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getAllowance = async (
    ownerAddress: string,
    network: "OPT" | "BASE" = useUserStore.getState().selectedNetwork
  ): Promise<bigint> => {
    if (!QNA_ESCROW_ADDRESS)
      throw new Error("QnA Escrow 주소가 설정되지 않았습니다.");
    const { RPC_URL, TOKEN_ADDRESS } = getNetworkConfig(network);
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(TOKEN_ADDRESS, MZTK_ABI[0], provider);
    return await contract.allowance(ownerAddress, QNA_ESCROW_ADDRESS);
  };

  const approveEscrow = async (
    wallet: ethers.HDNodeWallet,
    amount: bigint = ethers.MaxUint256,
    network: "OPT" | "BASE" = useUserStore.getState().selectedNetwork
  ) => {
    if (!QNA_ESCROW_ADDRESS)
      throw new Error("QnA Escrow 주소가 설정되지 않았습니다.");
    setLoading(true);
    try {
      const { RPC_URL, TOKEN_ADDRESS } = getNetworkConfig(network);
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      const connectedWallet = wallet.connect(provider);
      const contract = new ethers.Contract(
        TOKEN_ADDRESS,
        MZTK_ABI[0],
        connectedWallet
      );
      const tx = await contract.approve(QNA_ESCROW_ADDRESS, amount);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Approve failed:", error);
      setError("토큰 승인(Approve)에 실패했습니다.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setError,
    handleWalletRegistration,
    handleUnlinkWallet,
    handleWeb3Signature,
    getAllowance,
    approveEscrow,
  };
};
