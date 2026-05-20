import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ethers, HDNodeWallet } from "ethers";
import { MnemonicDisplay } from "../components/auth/MnemonicDisplay";
import { MnemonicVerify } from "../components/auth/MnemonicVerify";
import { PinPad } from "../components/auth/PinPad";
import { CommonModal } from "../components/common";
import { FullScreenPage } from "@components/layout";
import { WalletSuccessSection } from "@components/wallet/WalletSuccessSection";
import { useUserStore } from "@store";
import { isWeakPin } from "@utils";

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
  const finalizingRef = useRef(false);

  const emptyIndices = useMemo(() => [1, 4, 7, 10], []);

  useEffect(() => {
    // HDNodeWallet.createRandom은 니모닉을 포함한 HD 지갑을 생성합니다.
    const newWallet = ethers.HDNodeWallet.createRandom();
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
    if (!wallet || finalizingRef.current) return;
    try {
      finalizingRef.current = true;
      // HDNodeWallet.encrypt는 니모닉 구문을 포함하여 암호화합니다.
      const encrypted = await wallet.encrypt(pin);
      localStorage.setItem("encrypted_wallet", encrypted);
      localStorage.setItem("wallet_address", wallet.address);
      setWalletAddress(wallet.address);
      setStep("SUCCESS");
    } catch {
      alert("보안 저장 중 오류가 발생했습니다.");
    } finally {
      finalizingRef.current = false;
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
          // 복구 시에도 Wallet.fromEncryptedJson 사용 (니모닉이 있으면 Wallet 객체 내에 포함됨)
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

    if (pin.length === 6 && step === "PIN_SET") {
      if (isWeakPin(pin)) {
        setModal({
          title: "Weak PIN",
          desc: "Repeated or sequential PINs are not allowed.",
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
          title: "PIN 번호 확인에 실패했습니다.",
          desc: "올바른 PIN 번호를 입력해주세요.",
        });
      }
    }
  }, [authPin, pin, confirmPin, step, finalize]);

  return (
    <FullScreenPage className="overflow-hidden bg-white">
      {/* ── Background Decoration ── */}
      <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[40%] bg-main opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 h-full flex flex-col">
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
            onBulkChange={setUserInputs}
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
            desc={
              step === "PIN_SET"
                ? "지갑 사용 시 필요한 6자리 보안 번호입니다."
                : "앞서 입력한 PIN 번호와 동일하게 입력해 주세요."
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
                비밀 복구 구문을 안전하게 보관할 책임은 <br />
                <span className="text-gray-900 font-black">
                  본인에게 있습니다.
                </span>
              </>
            }
            onConfirm={() => navigate("/home")}
          >
            <div className="bg-gray-50/50 border border-gray-100 p-6 rounded-[24px] mb-2">
              <p className="text-[14px] font-black text-gray-900 mb-3 flex items-center gap-2">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FAB12F"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
                안전한 보관 관련 팁
              </p>
              <ul className="text-[12.5px] text-gray-400 font-bold space-y-2.5 list-none">
                <li className="flex gap-2">
                  <span className="text-main">•</span>
                  백업을 여러 장소에 보관하세요.
                </li>
                <li className="flex gap-2">
                  <span className="text-main">•</span>
                  구문을 누구와도 공유하지 마세요.
                </li>
                <li className="flex gap-2">
                  <span className="text-main">•</span>
                  피싱 및 스캠 사이트에 유의하세요.
                </li>
                <li className="flex gap-2">
                  <span className="text-main">•</span>
                  저희 서비스에선 비밀 구문을 복구할 수 없습니다.
                </li>
              </ul>
            </div>
          </WalletSuccessSection>
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
    </FullScreenPage>
  );
};

export default CreateWallet;
