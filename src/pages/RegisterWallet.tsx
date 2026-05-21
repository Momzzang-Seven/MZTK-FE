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
import { isWeakPin } from "@utils";
import {
  REGISTER_WALLET_CONFIG,
  REGISTER_WALLET_MESSAGES,
  REGISTER_WALLET_STEPS,
  REGISTER_WALLET_STORAGE_KEYS,
  type RegisterWalletStep,
} from "@constant";

import { walletService } from "@services";
import type {
  RegisterWalletResponse,
  WalletRegistrationNextAction,
  WalletRegistrationStatusResponse,
} from "@types";

type RegistrationStateLike = {
  status: RegisterWalletResponse["status"];
  nextAction: WalletRegistrationNextAction;
  web3: RegisterWalletResponse["web3"];
  registrationId: string | null;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const renderLines = (lines: readonly string[]) => (
  <>
    {lines.map((line, index) => (
      <span key={line}>
        {index > 0 && <br />}
        {line}
      </span>
    ))}
  </>
);

const RegisterWallet = () => {
  const messages = REGISTER_WALLET_MESSAGES;
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

  const [step, setStep] = useState<RegisterWalletStep>(() => {
    return localStorage.getItem(REGISTER_WALLET_STORAGE_KEYS.encryptedWallet)
      ? REGISTER_WALLET_STEPS.AUTH_PIN
      : REGISTER_WALLET_STEPS.MNEMONIC;
  });

  const [mnemonics, setMnemonics] = useState<string[]>(
    Array(REGISTER_WALLET_CONFIG.mnemonicWordCount).fill("")
  );
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
  const finalizingRef = useRef(false);

  const validateMnemonic = () => {
    try {
      const phrase = mnemonics.map((m) => m.trim().toLowerCase()).join(" ");
      const recoveredWallet = ethers.HDNodeWallet.fromPhrase(phrase);

      const existingWalletAddress = localStorage.getItem(
        REGISTER_WALLET_STORAGE_KEYS.walletAddress
      );
      if (
        existingWalletAddress &&
        existingWalletAddress === recoveredWallet.address
      ) {
        setModal(messages.modal.sameWallet);
        return;
      }
      setWallet(recoveredWallet);
      void startRegistration(recoveredWallet);
    } catch {
      setModal(messages.modal.invalidMnemonic);
    }
  };

  const startRegistration = async (recoveredWallet: ethers.HDNodeWallet) => {
    const myFlow = startNewFlow();
    setStep(REGISTER_WALLET_STEPS.REGISTERING);

    try {
      // 기존 등록 지갑이 있으면 backend에서 unlink 먼저
      finalizingRef.current = true;
      const existingWalletAddress = localStorage.getItem(
        REGISTER_WALLET_STORAGE_KEYS.walletAddress
      );
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
        localStorage.removeItem(REGISTER_WALLET_STORAGE_KEYS.encryptedWallet);
        localStorage.removeItem(REGISTER_WALLET_STORAGE_KEYS.walletAddress);
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
      setStep(REGISTER_WALLET_STEPS.RESTART_PROMPT);
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
          setStep(REGISTER_WALLET_STEPS.RESTART_PROMPT);
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
          setStep(REGISTER_WALLET_STEPS.RETRY_PROMPT);
          return;
        }
        if (!isFlowAlive(myFlow)) return;
        void pollUntilTerminal(state.registrationId, activeWallet, myFlow);
        return;
      }
      case "WAIT_FOR_APPROVAL_TRANSACTION": {
        if (!state.registrationId) {
          setStep(REGISTER_WALLET_STEPS.RESTART_PROMPT);
          return;
        }
        void pollUntilTerminal(state.registrationId, activeWallet, myFlow);
        return;
      }
      case "RETRY_APPROVAL": {
        setStep(REGISTER_WALLET_STEPS.RETRY_PROMPT);
        return;
      }
      case "DONE": {
        setStep(REGISTER_WALLET_STEPS.PIN_SET);
        return;
      }
      case "CONTACT_SUPPORT": {
        setStep(REGISTER_WALLET_STEPS.SUPPORT);
        return;
      }
      case "NONE":
      default: {
        setStep(REGISTER_WALLET_STEPS.RESTART_PROMPT);
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
    while (
      attempts < REGISTER_WALLET_CONFIG.maxPollAttempts &&
      isFlowAlive(myFlow)
    ) {
      await sleep(REGISTER_WALLET_CONFIG.pollIntervalMs);
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
      setStep(REGISTER_WALLET_STEPS.PROLONGED_PENDING);
    }
  };

  const handleContinuePolling = () => {
    if (!wallet || !registrationId) {
      setStep(REGISTER_WALLET_STEPS.RESTART_PROMPT);
      return;
    }
    const myFlow = startNewFlow();
    setStep(REGISTER_WALLET_STEPS.REGISTERING);
    void pollUntilTerminal(registrationId, wallet, myFlow);
  };

  const handleRetryApproval = async () => {
    if (!wallet || !registrationId) {
      setStep(REGISTER_WALLET_STEPS.RESTART_PROMPT);
      return;
    }
    const myFlow = startNewFlow();
    setStep(REGISTER_WALLET_STEPS.REGISTERING);
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
        messages.modal.retryFailed;
      setError(msg);
      setStep(REGISTER_WALLET_STEPS.RETRY_PROMPT);
    }
  };

  const handleRestart = () => {
    startNewFlow();
    setMnemonics(Array(REGISTER_WALLET_CONFIG.mnemonicWordCount).fill(""));
    setWallet(null);
    setRegistrationId(null);
    setError(null);
    setStep(REGISTER_WALLET_STEPS.MNEMONIC);
  };

  const handleFinalizePin = useCallback(async () => {
    if (!wallet) return;
    try {
      const encryptedJson = await wallet.encrypt(pin);
      localStorage.setItem(
        REGISTER_WALLET_STORAGE_KEYS.encryptedWallet,
        encryptedJson
      );
      localStorage.setItem(
        REGISTER_WALLET_STORAGE_KEYS.walletAddress,
        wallet.address
      );
      setWalletAddress(wallet.address);
      setStep(REGISTER_WALLET_STEPS.SUCCESS);
    } catch (err) {
      console.error("PIN encrypt failed:", err);
      setModal(messages.modal.pinSaveFailed);
      setPin("");
      setConfirmPin("");
      setStep(REGISTER_WALLET_STEPS.PIN_SET);
    } finally {
      finalizingRef.current = false;
    }
  }, [messages.modal.pinSaveFailed, wallet, pin, setWalletAddress]);

  useEffect(() => {
    const verifyPin = async () => {
      if (
        authPin.length === REGISTER_WALLET_CONFIG.pinLength &&
        step === REGISTER_WALLET_STEPS.AUTH_PIN
      ) {
        try {
          const encryptedJson = localStorage.getItem(
            REGISTER_WALLET_STORAGE_KEYS.encryptedWallet
          );
          if (!encryptedJson) {
            setStep(REGISTER_WALLET_STEPS.MNEMONIC);
            return;
          }
          await ethers.Wallet.fromEncryptedJson(encryptedJson, authPin);
          setStep(REGISTER_WALLET_STEPS.MNEMONIC);
        } catch {
          setModal(messages.modal.authPinFailed);
          setAuthPin("");
        }
      }
    };
    void verifyPin();

    if (
      pin.length === REGISTER_WALLET_CONFIG.pinLength &&
      step === REGISTER_WALLET_STEPS.PIN_SET
    ) {
      if (isWeakPin(pin)) {
        setModal(messages.modal.weakPin);
        setPin("");
        return;
      }
      setStep(REGISTER_WALLET_STEPS.PIN_CONFIRM);
    }
    if (
      confirmPin.length === REGISTER_WALLET_CONFIG.pinLength &&
      step === REGISTER_WALLET_STEPS.PIN_CONFIRM
    ) {
      if (pin === confirmPin) void handleFinalizePin();
      else {
        setModal(messages.modal.pinMismatch);
        setConfirmPin("");
      }
    }
  }, [authPin, pin, step, confirmPin, handleFinalizePin, messages.modal]);

  const showProgressOverlay =
    loading || step === REGISTER_WALLET_STEPS.REGISTERING;

  return (
    <FullScreenPage className="overflow-hidden bg-white">
      <div className="fixed -top-20 -right-20 w-64 h-64 bg-main opacity-[0.05] blur-[80px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-20 -left-20 w-64 h-64 bg-main opacity-[0.03] blur-[80px] rounded-full pointer-events-none" />

      {step !== REGISTER_WALLET_STEPS.SUCCESS && (
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
            {messages.progress.registering}
          </p>
        </div>
      )}

      <div className="h-full pt-16 flex flex-col">
        {step === REGISTER_WALLET_STEPS.AUTH_PIN && (
          <PinPad
            title={messages.authPin.title}
            desc={renderLines(messages.authPin.descLines)}
            pin={authPin}
            onInput={(n) => setAuthPin((p) => p + n)}
            onDelete={() => setAuthPin((p) => p.slice(0, -1))}
          />
        )}

        {step === REGISTER_WALLET_STEPS.MNEMONIC && (
          <MnemonicForm
            mnemonics={mnemonics}
            description={renderLines(messages.mnemonic.descLines)}
            onChange={(idx, val) => {
              const next = [...mnemonics];
              next[idx] = val;
              setMnemonics(next);
            }}
            onBulkChange={setMnemonics}
            onSubmit={validateMnemonic}
          />
        )}

        {step === REGISTER_WALLET_STEPS.PROLONGED_PENDING && (
          <WalletSuccessSection
            title={messages.prolongedPending.title}
            description={messages.prolongedPending.description}
            buttonLabel={messages.prolongedPending.buttonLabel}
            onConfirm={handleContinuePolling}
          />
        )}

        {step === REGISTER_WALLET_STEPS.RETRY_PROMPT && (
          <WalletSuccessSection
            title={messages.retryPrompt.title}
            description={messages.retryPrompt.description}
            buttonLabel={messages.retryPrompt.buttonLabel}
            onConfirm={() => void handleRetryApproval()}
          />
        )}

        {step === REGISTER_WALLET_STEPS.SUPPORT && (
          <WalletSuccessSection
            title={messages.support.title}
            description={messages.support.description}
            buttonLabel={messages.support.buttonLabel}
            onConfirm={() => navigate("/")}
          />
        )}

        {step === REGISTER_WALLET_STEPS.RESTART_PROMPT && (
          <WalletSuccessSection
            title={messages.restartPrompt.title}
            description={messages.restartPrompt.description}
            buttonLabel={messages.restartPrompt.buttonLabel}
            onConfirm={handleRestart}
          />
        )}

        {step === REGISTER_WALLET_STEPS.PIN_SET && (
          <PinPad
            title={messages.pinSet.title}
            desc={renderLines(messages.pinSet.descLines)}
            pin={pin}
            onInput={(n) => setPin((p) => p + n)}
            onDelete={() => setPin((p) => p.slice(0, -1))}
          />
        )}

        {step === REGISTER_WALLET_STEPS.PIN_CONFIRM && (
          <PinPad
            title={messages.pinConfirm.title}
            desc={renderLines(messages.pinConfirm.descLines)}
            pin={confirmPin}
            onInput={(n) => setConfirmPin((p) => p + n)}
            onDelete={() => setConfirmPin((p) => p.slice(0, -1))}
          />
        )}

        {step === REGISTER_WALLET_STEPS.SUCCESS && (
          <WalletSuccessSection
            title={messages.success.title}
            description={messages.success.description}
            buttonLabel={messages.success.buttonLabel}
            onConfirm={() => navigate(-1)}
          />
        )}
      </div>

      {modal && (
        <CommonModal
          title={modal.title}
          desc={modal.desc}
          confirmLabel={messages.modal.confirmRetry}
          onConfirmClick={() => {
            setModal(null);
            if (step === REGISTER_WALLET_STEPS.PIN_CONFIRM) setConfirmPin("");
            if (step === REGISTER_WALLET_STEPS.AUTH_PIN) setAuthPin("");
          }}
        />
      )}

      {error && (
        <CommonModal
          title={messages.modal.registrationFailed.title}
          desc={error}
          confirmLabel={messages.modal.registrationFailed.confirm}
          onConfirmClick={() => setError(null)}
        />
      )}
    </FullScreenPage>
  );
};

export default RegisterWallet;
