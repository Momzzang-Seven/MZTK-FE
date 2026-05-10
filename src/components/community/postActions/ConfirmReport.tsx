import { AlertTriangle, ExternalLink } from "lucide-react";

interface ConfirmReportProps {
  handleReportClick: () => void;
  handleCancelClick: () => void;
}

const ConfirmReport = ({
  handleReportClick,
  handleCancelClick,
}: ConfirmReportProps) => {
  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-2">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center shadow-inner">
          <AlertTriangle
            size={32}
            className="text-amber-500"
            strokeWidth={2.5}
          />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-[20px] font-black text-gray-900 tracking-tight">
            게시글 신고하기
          </h2>
          <p className="text-[14px] text-gray-400 font-bold leading-relaxed px-4">
            안전한 커뮤니티를 위해 부적절한 게시글을 신고해주세요.
            <br />
            신고 내용은 검토 후 즉시 처리됩니다.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={handleReportClick}
          className="w-full flex items-center justify-center gap-2 p-5 bg-gray-900 text-white rounded-[24px] hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-gray-200 group"
        >
          <span className="text-[15px] font-black">신고 폼 작성하러 가기</span>
          <ExternalLink
            size={16}
            strokeWidth={3}
            className="opacity-50 group-hover:opacity-100 transition-opacity"
          />
        </button>

        <button
          onClick={handleCancelClick}
          className="w-full p-4 text-[14px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
        >
          취소하기
        </button>
      </div>

      <div className="p-4 bg-gray-50 rounded-[20px] border border-gray-100/50">
        <ul className="text-[11px] text-gray-400 font-medium space-y-1.5 list-disc list-inside">
          <li>허위 신고 시 서비스 이용이 제한될 수 있습니다.</li>
          <li>신고 결과는 개별적으로 안내되지 않을 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default ConfirmReport;
