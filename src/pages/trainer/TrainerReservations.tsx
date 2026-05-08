import { useCallback, useEffect, useMemo, useState } from "react";
import TrainerHeader from "@components/trainer/TrainerHeader";
import { CommonModal } from "@components/common";
import {
  getReservationStatusLabel,
  isReservationPast,
  RESERVATION_STATUS,
} from "@constant/reservation";
import {
  approveTrainerReservation,
  getTrainerReservationDetail,
  getTrainerReservations,
  rejectTrainerReservation,
} from "@services";
import type { ReservationDetail, ReservationSummary } from "@services";

type TrainerReservationTab = "pending" | "approved" | "history";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));

const formatTime = (time: string) => time.slice(0, 5);

const getStatusBadgeStyles = (status: ReservationSummary["status"]) => {
  switch (status) {
    case RESERVATION_STATUS.PENDING:
      return "bg-red-50 text-red-500 border-red-100";
    case RESERVATION_STATUS.APPROVED:
      return "bg-main/5 text-main border-main/10";
    case RESERVATION_STATUS.SETTLED:
    case RESERVATION_STATUS.AUTO_SETTLED:
      return "bg-blue-50 text-blue-600 border-blue-100";
    default:
      return "bg-gray-50 text-gray-400 border-gray-100";
  }
};

const TrainerReservations = () => {
  const [activeTab, setActiveTab] = useState<TrainerReservationTab>("pending");
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDetail, setSelectedDetail] =
    useState<ReservationDetail | null>(null);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm?: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    desc: "",
    confirmLabel: "확인",
  });

  const loadReservations = useCallback(async (cursor?: string) => {
    try {
      if (!cursor) setIsLoading(true);
      else setIsFetchingNext(true);

      const response = await getTrainerReservations(undefined, cursor);

      if (!cursor) setReservations(response.reservations);
      else setReservations((prev) => [...prev, ...response.reservations]);

      setNextCursor(response.nextCursor);
      setHasNext(response.hasNext);
      setLoadError("");
    } catch {
      setLoadError("예약 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
      setIsFetchingNext(false);
    }
  }, []);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  const counts = useMemo(
    () => ({
      pending: reservations.filter(
        (r) => r.status === RESERVATION_STATUS.PENDING
      ).length,
      approved: reservations.filter(
        (r) => r.status === RESERVATION_STATUS.APPROVED
      ).length,
      history: reservations.filter((r) => isReservationPast(r.status)).length,
    }),
    [reservations]
  );

  const filteredReservations = useMemo(
    () =>
      reservations.filter((r) => {
        if (activeTab === "pending")
          return r.status === RESERVATION_STATUS.PENDING;
        if (activeTab === "approved")
          return r.status === RESERVATION_STATUS.APPROVED;
        return isReservationPast(r.status);
      }),
    [activeTab, reservations]
  );

  const closeModal = () =>
    setModal((prev) => ({ ...prev, isOpen: false, onConfirm: undefined }));

  const openAlert = (title: string, desc: string) => {
    setModal({
      isOpen: true,
      title,
      desc,
      confirmLabel: "확인",
      onConfirm: closeModal,
    });
  };

  const handleDetailClick = async (reservationId: number) => {
    try {
      const detail = await getTrainerReservationDetail(reservationId);
      setSelectedDetail(detail);
    } catch {
      openAlert("예약 상세", "상세 정보를 불러오지 못했습니다.");
    }
  };

  const openApproveModal = (reservationId: number) => {
    setModal({
      isOpen: true,
      title: "예약 승인",
      desc: "수강생의 예약을 승인하시겠습니까?<br/>승인 후에는 회원의 취소 또는 정산 절차에 따라 상태가 변경됩니다.",
      confirmLabel: isMutating ? "처리 중..." : "승인하기",
      cancelLabel: "나중에",
      onConfirm: async () => {
        closeModal();
        try {
          setIsMutating(true);
          await approveTrainerReservation(reservationId);
          await loadReservations();
          openAlert("승인 완료", "성공적으로 승인되었습니다.");
        } catch {
          openAlert("예약 승인", "승인 처리에 실패했습니다.");
        } finally {
          setIsMutating(false);
        }
      },
    });
  };

  const openRejectModal = (reservationId: number) => {
    setSelectedId(reservationId);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedId) return;
    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      openAlert("반려 사유 미입력", "반려 사유를 입력해 주세요.");
      return;
    }
    try {
      setIsMutating(true);
      await rejectTrainerReservation(selectedId, {
        rejectionReason: trimmedReason,
      });
      await loadReservations();
      setRejectModalOpen(false);
      setSelectedId(null);
      openAlert("반려 완료", "예약이 반려 처리되었습니다.");
    } catch {
      openAlert("예약 반려", "반려 처리에 실패했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const renderTabButton = (
    tab: TrainerReservationTab,
    label: string,
    count?: number
  ) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 py-4 text-[14px] font-black transition-all relative ${
        activeTab === tab ? "text-gray-900" : "text-gray-400"
      }`}
    >
      <span className="relative z-10">{label}</span>
      {typeof count === "number" && count > 0 && (
        <span className="ml-1.5 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 align-middle shadow-lg shadow-red-500/20">
          {count}
        </span>
      )}
      {activeTab === tab && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-[4px] bg-main rounded-full animate-in zoom-in-50 duration-300" />
      )}
    </button>
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFDFD]">
      <TrainerHeader title="예약 확인하기" showBack />

      {/* Tabs Section */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex px-2">
        {renderTabButton("pending", "승인 대기", counts.pending)}
        {renderTabButton("approved", "확정 예약", counts.approved)}
        {renderTabButton("history", "완료 내역", counts.history)}
      </div>

      <div className="flex-1 px-5 py-8 pb-32 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activeTab === "pending" && (
          <div className="bg-amber-50/50 border border-main/10 rounded-[22px] p-5 flex gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FAB12F"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <p className="text-[12px] font-bold text-amber-600 leading-relaxed">
              수강생의 새로운 예약 요청이 있습니다.
              <br />
              확인 후 승인 또는 반려 처리를 진행해 주세요.
            </p>
          </div>
        )}

        {loadError && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-[13px] font-black">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-main/20 border-t-main rounded-full animate-spin" />
            <p className="text-[13px] font-black text-gray-300 tracking-tight">
              예약 현황을 불러오고 있습니다...
            </p>
          </div>
        ) : filteredReservations.length > 0 ? (
          filteredReservations.map((item) => (
            <div
              key={item.reservationId}
              className="bg-white rounded-[26px] border border-gray-100 shadow-xl shadow-gray-200/30 overflow-hidden group hover:border-main/20 transition-all duration-300"
            >
              <div className="p-6">
                {/* Card Top: Status & Date */}
                <div className="flex justify-between items-start mb-6">
                  <div
                    className={`px-3 py-1 rounded-full border text-[11px] font-black tracking-tight ${getStatusBadgeStyles(item.status)}`}
                  >
                    {getReservationStatusLabel(item.status)}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[13px] font-black text-gray-900">
                      {formatDate(item.reservationDate)}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 mt-0.5">
                      {formatTime(item.reservationTime)}
                    </span>
                  </div>
                </div>

                {/* Card Middle: User & Class */}
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-14 h-14 rounded-[22px] bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner group-hover:bg-amber-50 transition-colors">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#D1D5DB"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="group-hover:stroke-main transition-colors"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[18px] font-black text-gray-900 tracking-tight mb-1">
                      {`User #${item.userId}`} 회원님
                    </h3>
                    <p className="text-[12px] font-bold text-gray-400 line-clamp-1">
                      슬롯 ID: {item.slotId}
                    </p>
                  </div>
                </div>

                {/* Request Box */}
                {item.userRequest && (
                  <div className="mb-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-1.5 mb-2 opacity-40">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                      </svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        User Request
                      </span>
                    </div>
                    <p className="text-[13px] font-bold text-gray-600 leading-relaxed italic">
                      "{item.userRequest}"
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleDetailClick(item.reservationId)}
                    className="flex-1 h-12 bg-white border border-gray-100 text-gray-400 rounded-[18px] text-[13px] font-black btn-press hover:bg-gray-50 transition-all"
                  >
                    상세 정보
                  </button>

                  {item.status === RESERVATION_STATUS.PENDING && (
                    <>
                      <button
                        onClick={() => openRejectModal(item.reservationId)}
                        disabled={isMutating}
                        className="flex-1 h-12 bg-red-50 text-red-500 rounded-[18px] text-[13px] font-black btn-press"
                      >
                        반려
                      </button>
                      <button
                        onClick={() => openApproveModal(item.reservationId)}
                        disabled={isMutating}
                        className="flex-1 h-12 bg-main text-white rounded-[18px] text-[13px] font-black shadow-lg shadow-main/20 btn-press"
                      >
                        승인하기
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-28 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 rounded-[28px] bg-white shadow-xl shadow-gray-200/40 flex items-center justify-center mb-6">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="font-black text-gray-900 text-[18px] tracking-tight mb-2">
              예약 내역이 없습니다
            </h3>
            <p className="text-gray-400 text-[13px] font-bold text-center leading-relaxed">
              수강생의 새로운 예약 요청이 오면
              <br />
              이곳에서 확인하실 수 있습니다.
            </p>
          </div>
        )}

        {!isLoading && hasNext && (
          <button
            onClick={() => void loadReservations(nextCursor || undefined)}
            disabled={isFetchingNext}
            className="w-full h-14 bg-white border border-gray-100 rounded-2xl text-[14px] font-black text-gray-400 btn-press shadow-sm mt-4"
          >
            {isFetchingNext ? "로딩 중..." : "예약 내역 더 보기"}
          </button>
        )}
      </div>

      {/* Modals */}
      {rejectModalOpen && (
        <CommonModal
          title="예약 반려"
          desc="반려 사유를 입력해 주세요.<br/>해당 사유는 수강생에게 전달됩니다."
          confirmLabel={isMutating ? "처리 중..." : "반려 확정"}
          onConfirmClick={handleRejectConfirm}
          cancelLabel="닫기"
          onCancelClick={() => {
            setRejectModalOpen(false);
            setSelectedId(null);
          }}
        >
          <div className="w-full mt-4">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="예: 해당 시간대는 외부 일정으로 인해 수업이 어렵습니다."
              className="w-full h-[120px] bg-gray-50 border border-gray-100 rounded-2xl p-4 text-[14px] font-bold text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-main transition-all resize-none shadow-inner"
            />
          </div>
        </CommonModal>
      )}

      {selectedDetail && (
        <CommonModal
          title="예약 상세 정보"
          desc="선택하신 예약의 세부 정보입니다."
          confirmLabel="확인"
          onConfirmClick={() => setSelectedDetail(null)}
        >
          <div className="w-full mt-6 text-left flex flex-col gap-6">
            <div className="bg-[#F9FAFB] rounded-[28px] p-6 border border-gray-100 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Reservation ID
                </span>
                <p className="text-[15px] font-black text-gray-900">
                  #{selectedDetail.reservationId}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Reservation Date
                </span>
                <p className="text-[15px] font-black text-gray-900">
                  {formatDate(selectedDetail.reservationDate)}{" "}
                  {formatTime(selectedDetail.reservationTime)}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Status
                </span>
                <p className="text-[15px] font-black text-main">
                  {getReservationStatusLabel(selectedDetail.status)}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Transaction Hash
                </span>
                <p className="text-[11px] font-bold text-gray-500 break-all bg-white p-3 rounded-xl border border-gray-100 mt-2 shadow-inner font-mono leading-relaxed">
                  {selectedDetail.txHash || "기록된 해시 정보가 없습니다."}
                </p>
              </div>
            </div>
          </div>
        </CommonModal>
      )}

      {modal.isOpen && (
        <CommonModal
          title={modal.title}
          desc={modal.desc}
          confirmLabel={modal.confirmLabel}
          onConfirmClick={modal.onConfirm}
          cancelLabel={modal.cancelLabel}
          onCancelClick={closeModal}
        />
      )}
    </div>
  );
};

export default TrainerReservations;
