import { CheckCircle2, Coins } from "lucide-react";

interface ConfirmSelectProps {
  handleSelectClick: () => void;
  handleCancelClick: () => void;
}

const ConfirmSelect = ({
  handleSelectClick,
  handleCancelClick,
}: ConfirmSelectProps) => {
  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-2">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-20 h-20 bg-main/5 rounded-full flex items-center justify-center relative shadow-inner">
          <div className="absolute inset-0 bg-main/5 rounded-full animate-ping duration-1000" />
          <CheckCircle2
            size={40}
            className="text-main relative z-10"
            strokeWidth={2.5}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-[22px] font-black text-gray-900 tracking-tight">
            이 답변을 채택할까요?
          </h2>
          <p className="text-[14px] text-gray-400 font-bold leading-relaxed px-6">
            채택 시 설정하신 보상 토큰이
            <br />
            답변자에게 즉시 지급됩니다.
          </p>
        </div>
      </div>

      <div className="bg-main/5 p-4 rounded-[24px] border border-main/10 flex items-center gap-3">
        <div className="p-2 bg-white rounded-xl shadow-sm">
          <Coins size={20} className="text-main" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-black text-main">
            보상 토큰 지급
          </span>
          <span className="text-[11px] font-bold text-main/60">
            블록체인 네트워크를 통해 안전하게 전송됩니다.
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleSelectClick}
          className="w-full flex items-center justify-center p-5 bg-main text-white rounded-[24px] hover:bg-main/90 transition-all active:scale-[0.98] shadow-xl shadow-main/20"
        >
          <span className="text-[16px] font-black">확인했습니다. 채택하기</span>
        </button>

        <button
          onClick={handleCancelClick}
          className="w-full p-4 text-[14px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
        >
          취소하기
        </button>
      </div>
    </div>
  );
};

export default ConfirmSelect;
