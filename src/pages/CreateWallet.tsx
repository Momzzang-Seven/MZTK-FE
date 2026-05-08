import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ethers, HDNodeWallet } from "ethers";
import { MnemonicDisplay } from "../components/auth/MnemonicDisplay";
import { MnemonicVerify } from "../components/auth/MnemonicVerify";
import { PinPad } from "../components/auth/PinPad";
import { CommonModal } from "../components/common";
import { FullScreenPage } from "@components/layout";
import { WalletSuccessSection } from "@components/wallet/WalletSuccessSection";
import { useUserStore } from "@store";

type Step =
  | "AUTH_PIN"
  | "SHOW"
  | "VERIFY"
  | "PIN_SET"
  | "PIN_CONFIRM"
  | "SUCCESS";

const CreateWallet = () => {
  const navigate = useNavigate();
  const setWalletAddress = useUserStore((state) => state.setWalletAddress);
  const [step, setStep] = useState<Step>(() => {
    return localStorage.getItem("encrypted_wallet") ? "AUTH_PIN" : "SHOW";
  });

  const [wallet, setWallet] = useState<HDNodeWallet | null>(null);
  const [mnemonics, setMnemonics] = useState<string[]>([]);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [authPin, setAuthPin] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [modal, setModal] = useState<{ title: string; desc: string } | null>(
    null
  );

  const emptyIndices = useMemo(() => [1, 4, 7, 10], []);

  useEffect(() => {
    const newWallet = ethers.Wallet.createRandom();
    const words = newWallet.mnemonic?.phrase.split(" ") || [];
    setWallet(newWallet);
    setMnemonics(words);

    const initial = [...words];
    emptyIndices.forEach((idx) => (initial[idx] = ""));
    setUserInputs(initial);
  }, [emptyIndices]);

  const handleVerify = () => {
    const isSuccess = userInputs.every((word, i) => word === mnemonics[i]);
    if (isSuccess) setStep("PIN_SET");
    else
      setModal({
        title: "비밀복구 구문 확인에 실패했습니다.",
        desc: "빈 칸을 올바르게 채워주세요.",
      });
  };

  const finalize = useCallback(async () => {
    if (!wallet) return;
    try {
      const encrypted = await wallet.encrypt(pin);
      localStorage.setItem("encrypted_wallet", encrypted);
      localStorage.setItem("wallet_address", wallet.address);
      setWalletAddress(wallet.address);
      setStep("SUCCESS");
    } catch {
      alert("보안 저장 중 오류가 발생했습니다.");
    }
  }, [wallet, pin, setWalletAddress]);

  useEffect(() => {
    const verifyPin = async () => {
      if (authPin.length === 6 && step === "AUTH_PIN") {
        try {
          const encryptedJson = localStorage.getItem("encrypted_wallet");
          if (!encryptedJson) {
            setStep("SHOW");
            return;
          }
          await ethers.Wallet.fromEncryptedJson(encryptedJson, authPin);
          setStep("SHOW");
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
      if (pin === confirmPin) void finalize();
      else {
        setModal({
          title: "PIN 번호 확인에 실패했습니다.",
          desc: "올바른 PIN 번호를 입력해주세요.",
        });
      }
    }
  }, [authPin, pin, confirmPin, step, finalize]);

  return (
    <FullScreenPage className="overflow-hidden">
      {step === "AUTH_PIN" && (
        <PinPad
          title="기존 PIN 번호 인증"
          desc="새 지갑을 생성하기 위해 기존에 설정한 PIN 번호를 입력해주세요"
          pin={authPin}
          onInput={(n) => setAuthPin((p) => p + n)}
          onDelete={() => setAuthPin((p) => p.slice(0, -1))}
        />
      )}

      {step === "SHOW" && (
        <MnemonicDisplay
          mnemonics={mnemonics}
          onNext={() => setStep("VERIFY")}
        />
      )}

      {step === "VERIFY" && (
        <MnemonicVerify
          userInputs={userInputs}
          emptyIndices={emptyIndices}
          onChange={(i, v) => {
            const next = [...userInputs];
            next[i] = v;
            setUserInputs(next);
          }}
          onVerify={handleVerify}
        />
      )}

      {(step === "PIN_SET" || step === "PIN_CONFIRM") && (
        <PinPad
          title={
            step === "PIN_SET"
              ? "PIN 번호를 등록해주세요"
              : "PIN 번호를 확인해주세요"
          }
          pin={step === "PIN_SET" ? pin : confirmPin}
          onInput={(n) =>
            step === "PIN_SET"
              ? setPin((p) => p + n)
              : setConfirmPin((p) => p + n)
          }
          onDelete={() =>
            step === "PIN_SET"
              ? setPin((p) => p.slice(0, -1))
              : setConfirmPin((p) => p.slice(0, -1))
          }
        />
      )}

      {step === "SUCCESS" && (
        <WalletSuccessSection
          description={
            <>
              비밀 복구 구문을 안전하게 보관할 책임은 <br /> 본인에게 있습니다.
            </>
          }
          onConfirm={() => navigate("/home")}
        >
          <div className="bg-gray-50 p-6 rounded-2xl mb-2">
            <p className="body-bold text-black mb-3">안전한 보관 관련 팁</p>
            <ul className="text-[12.5px] text-color-grey-deep space-y-1.5 list-disc pl-4">
              <li>백업을 여러 장소에 보관하세요.</li>
              <li>구문을 누구와도 공유하지 마세요.</li>
              <li>피싱에 유의하세요.</li>
              <li>저희 서비스에선 비밀 복구 구문을 복구할 수 없습니다.</li>
            </ul>
          </div>
        </WalletSuccessSection>
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
    </FullScreenPage>
  );
};

export default CreateWallet;
