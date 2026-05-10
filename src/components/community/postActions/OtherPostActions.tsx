import { CheckCircle2, X, ShieldAlert } from "lucide-react";

interface OtherPostActionsProps {
  type: string;
  isSelectable: boolean;
  handleSelectClick: () => void;
  handleReportClick: () => void;
  handleCancelClick: () => void;
}

const OtherPostActions = ({
  // type,
  isSelectable,
  handleSelectClick,
  handleReportClick,
  handleCancelClick,
}: OtherPostActionsProps) => {
  return (
    <div className="w-full flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 py-2">
      <div className="flex flex-col gap-1 px-1 mb-2">
        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Post Options
        </h3>
        <p className="text-[11px] font-bold text-gray-300 tracking-tight">
          게시글에 대한 추가 옵션입니다.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {isSelectable && (
          <button
            onClick={handleSelectClick}
            className="w-full flex items-center gap-4 p-4.5 bg-main/5 text-main rounded-[24px] hover:bg-main/10 transition-all active:scale-[0.98] group border border-main/10"
          >
            <div className="p-2.5 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-shadow text-main">
              <CheckCircle2 size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[15px] font-black">이 답변 채택하기</span>
              <span className="text-[11px] font-bold opacity-60">
                최고의 답변으로 선정하고 보상을 지급합니다.
              </span>
            </div>
          </button>
        )}

        <button
          onClick={handleReportClick}
          className="w-full flex items-center gap-4 p-4.5 bg-amber-50/50 text-amber-600 rounded-[24px] hover:bg-amber-50 transition-all active:scale-[0.98] group border border-amber-100/30"
        >
          <div className="p-2.5 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-shadow text-amber-400 group-hover:text-amber-500">
            <ShieldAlert size={22} strokeWidth={2.5} />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[15px] font-black text-gray-900">
              게시글 신고하기
            </span>
            <span className="text-[11px] font-bold text-gray-400">
              부적절한 콘텐츠를 신고 센터로 알립니다.
            </span>
          </div>
        </button>
      </div>

      <button
        onClick={handleCancelClick}
        className="w-full flex items-center justify-center gap-2 p-4 mt-2 text-gray-400 font-bold hover:text-gray-600 transition-colors"
      >
        <X size={18} strokeWidth={3} />
        <span className="text-[14px]">닫기</span>
      </button>
    </div>
  );
};

export default OtherPostActions;
