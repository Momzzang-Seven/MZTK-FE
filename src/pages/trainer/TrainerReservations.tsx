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

const getStatusBadgeClass = (status: ReservationSummary["status"]) => {
  switch (status) {
    case RESERVATION_STATUS.PENDING:
      return "bg-red-50 text-red-500";
    case RESERVATION_STATUS.APPROVED:
      return "bg-main/10 text-main";
    case RESERVATION_STATUS.SETTLED:
    case RESERVATION_STATUS.AUTO_SETTLED:
      return "bg-blue-50 text-blue-600";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

const getFallbackClassName = (reservation: ReservationSummary) =>
  `클래스 슬롯 #${reservation.slotId}`;

const getFallbackCustomerName = (reservation: ReservationSummary) =>
  `User #${reservation.userId}`;

const TrainerReservations = () => {
  const [activeTab, setActiveTab] = useState<TrainerReservationTab>("pending");
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const loadReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getTrainerReservations();
      setReservations(response);
      setLoadError("");
    } catch (error) {
      console.error("Failed to load trainer reservations", error);
      setLoadError("예약 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  const counts = useMemo(
    () => ({
      pending: reservations.filter(
        (reservation) => reservation.status === RESERVATION_STATUS.PENDING
      ).length,
      approved: reservations.filter(
        (reservation) => reservation.status === RESERVATION_STATUS.APPROVED
      ).length,
      history: reservations.filter((reservation) =>
        isReservationPast(reservation.status)
      ).length,
    }),
    [reservations]
  );

  const filteredReservations = useMemo(
    () =>
      reservations.filter((reservation) => {
        if (activeTab === "pending") {
          return reservation.status === RESERVATION_STATUS.PENDING;
        }

        if (activeTab === "approved") {
          return reservation.status === RESERVATION_STATUS.APPROVED;
        }

        return isReservationPast(reservation.status);
      }),
    [activeTab, reservations]
  );

  const closeModal = () => {
    setModal((prev) => ({ ...prev, isOpen: false, onConfirm: undefined }));
  };

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
    } catch (error) {
      console.error("Failed to load trainer reservation detail", error);
      openAlert("예약 상세", "예약 상세 정보를 불러오지 못했습니다.");
    }
  };

  const openApproveModal = (reservationId: number) => {
    setModal({
      isOpen: true,
      title: "예약 승인",
      desc: "예약을 승인하시겠습니까?<br/>승인 후에는 회원의 취소 또는 정산 플로우에 따라 상태가 변경됩니다.",
      confirmLabel: isMutating ? "처리 중..." : "승인",
      cancelLabel: "닫기",
      onConfirm: async () => {
        closeModal();

        try {
          setIsMutating(true);
          await approveTrainerReservation(reservationId);
          await loadReservations();
          openAlert("승인 완료", "예약을 승인했습니다.");
        } catch (error) {
          console.error("Failed to approve reservation", error);
          openAlert("예약 승인", "예약 승인을 처리하지 못했습니다.");
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
      openAlert("예약 반려", "반려 사유를 입력해주세요.");
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
      setRejectReason("");
      openAlert("반려 완료", "예약을 반려했습니다.");
    } catch (error) {
      console.error("Failed to reject reservation", error);
      openAlert("예약 반려", "예약 반려를 처리하지 못했습니다.");
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
      className={`flex-1 min-w-[92px] py-4 text-[13px] font-bold transition-all relative ${
        activeTab === tab ? "text-gray-900" : "text-gray-400"
      }`}
    >
      {label}
      {typeof count === "number" && count > 0 && (
        <span className="ml-1.5 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 align-middle">
          {count}
        </span>
      )}
      {activeTab === tab && (
        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 rounded-t-full" />
      )}
    </button>
  );

  const emptyTitle =
    activeTab === "pending"
      ? "승인 대기 중인 예약이 없습니다"
      : activeTab === "approved"
        ? "확정된 예약이 없습니다"
        : "완료된 예약 내역이 없습니다";

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      <TrainerHeader title="예약 확인하기" showBack />

      <div className="flex w-full bg-white border-b border-gray-100 z-10 sticky top-0 overflow-x-auto scrollbar-hide">
        {renderTabButton("pending", "승인 대기", counts.pending)}
        {renderTabButton("approved", "확정 예약", counts.approved)}
        {renderTabButton("history", "완료 내역", counts.history)}
      </div>

      {activeTab === "pending" && (
        <div className="bg-[#FFF9EE] px-5 py-3 text-[12px] text-orange-500 font-medium tracking-tight border-b border-[#FAD390]/30 shadow-sm">
          <p>대기 예약은 승인 또는 반려 처리 후 회원에게 반영됩니다.</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4 pb-24">
        {loadError && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="py-24 flex items-center justify-center text-gray-400 font-medium">
            예약 목록을 불러오는 중입니다...
          </div>
        ) : filteredReservations.length > 0 ? (
          filteredReservations.map((item) => (
            <div
              key={item.reservationId}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center mb-1 border-b border-gray-100 pb-2">
                <span
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${getStatusBadgeClass(
                    item.status
                  )}`}
                >
                  {getReservationStatusLabel(item.status)}
                </span>
                <button
                  onClick={() => void handleDetailClick(item.reservationId)}
                  className="text-[12px] font-bold text-gray-400 cursor-pointer hover:text-gray-600 underline"
                >
                  예약 상세
                </button>
              </div>

              <div className="flex flex-col gap-1.5 pt-1 pb-4 border-b border-gray-100">
                <h3 className="text-gray-900 font-bold text-[18px]">
                  {getFallbackCustomerName(item)} 회원
                </h3>
                <span className="text-gray-500 text-[13px] font-medium leading-snug break-keep">
                  {getFallbackClassName(item)}
                </span>
              </div>

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-gray-400 font-medium">예약 일시</span>
                  <div className="flex items-center gap-1.5 text-gray-800 font-bold">
                    <span>{formatDate(item.reservationDate)}</span>
                    <span>{formatTime(item.reservationTime)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[14px]">
                  <span className="text-gray-400 font-medium">수업 시간</span>
                  <span className="text-gray-800 font-bold">
                    {item.durationMinutes}분
                  </span>
                </div>
                {item.userRequest && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <span className="text-gray-400 text-[13px] font-medium">
                      요청/특이사항
                    </span>
                    <div className="bg-gray-50 p-3 rounded-lg text-gray-700 text-[14px] leading-relaxed break-keep">
                      {item.userRequest}
                    </div>
                  </div>
                )}
              </div>

              {item.status === RESERVATION_STATUS.PENDING && (
                <div className="flex gap-2 mt-2 pt-1 border-t border-gray-100">
                  <button
                    onClick={() => openRejectModal(item.reservationId)}
                    disabled={isMutating}
                    className="flex-1 py-3.5 mt-2 rounded-xl font-bold text-[14px] bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    예약 반려
                  </button>
                  <button
                    onClick={() => openApproveModal(item.reservationId)}
                    disabled={isMutating}
                    className="flex-1 py-3.5 mt-2 rounded-xl font-bold text-[14px] bg-main text-white shadow-sm hover:brightness-95 transition-all disabled:opacity-50"
                  >
                    예약 승인
                  </button>
                </div>
              )}

              {item.status === RESERVATION_STATUS.APPROVED && (
                <div className="mt-2 pt-1 border-t border-gray-100">
                  <p className="text-[11px] text-gray-400 text-center font-medium mt-2">
                    확정된 예약은 회원 완료 처리 또는 정산 플로우에 따라
                    완료됩니다.
                  </p>
                </div>
              )}

              {(item.status === RESERVATION_STATUS.SETTLED ||
                item.status === RESERVATION_STATUS.AUTO_SETTLED) && (
                <button
                  onClick={() => void handleDetailClick(item.reservationId)}
                  className="w-full mt-2 py-3.5 rounded-xl font-bold text-[14px] bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100 transition-all"
                >
                  트랜잭션 정보 확인
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-gray-300"
              >
                <path
                  d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-gray-700 mb-1">{emptyTitle}</h3>
              <p className="text-sm text-gray-400 whitespace-pre-line">
                새 예약 요청이 들어오면 이곳에서 확인하고 처리할 수 있습니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {rejectModalOpen && (
        <CommonModal
          title="예약 반려"
          desc="반려 사유를 입력해주세요. 해당 사유는 회원에게 전달됩니다."
          confirmLabel={isMutating ? "처리 중..." : "반려 확인"}
          onConfirmClick={handleRejectConfirm}
          cancelLabel="닫기"
          onCancelClick={() => {
            setRejectModalOpen(false);
            setSelectedId(null);
          }}
        >
          <div className="w-full mt-2">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="예: 해당 시간대는 오프라인 일정이 있어 다른 시간대로 예약 부탁드립니다."
              className="w-full h-[100px] bg-gray-50 border border-gray-200 rounded-xl p-3 text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-main focus:ring-1 focus:ring-main/20 resize-none transition-all shadow-sm text-left"
            />
          </div>
        </CommonModal>
      )}

      {selectedDetail && (
        <CommonModal
          title="예약 상세 정보"
          desc={`${getFallbackCustomerName(
            selectedDetail
          )} 회원의 예약 정보입니다.`}
          confirmLabel="확인"
          onConfirmClick={() => setSelectedDetail(null)}
        >
          <div className="w-full mt-3 flex flex-col gap-4 text-left">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  클래스 정보
                </span>
                <p className="text-[14px] text-gray-800 font-bold">
                  {getFallbackClassName(selectedDetail)}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  예약 일시
                </span>
                <p className="text-[14px] text-gray-800 font-bold">
                  {formatDate(selectedDetail.reservationDate)}{" "}
                  {formatTime(selectedDetail.reservationTime)}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  상태
                </span>
                <p className="text-[14px] text-gray-800 font-bold">
                  {getReservationStatusLabel(selectedDetail.status)}
                </p>
              </div>
              {selectedDetail.userRequest && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                    요청사항
                  </span>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 text-[13px] text-gray-600 leading-relaxed">
                    {selectedDetail.userRequest}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  Transaction Hash
                </span>
                <div className="text-[12px] text-gray-600 break-all font-mono bg-white p-2 rounded border border-gray-100 leading-relaxed shadow-inner">
                  {selectedDetail.txHash ||
                    "아직 트랜잭션이 기록되지 않았습니다."}
                </div>
              </div>
              {selectedDetail.orderId && (
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                    Order ID
                  </span>
                  <div className="text-[12px] text-gray-600 break-all font-mono bg-white p-2 rounded border border-gray-100 leading-relaxed shadow-inner">
                    {selectedDetail.orderId}
                  </div>
                </div>
              )}
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
