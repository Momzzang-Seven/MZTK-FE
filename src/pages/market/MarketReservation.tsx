import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommonButton, CommonModal } from "@components/common";
import { SimpleHeader } from "@components/layout";
import {
  getReservationStatusLabel,
  isReservationCancellable,
  isReservationCompletable,
  isReservationPast,
  RESERVATION_STATUS,
} from "@constant/reservation";
import {
  cancelMyReservation,
  completeMyReservation,
  getMyReservations,
  getReservationDetail,
} from "@services";
import type { ReservationDetail, ReservationSummary } from "@services";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));

const formatTime = (time: string) => time.slice(0, 5);

const getStatusBadgeClass = (status: ReservationSummary["status"]) => {
  switch (status) {
    case RESERVATION_STATUS.APPROVED:
      return "bg-main/10 text-main";
    case RESERVATION_STATUS.PENDING:
      return "bg-red-50 text-red-500";
    case RESERVATION_STATUS.SETTLED:
    case RESERVATION_STATUS.AUTO_SETTLED:
      return "bg-blue-50 text-blue-600";
    case RESERVATION_STATUS.REJECTED:
    case RESERVATION_STATUS.TIMEOUT_CANCELLED:
    case RESERVATION_STATUS.USER_CANCELLED:
      return "bg-gray-100 text-gray-500";
    default:
      return "bg-gray-100 text-gray-500";
  }
};

const getFallbackClassName = (reservation: ReservationSummary) =>
  `클래스 슬롯 #${reservation.slotId}`;

const MarketReservation = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [loadError, setLoadError] = useState("");
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
  const navigate = useNavigate();

  const loadReservations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getMyReservations();
      setReservations(response);
      setLoadError("");
    } catch (error) {
      console.error("Failed to load reservations", error);
      setLoadError("예약 내역을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReservations();
  }, [loadReservations]);

  const filteredReservations = useMemo(
    () =>
      reservations.filter((reservation) =>
        activeTab === "upcoming"
          ? !isReservationPast(reservation.status)
          : isReservationPast(reservation.status)
      ),
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
      const detail = await getReservationDetail(reservationId);
      setSelectedDetail(detail);
    } catch (error) {
      console.error("Failed to load reservation detail", error);
      openAlert("예약 상세", "예약 상세 정보를 불러오지 못했습니다.");
    }
  };

  const handleCancelConfirm = async (reservationId: number) => {
    try {
      setIsMutating(true);
      await cancelMyReservation(reservationId);
      await loadReservations();
      openAlert("예약 취소", "예약이 취소되었습니다.");
    } catch (error) {
      console.error("Failed to cancel reservation", error);
      openAlert("예약 취소", "예약 취소를 처리하지 못했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleCompleteConfirm = async (reservationId: number) => {
    try {
      setIsMutating(true);
      await completeMyReservation(reservationId);
      await loadReservations();
      openAlert("수강 완료", "수강 완료 처리가 접수되었습니다.");
    } catch (error) {
      console.error("Failed to complete reservation", error);
      openAlert("수강 완료", "수강 완료 처리를 하지 못했습니다.");
    } finally {
      setIsMutating(false);
    }
  };

  const openCancelModal = (reservationId: number) => {
    setModal({
      isOpen: true,
      title: "예약 취소",
      desc: "정말 예약을 취소하시겠습니까?<br/>승인 대기 상태의 예약만 즉시 취소할 수 있습니다.",
      confirmLabel: isMutating ? "처리 중..." : "예약 취소",
      cancelLabel: "닫기",
      onConfirm: async () => {
        closeModal();
        await handleCancelConfirm(reservationId);
      },
    });
  };

  const openCompleteModal = (reservationId: number) => {
    setModal({
      isOpen: true,
      title: "수강 완료",
      desc: "수강 완료를 확정하시겠습니까?<br/>확정 후 정산 절차가 진행됩니다.",
      confirmLabel: isMutating ? "처리 중..." : "완료 확정",
      cancelLabel: "닫기",
      onConfirm: async () => {
        closeModal();
        await handleCompleteConfirm(reservationId);
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      <SimpleHeader />

      <div className="flex w-full bg-white border-b border-gray-100 z-10 sticky top-0">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 py-4 text-[15px] font-bold transition-all relative ${
            activeTab === "upcoming" ? "text-gray-900" : "text-gray-400"
          }`}
        >
          다가오는 클래스
          {activeTab === "upcoming" && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`flex-1 py-4 text-[15px] font-bold transition-all relative ${
            activeTab === "past" ? "text-gray-900" : "text-gray-400"
          }`}
        >
          지난 클래스
          {activeTab === "past" && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 rounded-t-full"></div>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4 pb-24">
        {loadError && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="py-20 flex items-center justify-center text-gray-400 font-medium">
            예약 내역을 불러오는 중입니다...
          </div>
        ) : filteredReservations.length > 0 ? (
          filteredReservations.map((item) => (
            <div
              key={item.reservationId}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-4"
            >
              <div className="flex justify-between items-center">
                <span
                  className={`text-[12px] font-bold px-2.5 py-1 rounded-md ${getStatusBadgeClass(item.status)}`}
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

              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 shrink-0">
                  <img
                    src="/icon/gallery.svg"
                    alt=""
                    className="w-8 h-8 opacity-40"
                  />
                </div>
                <div className="flex flex-col justify-center flex-1">
                  <span className="text-gray-500 text-[12px] font-medium mb-0.5">
                    Trainer #{item.trainerId}
                  </span>
                  <h3 className="font-bold text-[15px] text-gray-900 leading-tight line-clamp-2 break-keep mb-1.5">
                    {getFallbackClassName(item)}
                  </h3>
                  <span className="text-[12px] text-gray-400">
                    {item.durationMinutes}분 수업
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <path
                      d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[13px] font-bold text-gray-700">
                    {formatDate(item.reservationDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-gray-400"
                  >
                    <path
                      d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12ZM15.71 15.18L12.61 13.33C12.11 13.03 11.71 12.31 11.71 11.72V7.61"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-[13px] font-bold text-gray-700">
                    {formatTime(item.reservationTime)} 방문
                  </span>
                </div>
              </div>

              {item.userRequest && (
                <div className="bg-white p-3 rounded-xl border border-gray-100 text-[13px] text-gray-600 leading-relaxed">
                  {item.userRequest}
                </div>
              )}

              {isReservationCancellable(item.status) && (
                <button
                  onClick={() => openCancelModal(item.reservationId)}
                  className="w-full py-3.5 rounded-xl font-bold text-[14px] transition-colors bg-main text-white hover:brightness-95 shadow-sm"
                >
                  예약 취소
                </button>
              )}

              {isReservationCompletable(item.status) && (
                <button
                  onClick={() => openCompleteModal(item.reservationId)}
                  className="w-full py-3.5 rounded-xl font-bold text-[14px] transition-colors bg-main text-white hover:brightness-95 shadow-sm"
                >
                  수강 완료
                </button>
              )}

              {(item.status === RESERVATION_STATUS.SETTLED ||
                item.status === RESERVATION_STATUS.AUTO_SETTLED) && (
                <CommonButton
                  label="리뷰 남기기"
                  onClick={() =>
                    navigate(`/market/review/${item.reservationId}`)
                  }
                  className="h-[48px] rounded-xl font-bold text-[14px] mt-1"
                />
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
              <span className="text-3xl opacity-30">↻</span>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-gray-700 mb-1">
                {activeTab === "upcoming"
                  ? "예정된 클래스가 없습니다."
                  : "지난 클래스 내역이 없습니다."}
              </h3>
              <p className="text-sm text-gray-400 whitespace-pre-line">
                마켓에서 마음에 드는 운동을 찾아보세요.
              </p>
            </div>
            <button
              onClick={() => navigate("/market")}
              className="mt-4 px-6 py-2.5 bg-gray-900 text-white font-bold text-[14px] rounded-full shadow-sm"
            >
              마켓으로 가기
            </button>
          </div>
        )}
      </div>

      {selectedDetail && (
        <CommonModal
          title="예약 상세 정보"
          desc="블록체인에 기록되는 예약 정보입니다."
          confirmLabel="확인"
          onConfirmClick={() => setSelectedDetail(null)}
        >
          <div className="w-full flex flex-col gap-4 mt-2 mb-1 text-left">
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-4">
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
                    내 요청사항
                  </span>
                  <div className="bg-white p-3 rounded-xl border border-gray-100 text-[13px] text-gray-600 leading-relaxed italic">
                    "{selectedDetail.userRequest}"
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                  Transaction ID
                </span>
                <p className="text-[10px] text-gray-400 font-mono break-all bg-white p-2 rounded border border-gray-50">
                  {selectedDetail.txHash ||
                    "아직 트랜잭션이 기록되지 않았습니다."}
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

export default MarketReservation;
