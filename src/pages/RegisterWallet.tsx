import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { MnemonicForm } from "@components/auth/MnemonicForm";
import { PinPad } from "@components/auth/PinPad";
import { CommonModal, LoadingSpinner } from "@components/common";
import { FullScreenPage } from "@components/layout";
import { WalletSuccessSection } from "@components/wallet/WalletSuccessSection";
import { useUserStore } from "@store";
import { useWalletService } from "@hooks";

const RegisterWallet = () => {
  const navigate = useNavigate();
  const setWalletAddress = useUserStore((state) => state.setWalletAddress);
  const {
    loading,
    error,
    setError,
    handleWalletRegistration,
    handleUnlinkWallet,
  } = useWalletService();

  const [step, setStep] = useState<
    "AUTH_PIN" | "MNEMONIC" | "PIN_SET" | "PIN_CONFIRM" | "SUCCESS"
  >(() => {
    return localStorage.getItem("encrypted_wallet") ? "AUTH_PIN" : "MNEMONIC";
  });

  const [mnemonics, setMnemonics] = useState<string[]>(Array(12).fill(""));
  const [authPin, setAuthPin] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [wallet, setWallet] = useState<ethers.HDNodeWallet | null>(null);
  const [modal, setModal] = useState<{ title: string; desc: string } | null>(
    null
  );

  const validateMnemonic = () => {
    try {
      const phrase = mnemonics.map((m) => m.trim().toLowerCase()).join(" ");
      const recoveredWallet = ethers.Wallet.fromPhrase(phrase);
      setWallet(recoveredWallet);
      setStep("PIN_SET");
    } catch {
      setModal({
        title: "비밀복구 구문 확인 실패",
        desc: "입력하신 구문이 올바르지 않습니다. 다시 확인해 주세요.",
      });
    }
  };

  const handleFinalize = useCallback(async () => {
    if (!wallet || loading) return;

    try {
      const existingWalletAddress = localStorage.getItem("wallet_address");
      if (existingWalletAddress) {
        await handleUnlinkWallet(existingWalletAddress);
        localStorage.removeItem("encrypted_wallet");
        localStorage.removeItem("wallet_address");
      }

      await handleWalletRegistration(wallet);

      const encryptedJson = await wallet.encrypt(pin);
      localStorage.setItem("encrypted_wallet", encryptedJson);
      localStorage.setItem("wallet_address", wallet.address);
      setWalletAddress(wallet.address);
      setStep("SUCCESS");
    } catch (err) {
      console.error("Registration finalize error:", err);
      setPin("");
      setConfirmPin("");
      setStep("PIN_SET");
    }
  }, [
    loading,
    wallet,
    pin,
    setWalletAddress,
    handleUnlinkWallet,
    handleWalletRegistration,
  ]);

  useEffect(() => {
    const verifyPin = async () => {
      if (authPin.length === 6 && step === "AUTH_PIN") {
        try {
          const encryptedJson = localStorage.getItem("encrypted_wallet");
          if (!encryptedJson) {
            setStep("MNEMONIC");
            return;
          }
          // PIN 검증용 (에러 안나면 성공)
          await ethers.Wallet.fromEncryptedJson(encryptedJson, authPin);
          setStep("MNEMONIC");
        } catch {
          setModal({
            title: "PIN 번호 인증 실패",
            desc: "잘못된 PIN 번호입니다. 다시 입력해 주세요.",
          });
          setAuthPin("");
        }
      }
    };
    void verifyPin();

    if (pin.length === 6 && step === "PIN_SET") setStep("PIN_CONFIRM");
    if (confirmPin.length === 6 && step === "PIN_CONFIRM") {
      if (pin === confirmPin) void handleFinalize();
      else {
        setModal({
          title: "PIN 번호 불일치",
          desc: "처음 입력한 PIN 번호와 다릅니다. 다시 입력해 주세요.",
        });
        setConfirmPin("");
      }
    }
  }, [authPin, pin, step, confirmPin, handleFinalize]);

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
            className="btn-press w-10 h-10 rounded-xl bg-white shadow-md shadow-gray-100 flex items-center justify-center border-none"
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

      {loading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <LoadingSpinner size="lg" color="text-main" />
          <p className="mt-4 text-[14px] font-black text-gray-900 animate-pulse">
            안전하게 지갑을 등록하고 있습니다...
          </p>
        </div>
      )}

      <div className="h-full pt-16 flex flex-col">
        {step === "AUTH_PIN" && (
          <PinPad
            title="기존 PIN 번호 인증"
            desc={
              <>
                지갑을 변경하기 위해 <br /> 기존에 설정한 PIN 번호를
                입력해주세요
              </>
            }
            pin={authPin}
            onInput={(n) => setAuthPin((p) => p + n)}
            onDelete={() => setAuthPin((p) => p.slice(0, -1))}
          />
        )}

        {step === "MNEMONIC" && (
          <MnemonicForm
            mnemonics={mnemonics}
            description={
              <>
                연결하실 지갑의 비밀복구구문 <br /> 12개 단어를 입력해주세요
              </>
            }
            onChange={(idx, val) => {
              const next = [...mnemonics];
              next[idx] = val;
              setMnemonics(next);
            }}
            onBulkChange={setMnemonics}
            onSubmit={validateMnemonic}
          />
        )}

        {step === "PIN_SET" && (
          <PinPad
            title="새로운 PIN 번호 설정"
            desc={
              <>
                앞으로 지갑 이용 승인 시 사용하실 <br /> 6자리 숫자를
                입력해주세요
              </>
            }
            pin={pin}
            onInput={(n) => setPin((p) => p + n)}
            onDelete={() => setPin((p) => p.slice(0, -1))}
          />
        )}

        {step === "PIN_CONFIRM" && (
          <PinPad
            title="PIN 번호 확인"
            desc={
              <>
                방금 입력한 6자리 숫자를 <br /> 한 번 더 입력해주세요
              </>
            }
            pin={confirmPin}
            onInput={(n) => setConfirmPin((p) => p + n)}
            onDelete={() => setConfirmPin((p) => p.slice(0, -1))}
          />
        )}

        {step === "SUCCESS" && (
          <WalletSuccessSection onConfirm={() => navigate("/my")} />
        )}
      </div>

      {modal && (
        <CommonModal
          title={modal.title}
          desc={modal.desc}
          confirmLabel="다시 시도하기"
          onConfirmClick={() => {
            setModal(null);
            if (step === "PIN_CONFIRM") setConfirmPin("");
            if (step === "AUTH_PIN") setAuthPin("");
          }}
        />
      )}

      {error && (
        <CommonModal
          title="등록 실패"
          desc={error}
          confirmLabel="확인"
          onConfirmClick={() => setError(null)}
        />
      )}
    </FullScreenPage>
  );
};

export default RegisterWallet;
