import type { ReactNode } from "react";
import Lottie from "lottie-react";
import runnerAnimation from "@assets/runner.json";

type WalletSuccessSectionProps = {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  onConfirm: () => void;
  buttonLabel?: string;
};

export const WalletSuccessSection = ({
  title,
  description,
  children,
  onConfirm,
  buttonLabel = "모두 이해했어요",
}: WalletSuccessSectionProps) => {
  return (
    <div className="flex flex-col h-full animate-in zoom-in-95 duration-700 pt-16 px-6 bg-white">
      <div className="w-12 h-1.5 bg-main rounded-full mb-6" />
      <h1 className="text-gray-900 text-[28px] font-black leading-tight mb-4 tracking-tight">
        {title ?? (
          <>
            모든 설정이 <br /> 완료되었습니다!
          </>
        )}
      </h1>

      {description ? (
        <p className="text-gray-400 text-[15px] font-bold leading-relaxed tracking-tight mb-6">
          {description}
        </p>
      ) : (
        <p className="text-gray-400 text-[15px] font-bold leading-relaxed tracking-tight mb-6">
          이제 안전하게 토큰 보상을 받고 <br /> 마켓플레이스를 이용하실 수
          있습니다.
        </p>
      )}

      <div className="flex-1 flex flex-col justify-center items-center py-8">
        <div className="relative">
          <div className="absolute inset-0 bg-main opacity-10 blur-[50px] rounded-full scale-125" />
          <Lottie
            animationData={runnerAnimation}
            className="w-72 relative z-10"
          />
        </div>
      </div>

      {children}

      <div className="pb-8">
        <button
          onClick={onConfirm}
          className="btn-press w-full h-[60px] bg-main text-black rounded-[22px] font-black text-[16px] shadow-lg shadow-main/20 border-none"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
};
