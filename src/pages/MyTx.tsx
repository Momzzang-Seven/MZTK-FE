import { useTokenTransfer } from "@hooks/useTokenTransfer";
import { CommonModal } from "@components/common";
import {
  MyTxMainSection,
  MyTxPinSection,
  MyTxStatusSection,
} from "@components/token";
import { TOKEN_MESSAGES } from "@constant/token";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const MyToken = () => {
  const navigate = useNavigate();
  const { state, actions } = useTokenTransfer();
  const {
    step,
    address,
    amount,
    balance,
    inputPin,
    txHash,
    errorModal,
    isAmountValid,
    isAddressValid,
  } = state;

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] font-pretendard relative">
      {/* Sticky Back Button Wrapper */}
      <div className="sticky top-12 z-[100] px-6 h-0 pointer-events-none">
        <button
          onClick={() => navigate("/my")}
          className="w-12 h-12 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white/50 active:scale-95 transition-all pointer-events-auto"
        >
          <ChevronLeft size={26} className="text-gray-900" />
        </button>
      </div>

      {/* Immersive Floating Header Background */}
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-main/5 via-transparent to-transparent pointer-events-none" />

      {/* Floating Title Container */}
      <div className="relative pt-32 pb-8 px-6 z-10">
        <p className="text-main text-[11px] font-black tracking-[0.2em] uppercase mb-1 drop-shadow-sm">
          Asset Transfer
        </p>
        <h1 className="text-gray-900 text-3xl font-black tracking-tight leading-tight">
          토큰 송금하기
        </h1>
      </div>

      <div className="flex-1 flex flex-col z-10">
        {step === "MAIN" && (
          <MyTxMainSection
            balance={balance}
            amount={amount}
            address={address}
            isAmountValid={isAmountValid}
            isAddressValid={isAddressValid}
            onChangeAmount={actions.setAmount}
            onChangeAddress={actions.setAddress}
            onNext={() => actions.setStep("PIN_CHECK")}
          />
        )}

        {step === "PIN_CHECK" && (
          <MyTxPinSection
            inputPin={inputPin}
            onInput={(n) => actions.setInputPin((p) => p + n)}
            onDelete={() => actions.setInputPin((p) => p.slice(0, -1))}
            onComplete={actions.handleTransfer}
          />
        )}

        {(step === "SENDING" || step === "SUCCESS") && (
          <MyTxStatusSection
            step={step}
            txHash={txHash}
            onReset={actions.resetForm}
          />
        )}
      </div>

      {errorModal && (
        <CommonModal
          title={TOKEN_MESSAGES.MODAL.TITLE_FAILED}
          desc={errorModal}
          confirmLabel={TOKEN_MESSAGES.MODAL.CONFIRM_RETRY}
          onConfirmClick={() => actions.setErrorModal(null)}
        />
      )}
    </div>
  );
};

export default MyToken;
