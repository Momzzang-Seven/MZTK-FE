import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { MnemonicForm } from "@components/auth/MnemonicForm";
import { PinPad } from "@components/auth/PinPad";
import { CommonModal, LoadingSpinner } from "@components/common";
import { FullScreenPage } from "@components/layout";
import { WalletSuccessSection } from "@components/wallet/WalletSuccessSection";
import { useUserStore } from "@store";
import { isWeakPin } from "@utils";

const RestoreWallet = () => {
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const setWalletAddress = useUserStore((state) => state.setWalletAddress);

  const expectedWalletAddress =
    user?.walletAddress || localStorage.getItem("wallet_address") || "";

  const [step, setStep] = useState<
    "MNEMONIC" | "PIN_SET" | "PIN_CONFIRM" | "SUCCESS"
  >("MNEMONIC");

  const [mnemonics, setMnemonics] = useState<string[]>(Array(12).fill(""));
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [wallet, setWallet] = useState<ethers.HDNodeWallet | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ title: string; desc: string } | null>(
    null
  );
  const finalizingRef = useRef(false);

  useEffect(() => {
    if (!expectedWalletAddress) {
      navigate("/register-wallet", { replace: true });
    }
  }, [expectedWalletAddress, navigate]);

  const validateMnemonic = () => {
    try {
      const phrase = mnemonics.map((m) => m.trim().toLowerCase()).join(" ");
      const recoveredWallet = ethers.HDNodeWallet.fromPhrase(phrase);

      if (
        recoveredWallet.address.toLowerCase() !==
        expectedWalletAddress.toLowerCase()
      ) {
        setModal({
          title: "지갑 정보가 일치하지 않습니다",
          desc: "입력하신 비밀복구 구문이 등록된 지갑 주소와 일치하지 않습니다. 다시 확인해 주세요.",
        });
        return;
      }

      setWallet(recoveredWallet);
      setStep("PIN_SET");
    } catch {
      setModal({
        title: "비밀복구 구문 확인 실패",
        desc: "입력하신 구문이 올바르지 않습니다. 다시 확인해 주세요.",
      });
    }
  };

  const finalize = useCallback(async () => {
    if (!wallet || loading || finalizingRef.current) return;

    try {
      finalizingRef.current = true;
      setLoading(true);
      const encryptedJson = await wallet.encrypt(pin);
      localStorage.setItem("encrypted_wallet", encryptedJson);
      localStorage.setItem("wallet_address", wallet.address);
      setWalletAddress(wallet.address);
      setStep("SUCCESS");
    } catch (err) {
      console.error("Restore finalize error:", err);
      setModal({
        title: "지갑 복원 실패",
        desc: "지갑을 안전하게 저장하는 중 오류가 발생했습니다. 다시 시도해 주세요.",
      });
      setPin("");
      setConfirmPin("");
      setStep("PIN_SET");
    } finally {
      finalizingRef.current = false;
      setLoading(false);
    }
  }, [wallet, pin, loading, setWalletAddress]);

  useEffect(() => {
    if (pin.length === 6 && step === "PIN_SET") {
      if (isWeakPin(pin)) {
        setModal({
          title: "Weak PIN",
          desc: "Sequential PINs are not allowed.",
        });
        setPin("");
        return;
      }
      setStep("PIN_CONFIRM");
    }
    if (confirmPin.length === 6 && step === "PIN_CONFIRM") {
      if (pin === confirmPin) void finalize();
      else {
        setModal({
          title: "PIN 번호 불일치",
          desc: "처음 입력한 PIN 번호와 다릅니다. 다시 입력해 주세요.",
        });
        setConfirmPin("");
      }
    }
  }, [pin, confirmPin, step, finalize]);

  return (
    <FullScreenPage className="overflow-hidden bg-white">
      <div className="fixed -top-20 -right-20 w-64 h-64 bg-main opacity-[0.05] blur-[80px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-20 -left-20 w-64 h-64 bg-main opacity-[0.03] blur-[80px] rounded-full pointer-events-none" />

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
            지갑을 안전하게 복원하고 있습니다...
          </p>
        </div>
      )}

      <div className="h-full pt-16 flex flex-col">
        {step === "MNEMONIC" && (
          <MnemonicForm
            mnemonics={mnemonics}
            description={
              <>
                기존 지갑을 이 기기에서 다시 사용하려면 <br /> 비밀복구구문 12개
                단어를 입력해주세요
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
                이 기기에서 지갑 이용 승인 시 사용하실 <br /> 6자리 숫자를
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
          <WalletSuccessSection
            title={
              <>
                지갑이 안전하게 <br /> 복원되었습니다
              </>
            }
            description={
              <>
                이제 이 기기에서 다시 토큰 보상을 <br /> 받고 거래에 참여하실 수
                있습니다.
              </>
            }
            onConfirm={() => navigate("/")}
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
            if (step === "PIN_CONFIRM") setConfirmPin("");
          }}
        />
      )}
    </FullScreenPage>
  );
};

export default RestoreWallet;
