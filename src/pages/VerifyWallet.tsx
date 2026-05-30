import { PinPad } from "@components/auth/PinPad";
import { CommonModal, LoadingSpinner } from "@components/common";
import { FullScreenPage } from "@components/layout";
import { WalletSuccessSection } from "@components/wallet/WalletSuccessSection";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ethers } from "ethers";
import type { Web3Execution } from "@types";
import { usePostService, useWalletService } from "@hooks";
import { VERIFY_WALLET_TEXT } from "@constant";

interface ApiErrorResponse {
  response?: {
    data?: {
      code?: string;
      message?: string;
    };
  };
}

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
    if (!intent) throw new Error(VERIFY_WALLET_TEXT.invalidAccess);

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
        setModal(VERIFY_WALLET_TEXT.recoveryBlockedModal);
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
          throw new Error(VERIFY_WALLET_TEXT.invalidRecovery);
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
          setModal(VERIFY_WALLET_TEXT.recoveryBlockedModal);
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
          setModal(VERIFY_WALLET_TEXT.pinFailureModal);
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
            {VERIFY_WALLET_TEXT.loading}
          </p>
        </div>
      )}

      <div className="h-full pt-16 flex flex-col">
        {step === "NO_WALLET" && (
          <WalletSuccessSection
            title={VERIFY_WALLET_TEXT.noWallet.title}
            description={VERIFY_WALLET_TEXT.noWallet.description}
            onConfirm={() => navigate(`/register-wallet`)}
            buttonLabel={VERIFY_WALLET_TEXT.noWallet.buttonLabel}
          />
        )}

        {step === "AUTH_PIN" && (
          <PinPad
            title={VERIFY_WALLET_TEXT.pin.title}
            desc={
              <>
                {intent
                  ? VERIFY_WALLET_TEXT.pin.descriptionByActionType[
                      intent.actionType
                    ]
                  : VERIFY_WALLET_TEXT.pin.defaultDescription}
                <br />
                {VERIFY_WALLET_TEXT.pin.instruction}
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
              intent
                ? VERIFY_WALLET_TEXT.success.titleByActionType[
                    intent.actionType
                  ]
                : VERIFY_WALLET_TEXT.success.defaultTitle
            }
            description={
              <>
                {VERIFY_WALLET_TEXT.success.description[0]}
                <br />
                {VERIFY_WALLET_TEXT.success.description[1]}
              </>
            }
            onConfirm={handleSuccessConfirm}
            buttonLabel={VERIFY_WALLET_TEXT.success.buttonLabel}
          />
        )}
      </div>

      {modal && (
        <CommonModal
          title={modal.title}
          desc={modal.desc}
          confirmLabel={VERIFY_WALLET_TEXT.modal.retryButtonLabel}
          onConfirmClick={() => {
            setModal(null);
            setAuthPin("");
          }}
        />
      )}

      {postError && (
        <CommonModal
          title={VERIFY_WALLET_TEXT.modal.postErrorTitle}
          desc={postError}
          confirmLabel={VERIFY_WALLET_TEXT.modal.retryButtonLabel}
          onConfirmClick={() => setPostError(null)}
        />
      )}

      {walletError && (
        <CommonModal
          title={VERIFY_WALLET_TEXT.modal.walletErrorTitle}
          desc={walletError}
          confirmLabel={VERIFY_WALLET_TEXT.modal.retryButtonLabel}
          onConfirmClick={() => setWalletError(null)}
        />
      )}
    </FullScreenPage>
  );
};

export default VerifyWallet;
