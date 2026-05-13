import { Trash2 } from "lucide-react";

interface ConfirmDeleteProps {
  handleConfirmClick: () => void;
  handleCancelClick: () => void;
}

const ConfirmDelete = ({
  handleConfirmClick,
  handleCancelClick,
}: ConfirmDeleteProps) => {
  return (
    <div className="w-full flex flex-col items-center gap-7 animate-in fade-in zoom-in-95 duration-500 py-2">
      <div className="w-20 h-20 bg-red-50 rounded-[32px] flex items-center justify-center shadow-sm">
        <Trash2 size={32} className="text-red-500" strokeWidth={2.5} />
      </div>

      <div className="flex flex-col items-center gap-2 text-center px-4">
        <h3 className="text-[20px] font-black text-gray-900 tracking-tight">
          정말 삭제하시겠습니까?
        </h3>
        <p className="text-[14px] font-bold text-gray-400 leading-relaxed">
          삭제된 내용은 복구가 불가능합니다.
          <br />
          신중하게 결정해주세요.
        </p>
      </div>

      <div className="w-full flex flex-col gap-3 mt-2">
        <button
          onClick={handleConfirmClick}
          className="w-full py-4.5 bg-red-500 text-white rounded-[24px] text-[15px] font-black shadow-xl shadow-red-500/20 active:scale-[0.98] transition-all"
        >
          확인, 삭제하겠습니다
        </button>
        <button
          onClick={handleCancelClick}
          className="w-full py-2 text-gray-400 text-[14px] font-bold hover:text-gray-600 transition-colors"
        >
          아니요, 유지할게요
        </button>
      </div>
    </div>
  );
};

export default ConfirmDelete;
