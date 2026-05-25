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

const WEB3_RECOVERY_BLOCKED_MODAL = {
  title: "블록체인 확인 지연",
  desc: "이미 전송된 트랜잭션의 결과 확인이 지연되고 있습니다. 중복 실행을 막기 위해 잠시 후 다시 확인해 주세요.",
} as const;

const isWeb3RecoveryBlocked = (intent: Web3Execution) => {
  return (
    intent.recoveryStatus === "ONCHAIN_UNCERTAIN" ||
    intent.retryAllowed === false
  );
};

const VerifyWallet = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const {
    loading: isWalletLoading,
    error: walletError,
    setError: setWalletError,
    handleWeb3Signature,
  } = useWalletService();
  const {
    isPostLoading,
    error: postError,
    setError: setPostError,
    recoverCreate,
    getIncompletedPostTransaction,
  } = usePostService();

  const [authPin, setAuthPin] = useState("");
  const [step, setStep] = useState<"AUTH_PIN" | "SUCCESS" | "NO_WALLET">(() => {
    return localStorage.getItem("encrypted_wallet") ? "AUTH_PIN" : "NO_WALLET";
  });
  const [modal, setModal] = useState<{ title: string; desc: string } | null>(
    null
  );

  const intent = (location.state as { intent?: Web3Execution } | null)?.intent;

  const getWeb3Transaction = useCallback(async () => {
    if (!intent) throw new Error("유효하지 않은 접근입니다.");

    try {
      if (intent.transaction) {
        return intent as Web3Execution;
      } else {
        const postData = await getIncompletedPostTransaction(
          intent.executionIntent.id
        );
        return postData as Web3Execution;
      }
    } catch {
      setAuthPin("");
      setStep("AUTH_PIN");
      return null;
    }
  }, [intent, getIncompletedPostTransaction]);

  const handleRecoverAndRetry = useCallback(
    async (currentIntent: Web3Execution, wallet: ethers.Wallet) => {
      if (isWeb3RecoveryBlocked(currentIntent)) {
        setModal(WEB3_RECOVERY_BLOCKED_MODAL);
        setAuthPin("");
        setStep("AUTH_PIN");
        return;
      }

      try {
        const type = currentIntent.resource.type;
        let recoveryRes;

        if (type === "ANSWER" && params.parentId) {
          recoveryRes = await recoverCreate(
            type,
            Number(params.id),
            Number(params.parentId)
          );
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
    },
    [params.id, params.parentId, recoverCreate, handleWeb3Signature]
  );

  const handleSignProcess = useCallback(
    async (currentIntent: Web3Execution, wallet: ethers.Wallet) => {
      try {
        if (isWeb3RecoveryBlocked(currentIntent)) {
          setModal(WEB3_RECOVERY_BLOCKED_MODAL);
          setAuthPin("");
          setStep("AUTH_PIN");
          return;
        }

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
    },
    [handleWeb3Signature, handleRecoverAndRetry]
  );

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
          // Wallet.fromEncryptedJson을 사용하여 니모닉을 포함한 지갑 객체 복구
          const decryptedWallet = await ethers.Wallet.fromEncryptedJson(
            encryptedJson,
            authPin
          );
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
  }, [
    isPostLoading,
    authPin,
    step,
    isWalletLoading,
    getWeb3Transaction,
    handleSignProcess,
  ]);

  const handleSuccessConfirm = () => {
    if (!intent) {
      navigate("/community/question");
      return;
    }

    switch (intent.resource.type) {
      case "QUESTION":
        navigate("/community/question");
        break;
      case "ANSWER":
        navigate(-2);
        break;
      default:
        navigate("/community/question");
        break;
    }
  };

  return (
    <FullScreenPage className="overflow-hidden bg-white">
      {/* ── Background Decoration ── */}
      <div className="fixed -top-20 -right-20 w-64 h-64 bg-main opacity-[0.05] blur-[80px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-20 -left-20 w-64 h-64 bg-main opacity-[0.03] blur-[80px] rounded-full pointer-events-none" />

      {/* ── Navigation ── */}
      {step !== "SUCCESS" && (
        <div className="absolute top-6 left-6 z-50">
          <button
            onClick={() => navigate(-1)}
            className="btn-press w-10 h-10 rounded-xl bg-white shadow-md shadow-gray-100 flex items-center justify-center border-none transition-all active:scale-95"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111827"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        </div>
      )}

      {(isWalletLoading || isPostLoading) && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <LoadingSpinner size="lg" color="text-main" />
          <p className="mt-4 text-[14px] font-black text-gray-900 animate-pulse">
            블록체인 트랜잭션을 안전하게 처리하고 있습니다...
          </p>
        </div>
      )}

      <div className="h-full pt-16 flex flex-col">
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
            desc={
              <>
                {intent?.resource.type === "QUESTION"
                  ? "질문 보상 예치 및 게시글 등록을 위해"
                  : intent?.resource.type === "ANSWER"
                    ? "답변 등록 및 보상 수령 권한 인증을 위해"
                    : "트랜잭션 실행 및 블록체인 서명을 위해"}
                <br />
                PIN 번호를 입력해주세요
              </>
            }
            pin={authPin}
            onInput={(n) => setAuthPin((p) => p + n)}
            onDelete={() => setAuthPin((p) => p.slice(0, -1))}
          />
        )}

        {step === "SUCCESS" && (
          <WalletSuccessSection
            title={
              intent?.resource.type === "QUESTION"
                ? "질문 등록 요청이 완료되었어요"
                : intent?.resource.type === "ANSWER"
                  ? "답변 등록 요청이 완료되었어요"
                  : "트랜잭션 수행 요청이 완료되었어요"
            }
            description={
              <>
                블록체인 네트워크에서 처리가 완료되면
                <br />
                커뮤니티에서 게시글을 확인하실 수 있습니다.
              </>
            }
            onConfirm={handleSuccessConfirm}
            buttonLabel="확인"
          />
        )}
      </div>

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
