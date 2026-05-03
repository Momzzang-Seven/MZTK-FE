import { useState } from "react";
import { walletService, web3Service } from "@services";
import { ethers, getBytes } from "ethers";
import { MZTK_ABI } from "@abi";
import type { ExecutionWeb3Intent } from "@types";

const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
const QNA_ESCROW_ADDRESS = import.meta.env.VITE_QNA_ESCROW_CONTRACT;

export const useWalletService = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleWalletRegistration = async (wallet: ethers.HDNodeWallet) => {
        setLoading(true);

        try {
            const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
            const connectedWallet = wallet.connect(provider);

            // STEP 1: 챌린지 요청
            const challengeRes = await walletService.createChallenge({
                walletAddress: wallet.address,
                purpose: "WALLET_REGISTRATION"
            });
            
            const { nonce, message } = challengeRes;

            // STEP 2: EIP-712 서명 수행
            const signature = await wallet.signTypedData(
                {
                    name: "MomzzangSeven",
                    version: "1",
                    chainId: 11155420,
                    verifyingContract: TOKEN_ADDRESS,   
                },
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
                nonce: nonce
            });

            // STEP 4: 무제한 토큰 전송 권한 위임
            const contract = new ethers.Contract(TOKEN_ADDRESS, MZTK_ABI[0], connectedWallet);
            const allowance = ethers.MaxUint256;

            const tx = await contract.approve(QNA_ESCROW_ADDRESS, allowance);
            await tx.wait();
        } catch (error) {
            const errorResponse = error as { response?: { data?: { message?: string } } };
            const message = errorResponse.response?.data?.message || "지갑 등록에 실패했습니다.";
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
            const errorResponse = error as { response?: { data?: { message?: string } } };
            const message = errorResponse.response?.data?.message || "지갑 해제에 실패했습니다.";
            setError(message);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleWeb3Signature = async (executionIntentId: string, wallet: ethers.HDNodeWallet, intent: ExecutionWeb3Intent) => {
        setLoading(true);

        try {
            let signatureData = {};

            if (intent.execution.mode === 'EIP7702') {
                // EIP7702 - 2번 서명
                const authSig = await wallet.signMessage(getBytes(intent.signRequest.authorization.payloadHashToSign));
                const submitSig = await wallet.signMessage(getBytes(intent.signRequest.submit.executionDigest));  
                signatureData = { authorizationSignature: authSig, submitSignature: submitSig };
            } else if (intent.execution.mode === 'EIP1559') {
                // EIP1559 - 1번 서명
                const txRequest = {
                    chainId: intent.signRequest.transaction.chainId,
                    to: intent.signRequest.transaction.toAddress,
                    value: intent.signRequest.transaction.valueHex,
                    data: intent.signRequest.transaction.data,
                    nonce: intent.signRequest.transaction.nonce,
                    gasLimit: intent.signRequest.transaction.gasLimitHex,
                    maxPriorityFeePerGas: intent.signRequest.transaction.maxPriorityFeePerGasHex,
                    maxFeePerGas: intent.signRequest.transaction.maxFeePerGasHex,
                    type: 2
                };
                const signedTx = await wallet.signTransaction(txRequest);
                signatureData = { signedRawTransaction: signedTx };
            }

            return await web3Service.executeWeb3Transaction(executionIntentId, signatureData);
        } catch (error) {
            const errorResponse = error as { response?: { data?: { message?: string } } };
            const message = errorResponse.response?.data?.message || "서명에 실패했습니다.";
            setError(message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    return { loading, error, setError, handleWalletRegistration, handleUnlinkWallet, handleWeb3Signature};
}