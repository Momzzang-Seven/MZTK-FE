import { PinPad } from "@components/auth/PinPad";
import { CommonModal, LoadingSpinner } from "@components/common";
import { FullScreenPage } from "@components/layout";
import { WalletSuccessSection } from "@components/wallet/WalletSuccessSection";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ethers } from "ethers";
import type { Web3Execution } from "@types";
import { usePostService, useWalletService } from "@hooks";

interface ApiErrorResponse {
    response?: {
        data?: {
            code?: string;
            message?: string;
        };
    };
}

const VerifyWallet = () => {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    const { loading: isWalletLoading, error: walletError, setError: setWalletError, handleWeb3Signature } = useWalletService();
    const { isPostLoading, error: postError, setError: setPostError, recoverCreate, getIncompletedPostTransaction } = usePostService();

    const [authPin, setAuthPin] = useState("");
    const [step, setStep] = useState<
        "AUTH_PIN" | "SUCCESS" | "NO_WALLET"
    >(() => {
        return localStorage.getItem("encrypted_wallet") ? "AUTH_PIN" : "NO_WALLET";
    });
    const [modal, setModal] = useState<{ title: string; desc: string } | null>(
        null
    );

    const intent = location.state.intent ?? null;
    
    const getWeb3Transaction = useCallback(async () => {
        if (!intent) throw new Error("유효하지 않은 접근입니다.");

        try {
            if (intent.transaction) {
                return intent as Web3Execution;
            } else {
                const postData = await getIncompletedPostTransaction(intent.executionIntent.id);
                return postData as Web3Execution;
            }
        } catch {
            setAuthPin("");
            setStep("AUTH_PIN");
            return null;
        }
    }, [intent, getIncompletedPostTransaction]);

    const handleRecoverAndRetry = useCallback(async (currentIntent: Web3Execution, wallet: ethers.Wallet) => {
        try {
            const type = currentIntent.resource.type;
            let recoveryRes;

            if (type === "ANSWER" && params.parentId) {
                recoveryRes = await recoverCreate(type, Number(params.id), Number(params.parentId));
            } else {
                recoveryRes = await recoverCreate(type, Number(params.id));
            }

            if (recoveryRes?.web3) {
                await handleWeb3Signature(
                    recoveryRes.web3.executionIntent.id,
                    wallet as unknown as ethers.HDNodeWallet,
                    recoveryRes.web3
                );
                setStep("SUCCESS");
            } else {
                throw new Error("복구된 실행 정보가 유효하지 않습니다.");
            }
        } catch {
            setAuthPin("");
            setStep("AUTH_PIN");
        }
    }, [params.id, params.parentId, recoverCreate, handleWeb3Signature]);

    const handleSignProcess = useCallback(async (currentIntent: Web3Execution, wallet: ethers.Wallet) => {
        try {
            if (currentIntent.executionIntent.status === "EXPIRED") {
                await handleRecoverAndRetry(currentIntent, wallet);
                return;
            }

            await handleWeb3Signature(
                currentIntent.executionIntent.id,
                wallet as unknown as ethers.HDNodeWallet,
                currentIntent
            );
            setStep("SUCCESS");
        } catch (error) {
            const apiError = error as ApiErrorResponse;
            if (apiError.response?.data?.code === "WEB3_013") {
                await handleRecoverAndRetry(currentIntent, wallet);
            } else {
                setAuthPin("");
                setStep("AUTH_PIN");
        }
    }
    }, [handleWeb3Signature, handleRecoverAndRetry]);

    useEffect(() => {
        const verifyPin = async () => {
            if (isWalletLoading || isPostLoading || step !== "AUTH_PIN") return;
            
            if (authPin.length === 6) {
                try {
                    const encryptedJson = localStorage.getItem("encrypted_wallet");
                    if (!encryptedJson) {
                        setStep("NO_WALLET");
                        return;
                    }
                    const decryptedWallet = await ethers.Wallet.fromEncryptedJson(encryptedJson, authPin);
                    const web3Data = await getWeb3Transaction();
                    
                    if (web3Data) {
                        await handleSignProcess(web3Data, decryptedWallet as ethers.Wallet);
                    }

                } catch {
                    setModal({
                        title: "인증 실패",
                        desc: "잘못된 PIN 번호입니다. 다시 시도해주세요.",
                    });
                    setAuthPin("");
                    setStep("AUTH_PIN");
                }   
            }
        };
        void verifyPin();
    }, [isPostLoading, authPin, step, isWalletLoading, getWeb3Transaction, handleSignProcess]);

    const handleSuccessConfirm = () => {
        switch (intent.resource.type) {
            case "QUESTION": navigate("/community/question"); break;
            case "ANSWER": navigate(-2); break;
            default: navigate("/community/question"); break;
        }
    };

    return (
        <FullScreenPage className="overflow-hidden">
            {(isWalletLoading || isPostLoading) && (
                <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                    <LoadingSpinner size="lg" color="text-white" />
                </div>
            )}

            {step === "NO_WALLET" && (
                <WalletSuccessSection
                    title={"지갑을 찾을 수 없어요"}
                    description={"토큰 보상을 받기 위해 지갑이 필요해요."}
                    onConfirm={() => navigate(`/register-wallet`)}
                    buttonLabel="지갑 등록하기"
                />
            )}

            {step === "AUTH_PIN" && (
                <PinPad
                    title="PIN 번호 인증"
                    desc="토큰 보상 예치를 위해 PIN 번호를 입력해주세요."
                    pin={authPin}
                    onInput={(n) => setAuthPin((p) => p + n)}
                    onDelete={() => setAuthPin((p) => p.slice(0, -1))}
                />
            )}

            {step === "SUCCESS" && (
                <WalletSuccessSection
                    title={"트랜잭션 수행 요청이 완료되었어요"}
                    description={"블록체인 처리가 완료되면 알려드릴게요."}
                    onConfirm={handleSuccessConfirm}
                />
            )}

            {modal && (
                <CommonModal
                    title={modal.title}
                    desc={modal.desc}
                    confirmLabel="다시 시도하기"
                    onConfirmClick={() => {
                        setModal(null);
                        setAuthPin("");
                    }}
                />
            )}

            {postError && (
                <CommonModal
                    title="요청 실패"
                    desc={postError}
                    confirmLabel="다시 시도하기"
                    onConfirmClick={() => setPostError(null)}
                />
            )}

            {walletError && (
                <CommonModal
                    title="서명 실패"
                    desc={walletError}
                    confirmLabel="다시 시도하기"
                    onConfirmClick={() => setWalletError(null)}
                />
            )}
        </FullScreenPage>
    );
};

export default VerifyWallet;