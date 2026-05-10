import { PinPad } from "@components/auth/PinPad";
import { CommonModal, LoadingSpinner } from "@components/common";
import { FullScreenPage } from "@components/layout";
import { WalletSuccessSection } from "@components/wallet/WalletSuccessSection";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import { useWalletService } from "@hooks";

const VerifyApprove = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    loading: isWalletLoading,
    error: walletError,
    setError: setWalletError,
    approveEscrow,
  } = useWalletService();

  const [authPin, setAuthPin] = useState("");
  const [step, setStep] = useState<"AUTH_PIN" | "SUCCESS" | "NO_WALLET">(() => {
    return localStorage.getItem("encrypted_wallet") ? "AUTH_PIN" : "NO_WALLET";
  });
  const [modal, setModal] = useState<{ title: string; desc: string } | null>(
    null
  );

  // location.state에서 승인할 금액을 받아옴 (단위: MZTK)
  const amount = location.state?.amount ?? 0;

  useEffect(() => {
    const runApprove = async () => {
      if (isWalletLoading || step !== "AUTH_PIN" || authPin.length !== 6)
        return;

      try {
        const encryptedJson = localStorage.getItem("encrypted_wallet");
        if (!encryptedJson) {
          setStep("NO_WALLET");
          return;
        }

        // 1. PIN 번호로 지갑 복호화
        const decryptedWallet = await ethers.Wallet.fromEncryptedJson(
          encryptedJson,
          authPin
        );

        // 2. Approve 트랜잭션 실행
        // 넉넉하게 승인하거나 딱 필요한 만큼만 승인 (여기서는 무제한 승인 권장 패턴 사용)
        await approveEscrow(decryptedWallet as unknown as ethers.HDNodeWallet);

        setStep("SUCCESS");
      } catch (error) {
        console.error("Approve verification failed:", error);
        setModal({
          title: "인증 실패",
          desc: "잘못된 PIN 번호이거나 트랜잭션 전송 중 오류가 발생했습니다.",
        });
        setAuthPin("");
      }
    };

    void runApprove();
  }, [authPin, step, isWalletLoading, approveEscrow]);

  const handleSuccessConfirm = () => {
    // 승인 성공 후 이전 페이지(글 작성 폼)로 복귀
    navigate(-1);
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

      {isWalletLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <LoadingSpinner size="lg" color="text-main" />
          <p className="mt-4 text-[14px] font-black text-gray-900 animate-pulse">
            지갑을 인증하고 승인 요청을 보내고 있습니다...
          </p>
        </div>
      )}

      <div className="h-full pt-16 flex flex-col">
        {step === "NO_WALLET" && (
          <WalletSuccessSection
            title={"지갑을 찾을 수 없어요"}
            description={"서비스 이용을 위해 지갑 등록이 필요해요."}
            onConfirm={() => navigate(`/register-wallet`)}
            buttonLabel="지갑 등록하기"
          />
        )}

        {step === "AUTH_PIN" && (
          <PinPad
            title="PIN 번호 인증"
            desc={
              <>
                보상 토큰({amount} MZTK) 예치 권한을 <br />
                승인하기 위해 PIN 번호를 입력해주세요
              </>
            }
            pin={authPin}
            onInput={(n) => setAuthPin((p) => p + n)}
            onDelete={() => setAuthPin((p) => p.slice(0, -1))}
          />
        )}

        {step === "SUCCESS" && (
          <WalletSuccessSection
            title={"토큰 승인이 완료되었어요"}
            description={"이제 질문을 등록하고 보상을 설정할 수 있습니다."}
            onConfirm={handleSuccessConfirm}
            buttonLabel="작성 페이지로 돌아가기"
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

      {walletError && (
        <CommonModal
          title="승인 실패"
          desc={walletError}
          confirmLabel="확인"
          onConfirmClick={() => {
            setWalletError(null);
            setAuthPin("");
          }}
        />
      )}
    </FullScreenPage>
  );
};

export default VerifyApprove;
