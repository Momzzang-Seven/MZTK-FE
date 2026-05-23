import { useState } from "react";
import { walletService, web3Service } from "@services";
import { ethers } from "ethers";
import { MZTK_ABI } from "@abi";
import type {
  RegisterWalletResponse,
  SignRequest,
  Web3Execution,
} from "@types";
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
  signRequest: Partial<SignRequest> | null | undefined
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
  signRequest: Partial<SignRequest> | null | undefined
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

const extractApiErrorMessage = (error: unknown, fallback: string): string => {
  const errorResponse = error as {
    response?: { data?: { message?: string } };
  };
  return (
    errorResponse.response?.data?.message ||
    (error instanceof Error ? error.message : fallback)
  );
};

export const useWalletService = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * MOM-439 EIP-7702 승인 플로우 진입:
   *  1) challenge 발급
   *  2) ownership EIP-712 서명
   *  3) POST /web3/wallets
   * approve(escrow) 트랜잭션은 BE가 EIP-7702 batch로 처리하므로 FE에서 호출하지 않는다.
   */
  const handleWalletRegistration = async (
    wallet: ethers.HDNodeWallet
  ): Promise<RegisterWalletResponse> => {
    setLoading(true);

    try {
      const walletRegistrationDomain = getWalletRegistrationEip712Domain();

      // STEP 1: 챌린지 요청
      const { nonce, message } = await walletService.createChallenge({
        walletAddress: wallet.address,
        purpose: "WALLET_REGISTRATION",
      });

      // STEP 2: EIP-712 ownership 서명
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

      // STEP 3: 서명값과 정보를 서버에 보내 등록 시작
      return await walletService.registerWallet({
        walletAddress: wallet.address,
        signature: signature,
        nonce: nonce,
      });
    } catch (err) {
      setError(extractApiErrorMessage(err, "지갑 등록에 실패했습니다."));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkWallet = async (address: string) => {
    setLoading(true);
    try {
      await walletService.unlinkWallet(address);
    } catch (err) {
      setError(extractApiErrorMessage(err, "지갑 해제에 실패했습니다."));
      throw err;
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

      const signRequest = intent.signRequest;
      if (!signRequest) {
        throw new Error(INVALID_WEB3_SIGN_REQUEST_MESSAGE);
      }

      let signatureData = {};

      if (intent.execution.mode === "EIP7702") {
        validateEip7702SignRequest(signRequest);
        // EIP7702 - 2번 서명
        const auth = await wallet.authorize({
          chainId: signRequest.authorization.chainId,
          address: signRequest.authorization.delegateTarget,
          nonce: signRequest.authorization.authorityNonce,
        });
        const authSig = auth.signature.serialized;

        const submitSigObj = wallet.signingKey.sign(
          signRequest.submit.executionDigest
        );
        const submitSig = submitSigObj.serialized;
        signatureData = {
          authorizationSignature: authSig,
          submitSignature: submitSig,
        };
      } else if (intent.execution.mode === "EIP1559") {
        validateEip1559SignRequest(signRequest);
        // EIP1559 - 1번 서명
        const txRequest = {
          chainId: signRequest.transaction.chainId,
          to: signRequest.transaction.toAddress,
          value: signRequest.transaction.valueHex,
          data: signRequest.transaction.data,
          nonce: signRequest.transaction.nonce,
          gasLimit: signRequest.transaction.gasLimitHex,
          maxPriorityFeePerGas: signRequest.transaction.maxPriorityFeePerGasHex,
          maxFeePerGas: signRequest.transaction.maxFeePerGasHex,
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
    } catch (err) {
      setError(extractApiErrorMessage(err, "서명에 실패했습니다."));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAllowance = async (ownerAddress: string): Promise<bigint> => {
    if (!QNA_ESCROW_ADDRESS)
      throw new Error("QnA Escrow 주소가 설정되지 않았습니다.");
    const { RPC_URL, TOKEN_ADDRESS } = getNetworkConfig();
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(TOKEN_ADDRESS, MZTK_ABI[0], provider);
    return await contract.allowance(ownerAddress, QNA_ESCROW_ADDRESS);
  };

  return {
    loading,
    error,
    setError,
    handleWalletRegistration,
    handleUnlinkWallet,
    handleWeb3Signature,
    getAllowance,
  };
};
