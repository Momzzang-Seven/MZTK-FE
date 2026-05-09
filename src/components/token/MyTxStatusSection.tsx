import Lottie from "lottie-react";
import runnerAnimation from "@assets/runner.json";

type StatusStep = "SENDING" | "SUCCESS";

type MyTxStatusSectionProps = {
  step: StatusStep;
  txHash: string;
  onReset: () => void;
};

export const MyTxStatusSection = ({
  step,
  txHash,
  onReset,
}: MyTxStatusSectionProps) => {
  const isSending = step === "SENDING";

  return (
    <div className="flex flex-col h-full px-6 pt-20 pb-10 items-center animate-in zoom-in">
      <h1 className="font-bold text-[28px] leading-tight mb-4 text-center">
        {isSending ? "송금이 진행 중입니다" : "송금이 완료되었습니다!"}
      </h1>
      <p className="body text-color-grey-deep text-center mb-10 whitespace-pre-line">
        {isSending
          ? "블록체인 네트워크에 기록 중입니다..."
          : `성공적으로 전송되었습니다.\nTX: ${txHash.slice(0, 10)}...`}
      </p>
      <div className="flex-1 flex justify-center items-center">
        <Lottie animationData={runnerAnimation} className="w-64" />
      </div>
      {!isSending && (
        <button
          onClick={onReset}
          className="w-full h-[60px] bg-main text-black rounded-xl font-bold text-lg active:scale-95 transition-all"
        >
          확인
        </button>
      )}
    </div>
  );
};
