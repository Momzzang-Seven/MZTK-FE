import { useAdminStore } from "@store/adminStore";
import { useUserStore } from "@store/userStore";
import { ADMIN_TEXT } from "@constant/admin";
import { useCallback, useEffect, useState } from "react";
import type {
  QnARefundReviewResponse,
  QnASettlementReviewResponse,
} from "@types";

interface EscrowModalProps {
  isOpen: boolean;
  postId: number;
  answerId?: number | null; // Added for settlement
  onClose: () => void;
}

export const EscrowModal = ({
  isOpen,
  postId,
  answerId,
  onClose,
}: EscrowModalProps) => {
  const { getRefundReview, executeRefund, executeSettle, getSettlementReview } =
    useAdminStore();
  const { showSnackbar } = useUserStore();
  const [refundReview, setRefundReview] =
    useState<QnARefundReviewResponse | null>(null);
  const [settleReview, setSettleReview] =
    useState<QnASettlementReviewResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    try {
      if (answerId) {
        const sr = await getSettlementReview(postId, answerId);
        setSettleReview(sr);
      } else {
        const rf = await getRefundReview(postId);
        setRefundReview(rf);
      }
    } catch (error) {
      console.error("Failed to load escrow review:", error);
    } finally {
      setLoading(false);
    }
  }, [answerId, postId, getSettlementReview, getRefundReview]);

  useEffect(() => {
    if (isOpen && postId) {
      loadReviews();
    }
  }, [isOpen, postId, loadReviews]);

  const handleRefund = async () => {
    if (!confirm(ADMIN_TEXT.ESCROW.CONFIRM_REFUND)) return;
    setLoading(true);
    try {
      const res = await executeRefund(postId);
      showSnackbar(res.message || ADMIN_TEXT.ESCROW.MSG_REFUND_SUCCESS);
      onClose();
    } catch {
      showSnackbar(ADMIN_TEXT.ESCROW.MSG_REFUND_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleSettle = async () => {
    if (!answerId) return;
    if (!confirm(ADMIN_TEXT.ESCROW.CONFIRM_SETTLE)) return;
    setLoading(true);
    try {
      const res = await executeSettle(postId, answerId);
      showSnackbar(res.message || ADMIN_TEXT.ESCROW.MSG_SETTLE_SUCCESS);
      onClose();
    } catch {
      showSnackbar(ADMIN_TEXT.ESCROW.MSG_SETTLE_FAILED);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">
            {answerId
              ? ADMIN_TEXT.ESCROW.TITLE_SETTLE
              : ADMIN_TEXT.ESCROW.TITLE_REFUND}
            <span className="text-sm font-normal text-gray-400 ml-2">
              #{postId}
              {answerId ? ` / Ans #${answerId}` : ""}
            </span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {loading ? (
            <div className="py-10 text-center text-gray-400">
              {ADMIN_TEXT.COMMON.LOADING}
            </div>
          ) : (
            <>
              {answerId ? (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    {ADMIN_TEXT.ESCROW.LABEL_SETTLE_STATUS}
                  </h4>
                  {settleReview ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          {ADMIN_TEXT.ESCROW.LABEL_POSSIBILITY}
                        </span>
                        <span
                          className={`font-bold ${settleReview.isSettlable ? "text-green-500" : "text-red-500"}`}
                        >
                          {settleReview.isSettlable
                            ? ADMIN_TEXT.ESCROW.STATUS_POSSIBLE
                            : ADMIN_TEXT.ESCROW.STATUS_IMPOSSIBLE}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          {ADMIN_TEXT.ESCROW.LABEL_CURRENT_STATUS}
                        </span>
                        <span className="font-bold text-gray-800">
                          {settleReview.status}
                        </span>
                      </div>
                      {settleReview.reason && (
                        <div className="text-xs text-gray-400 bg-white p-3 rounded-lg border border-gray-100 italic">
                          {settleReview.reason}
                        </div>
                      )}
                      {settleReview.isSettlable && (
                        <button
                          onClick={handleSettle}
                          className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-all mt-2"
                        >
                          {ADMIN_TEXT.ESCROW.BTN_SETTLE_EXEC}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      {ADMIN_TEXT.ESCROW.MSG_EMPTY}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                    {ADMIN_TEXT.ESCROW.LABEL_REFUND_STATUS}
                  </h4>
                  {refundReview ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          {ADMIN_TEXT.ESCROW.LABEL_POSSIBILITY}
                        </span>
                        <span
                          className={`font-bold ${refundReview.isRefundable ? "text-green-500" : "text-red-500"}`}
                        >
                          {refundReview.isRefundable
                            ? ADMIN_TEXT.ESCROW.STATUS_POSSIBLE
                            : ADMIN_TEXT.ESCROW.STATUS_IMPOSSIBLE}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">
                          {ADMIN_TEXT.ESCROW.LABEL_CURRENT_STATUS}
                        </span>
                        <span className="font-bold text-gray-800">
                          {refundReview.status}
                        </span>
                      </div>
                      {refundReview.reason && (
                        <div className="text-xs text-gray-400 bg-white p-3 rounded-lg border border-gray-100 italic">
                          {refundReview.reason}
                        </div>
                      )}
                      {refundReview.isRefundable && (
                        <button
                          onClick={handleRefund}
                          className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-100 transition-all mt-2"
                        >
                          {ADMIN_TEXT.ESCROW.BTN_REFUND_EXEC}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      {ADMIN_TEXT.ESCROW.MSG_EMPTY}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
          >
            {ADMIN_TEXT.ESCROW.BTN_CLOSE}
          </button>
        </div>
      </div>
    </div>
  );
};
