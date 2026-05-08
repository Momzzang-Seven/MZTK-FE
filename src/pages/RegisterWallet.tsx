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
  const { loading, error, setError, handleWalletRegistration, handleUnlinkWallet } = useWalletService();
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
        title: "비밀복구 구문 확인에 실패했습니다.",
        desc: "올바른 구문을 입력해주세요.",
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
    } catch {
      setPin("");
      setConfirmPin("");
      setStep("PIN_SET");
    }
  }, [loading, wallet, pin, setWalletAddress, handleUnlinkWallet, handleWalletRegistration]);

  useEffect(() => {
    const verifyPin = async () => {
      if (authPin.length === 6 && step === "AUTH_PIN") {
        try {
          const encryptedJson = localStorage.getItem("encrypted_wallet");
          if (!encryptedJson) {
             setStep("MNEMONIC");
             return;
          }
          await ethers.Wallet.fromEncryptedJson(encryptedJson, authPin);
          setStep("MNEMONIC");
        } catch {
          setModal({
            title: "PIN 번호 인증 실패",
            desc: "잘못된 PIN 번호입니다. 다시 시도해주세요.",
          });
          setAuthPin("");
        }
      }
    };
    void verifyPin();

    if (pin.length === 6 && step === "PIN_SET") setStep("PIN_CONFIRM");
    if (confirmPin.length === 6 && step === "PIN_CONFIRM") {
      if (pin === confirmPin) void handleFinalize();
      else
        setModal({
          title: "PIN 번호 확인에 실패했습니다.",
          desc: "올바른 PIN 번호를 입력해주세요.",
        });
    }
  }, [authPin, pin, step, confirmPin, handleFinalize]);

  return (
    <FullScreenPage className="overflow-hidden">
      {loading && (
              <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                <LoadingSpinner size="lg" color="text-white" />
              </div>
      )}

      {step === "AUTH_PIN" && (
        <PinPad
          title="기존 PIN 번호 인증"
          desc="지갑을 변경하기 위해 기존에 설정한 PIN 번호를 입력해주세요"
          pin={authPin}
          onInput={(n) => setAuthPin((p) => p + n)}
          onDelete={() => setAuthPin((p) => p.slice(0, -1))}
        />
      )}

      {step === "MNEMONIC" && (
        <MnemonicForm
          mnemonics={mnemonics}
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
          title="PIN 번호를 등록해주세요"
          pin={pin}
          onInput={(n) => setPin((p) => p + n)}
          onDelete={() => setPin((p) => p.slice(0, -1))}
        />
      )}

      {step === "PIN_CONFIRM" && (
        <PinPad
          title="PIN 번호를 확인해주세요"
          pin={confirmPin}
          onInput={(n) => setConfirmPin((p) => p + n)}
          onDelete={() => setConfirmPin((p) => p.slice(0, -1))}
        />
      )}

      {step === "SUCCESS" && (
        <WalletSuccessSection onConfirm={() => navigate("/home")} />
      )}

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
          confirmLabel="다시 시도하기"
          onConfirmClick={() => setError(null)}
        />
      )}
    </FullScreenPage>
  );
};

export default RegisterWallet;
