import { ADMIN_TEXT } from "@constant/admin";
import { CommonButton } from "@components/common/CommonButton";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  type: "POST" | "COMMENT" | null;
  deleteReason: string;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal = ({
  isOpen,
  type,
  deleteReason,
  onReasonChange,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) => {
  if (!isOpen) return null;

  const modalTitle = ADMIN_TEXT.POST.MODAL.TITLE.replace(
    "%TYPE%",
    type === "POST" ? "게시글" : "댓글"
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl transform transition-all">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{modalTitle}</h3>
        </div>

        <div className="mb-6">
          <select
            value={deleteReason}
            onChange={(e) => onReasonChange(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-main focus:ring-1 focus:ring-main"
          >
            <option value="" disabled>
              {ADMIN_TEXT.POST.MODAL.SELECT_REASON}
            </option>
            {ADMIN_TEXT.POST.REASONS.map((reason, idx) => (
              <option key={idx} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <CommonButton
            label={ADMIN_TEXT.POST.MODAL.BTN_CANCEL}
            onClick={onClose}
            className="flex-1 py-4 text-gray-700 font-bold rounded-xl"
            bgColor="bg-gray-100 hover:bg-gray-200"
            textColor="text-gray-700"
            shadow={false}
          />
          <CommonButton
            label={ADMIN_TEXT.POST.MODAL.BTN_DELETE}
            onClick={onConfirm}
            disabled={!deleteReason}
            className="flex-1 py-4 font-bold rounded-xl"
            bgColor={
              deleteReason ? "bg-[#FF4500] hover:bg-[#FF6347]" : "bg-gray-300"
            }
            textColor="text-white"
            shadow={false}
          />
        </div>
      </div>
    </div>
  );
};
