import axios from "axios";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { MnemonicForm } from "@components/auth/MnemonicForm";
import { PinPad } from "@components/auth/PinPad";
import { CommonModal, LoadingSpinner } from "@components/common";
import { FullScreenPage } from "@components/layout";
import { WalletSuccessSection } from "@components/wallet/WalletSuccessSection";
import { useUserStore } from "@store";
import { useWalletService } from "@hooks";
import { walletService } from "@services";
import type {
  RegisterWalletResponse,
  WalletRegistrationNextAction,
  WalletRegistrationStatusResponse,
} from "@types";

type Step =
  | "AUTH_PIN"
  | "MNEMONIC"
  | "REGISTERING"
  | "PROLONGED_PENDING"
  | "RETRY_PROMPT"
  | "SUPPORT"
  | "RESTART_PROMPT"
  | "PIN_SET"
  | "PIN_CONFIRM"
  | "SUCCESS";

type RegistrationStateLike = {
  status: RegisterWalletResponse["status"];
  nextAction: WalletRegistrationNextAction;
  web3: RegisterWalletResponse["web3"];
  registrationId: string | null;
};

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_ATTEMPTS = 60;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const RegisterWallet = () => {
  const navigate = useNavigate();
  const setWalletAddress = useUserStore((state) => state.setWalletAddress);
  const { selectedNetwork } = useUserStore();
  const {
    loading,
    error,
    setError,
    handleWalletRegistration,
    handleUnlinkWallet,
    handleWeb3Signature,
  } = useWalletService();

  const [step, setStep] = useState<Step>(() => {
    return localStorage.getItem("encrypted_wallet") ? "AUTH_PIN" : "MNEMONIC";
  });

  const [mnemonics, setMnemonics] = useState<string[]>(Array(12).fill(""));
  const [authPin, setAuthPin] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [wallet, setWallet] = useState<ethers.HDNodeWallet | null>(null);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ title: string; desc: string } | null>(
    null
  );

  // 진행 중인 등록 플로우(서명/polling) 취소용. 새 플로우가 시작되면 이전 id는 만료.
  const flowIdRef = useRef(0);
  const isFlowAlive = (id: number) => flowIdRef.current === id;
  const startNewFlow = () => {
    flowIdRef.current += 1;
    return flowIdRef.current;
  };

  useEffect(() => {
    return () => {
      flowIdRef.current = -1;
    };
  }, []);

  const validateMnemonic = () => {
    try {
      const phrase = mnemonics.map((m) => m.trim().toLowerCase()).join(" ");
      const recoveredWallet = ethers.HDNodeWallet.fromPhrase(phrase);

      const existingWalletAddress = localStorage.getItem("wallet_address");
      if (
        existingWalletAddress &&
        existingWalletAddress === recoveredWallet.address
      ) {
        setModal({
          title: "기존 지갑과 동일한 지갑입니다.",
          desc: "기존 지갑과 다른 지갑을 연결해 주세요.",
        });
        return;
      }
      setWallet(recoveredWallet);
      void startRegistration(recoveredWallet);
    } catch {
      setModal({
        title: "비밀복구 구문 확인 실패",
        desc: "입력하신 구문이 올바르지 않습니다. 다시 확인해 주세요.",
      });
    }
  };

  const startRegistration = async (recoveredWallet: ethers.HDNodeWallet) => {
    const myFlow = startNewFlow();
    setStep("REGISTERING");

    try {
      // 기존 등록 지갑이 있으면 backend에서 unlink 먼저
      const existingWalletAddress = localStorage.getItem("wallet_address");
      if (existingWalletAddress) {
        try {
          await handleUnlinkWallet(existingWalletAddress);
        } catch (unlinkErr: unknown) {
          if (
            axios.isAxiosError(unlinkErr) &&
            unlinkErr.response?.status === 404
          ) {
            // 이미 BE에 없는 경우 무시
          } else {
            throw unlinkErr;
          }
        }
        localStorage.removeItem("encrypted_wallet");
        localStorage.removeItem("wallet_address");
      }

      const response = await handleWalletRegistration(
        recoveredWallet,
        selectedNetwork
      );
      if (!isFlowAlive(myFlow)) return;
      setRegistrationId(response.registrationId);

      await handleRegistrationState(
        {
          status: response.status,
          nextAction: response.nextAction,
          web3: response.web3,
          registrationId: response.registrationId,
        },
        recoveredWallet,
        myFlow
      );
    } catch {
      if (!isFlowAlive(myFlow)) return;
      // hook이 setError로 메시지 표시. 사용자에게 재시작 옵션 노출.
      setStep("RESTART_PROMPT");
    }
  };

  const handleRegistrationState = async (
    state: RegistrationStateLike,
    activeWallet: ethers.HDNodeWallet,
    myFlow: number
  ) => {
    if (!isFlowAlive(myFlow)) return;

    switch (state.nextAction) {
      case "SIGN_APPROVAL": {
        if (!state.web3 || !state.registrationId) {
          setStep("RESTART_PROMPT");
          return;
        }
        try {
          await handleWeb3Signature(
            state.web3.executionIntent.id,
            activeWallet,
            state.web3
          );
        } catch {
          if (!isFlowAlive(myFlow)) return;
          setStep("RETRY_PROMPT");
          return;
        }
        if (!isFlowAlive(myFlow)) return;
        void pollUntilTerminal(state.registrationId, activeWallet, myFlow);
        return;
      }
      case "WAIT_FOR_APPROVAL_TRANSACTION": {
        if (!state.registrationId) {
          setStep("RESTART_PROMPT");
          return;
        }
        void pollUntilTerminal(state.registrationId, activeWallet, myFlow);
        return;
      }
      case "RETRY_APPROVAL": {
        setStep("RETRY_PROMPT");
        return;
      }
      case "DONE": {
        setStep("PIN_SET");
        return;
      }
      case "CONTACT_SUPPORT": {
        setStep("SUPPORT");
        return;
      }
      case "NONE":
      default: {
        setStep("RESTART_PROMPT");
        return;
      }
    }
  };

  const pollUntilTerminal = async (
    regId: string,
    activeWallet: ethers.HDNodeWallet,
    myFlow: number
  ) => {
    let attempts = 0;
    while (attempts < MAX_POLL_ATTEMPTS && isFlowAlive(myFlow)) {
      await sleep(POLL_INTERVAL_MS);
      if (!isFlowAlive(myFlow)) return;

      let status: WalletRegistrationStatusResponse;
      try {
        status = await walletService.getWalletRegistrationStatus(regId);
      } catch (err) {
        console.warn("registration status poll failed:", err);
        attempts++;
        continue;
      }
      if (!isFlowAlive(myFlow)) return;

      const isPending =
        status.status === "APPROVAL_REQUIRED" ||
        status.status === "APPROVAL_SIGNED" ||
        status.status === "APPROVAL_PENDING_ONCHAIN";

      if (!isPending || status.nextAction !== "WAIT_FOR_APPROVAL_TRANSACTION") {
        await handleRegistrationState(
          {
            status: status.status,
            nextAction: status.nextAction,
            web3: status.web3,
            registrationId: status.registrationId,
          },
          activeWallet,
          myFlow
        );
        return;
      }

      attempts++;
    }
    if (isFlowAlive(myFlow)) {
      setStep("PROLONGED_PENDING");
    }
  };

  const handleContinuePolling = () => {
    if (!wallet || !registrationId) {
      setStep("RESTART_PROMPT");
      return;
    }
    const myFlow = startNewFlow();
    setStep("REGISTERING");
    void pollUntilTerminal(registrationId, wallet, myFlow);
  };

  const handleRetryApproval = async () => {
    if (!wallet || !registrationId) {
      setStep("RESTART_PROMPT");
      return;
    }
    const myFlow = startNewFlow();
    setStep("REGISTERING");
    try {
      const response =
        await walletService.retryWalletApprovalIntent(registrationId);
      if (!isFlowAlive(myFlow)) return;
      await handleRegistrationState(
        {
          status: response.status,
          nextAction: response.nextAction,
          web3: response.web3,
          registrationId: response.registrationId,
        },
        wallet,
        myFlow
      );
    } catch (err) {
      if (!isFlowAlive(myFlow)) return;
      const msg =
        (axios.isAxiosError(err) && err.response?.data?.message) ||
        "재시도에 실패했습니다.";
      setError(msg);
      setStep("RETRY_PROMPT");
    }
  };

  const handleRestart = () => {
    startNewFlow();
    setMnemonics(Array(12).fill(""));
    setWallet(null);
    setRegistrationId(null);
    setError(null);
    setStep("MNEMONIC");
  };

  const handleFinalizePin = useCallback(async () => {
    if (!wallet) return;
    try {
      const encryptedJson = await wallet.encrypt(pin);
      localStorage.setItem("encrypted_wallet", encryptedJson);
      localStorage.setItem("wallet_address", wallet.address);
      setWalletAddress(wallet.address);
      setStep("SUCCESS");
    } catch (err) {
      console.error("PIN encrypt failed:", err);
      setModal({
        title: "PIN 저장 실패",
        desc: "PIN 저장에 실패했습니다. 다시 입력해 주세요.",
      });
      setPin("");
      setConfirmPin("");
      setStep("PIN_SET");
    }
  }, [wallet, pin, setWalletAddress]);

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
            desc: "잘못된 PIN 번호입니다. 다시 입력해 주세요.",
          });
          setAuthPin("");
        }
      }
    };
    void verifyPin();

    if (pin.length === 6 && step === "PIN_SET") setStep("PIN_CONFIRM");
    if (confirmPin.length === 6 && step === "PIN_CONFIRM") {
      if (pin === confirmPin) void handleFinalizePin();
      else {
        setModal({
          title: "PIN 번호 불일치",
          desc: "처음 입력한 PIN 번호와 다릅니다. 다시 입력해 주세요.",
        });
        setConfirmPin("");
      }
    }
  }, [authPin, pin, step, confirmPin, handleFinalizePin]);

  const showProgressOverlay = loading || step === "REGISTERING";

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

      {showProgressOverlay && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <LoadingSpinner size="lg" color="text-main" />
          <p className="mt-4 text-[14px] font-black text-gray-900 animate-pulse">
            지갑 등록을 처리하고 있습니다...
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

        {step === "PROLONGED_PENDING" && (
          <WalletSuccessSection
            title={"확인이 늦어지고 있어요"}
            description={
              "트랜잭션 확정에 시간이 걸리고 있습니다. 잠시 더 기다리거나 다시 확인을 시도할 수 있어요."
            }
            buttonLabel={"계속 확인하기"}
            onConfirm={handleContinuePolling}
          />
        )}

        {step === "RETRY_PROMPT" && (
          <WalletSuccessSection
            title={"승인 서명이 만료되었어요"}
            description={
              "지갑 승인 요청을 새로 받아 다시 시도해야 합니다. 아래 버튼을 눌러 진행해 주세요."
            }
            buttonLabel={"다시 시도하기"}
            onConfirm={() => void handleRetryApproval()}
          />
        )}

        {step === "SUPPORT" && (
          <WalletSuccessSection
            title={"등록 처리 중 문제가 발생했어요"}
            description={
              "관리자에게 문의 후 복구가 필요합니다. 잠시 후 다시 확인해 주세요."
            }
            buttonLabel={"확인"}
            onConfirm={() => navigate("/")}
          />
        )}

        {step === "RESTART_PROMPT" && (
          <WalletSuccessSection
            title={"지갑 등록이 완료되지 못했어요"}
            description={"비밀복구 구문 입력부터 다시 진행해 주세요."}
            buttonLabel={"처음부터 다시 시도하기"}
            onConfirm={handleRestart}
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
          <WalletSuccessSection
            title={"지갑이 등록되었어요"}
            description={"이제 서비스의 모든 기능을 이용하실 수 있어요."}
            buttonLabel={"확인"}
            onConfirm={() => navigate(-1)}
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
