import { AlertTriangle, Edit3, Trash2, ShieldCheck, X } from "lucide-react";

interface MyPostActionsProps {
  handleEditClick: () => void;
  handleDeleteClick: () => void;
  handleCancelClick: () => void;
  handleSignClick?: () => void;
  isEditable: boolean;
  isWeb3Executable: boolean;
  isWeb3Blocked?: boolean;
}

const MyPostActions = ({
  handleEditClick,
  handleDeleteClick,
  handleCancelClick,
  handleSignClick,
  isEditable,
  isWeb3Executable,
  isWeb3Blocked = false,
}: MyPostActionsProps) => {
  return (
    <div className="w-full flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500 py-2">
      <div className="flex flex-col gap-1 px-1 mb-2">
        <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Post Management
        </h3>
        <p className="text-[11px] font-bold text-gray-300 tracking-tight">
          작성하신 게시글에 대한 관리 옵션입니다.
        </p>
      </div>

      <div className="flex flex-col gap-2.5">
        {isWeb3Blocked && (
          <div className="w-full flex items-center gap-4 p-4.5 bg-amber-50/70 text-amber-700 rounded-[24px] border border-amber-100">
            <div className="p-2.5 bg-white rounded-2xl shadow-sm">
              <AlertTriangle size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[15px] font-black">확인 지연 중</span>
              <span className="text-[11px] font-bold opacity-70 text-left">
                블록체인 결과 확인이 지연되어 추가 작업을 잠시 막았습니다.
              </span>
            </div>
          </div>
        )}

        {isWeb3Executable && (
          <button
            onClick={handleSignClick}
            className="w-full flex items-center gap-4 p-4.5 bg-main/5 text-main rounded-[24px] hover:bg-main/10 transition-all active:scale-[0.98] group border border-main/10"
          >
            <div className="p-2.5 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-shadow">
              <ShieldCheck size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[15px] font-black">블록체인 서명하기</span>
              <span className="text-[11px] font-bold opacity-60">
                미완료된 트랜잭션을 마무리합니다.
              </span>
            </div>
          </button>
        )}

        {isEditable && !isWeb3Executable && !isWeb3Blocked && (
          <>
            <button
              onClick={handleEditClick}
              className="w-full flex items-center gap-4 p-4.5 bg-gray-50/50 text-gray-900 rounded-[24px] hover:bg-gray-100/80 transition-all active:scale-[0.98] group border border-gray-100/50"
            >
              <div className="p-2.5 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-shadow text-gray-400 group-hover:text-main">
                <Edit3 size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[15px] font-black">수정하기</span>
                <span className="text-[11px] font-bold text-gray-400">
                  게시글 내용을 변경합니다.
                </span>
              </div>
            </button>

            <button
              onClick={handleDeleteClick}
              className="w-full flex items-center gap-4 p-4.5 bg-red-50/50 text-red-500 rounded-[24px] hover:bg-red-50 transition-all active:scale-[0.98] group border border-red-100/30"
            >
              <div className="p-2.5 bg-white rounded-2xl shadow-sm group-hover:shadow-md transition-shadow text-red-400 group-hover:text-red-500">
                <Trash2 size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[15px] font-black">삭제하기</span>
                <span className="text-[11px] font-bold text-red-300">
                  삭제 후에는 복구가 불가능합니다.
                </span>
              </div>
            </button>
          </>
        )}
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

export default MyPostActions;
