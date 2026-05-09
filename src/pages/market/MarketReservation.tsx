import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommonModal } from "@components/common";
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

const getStatusTheme = (status: ReservationSummary["status"]) => {
  switch (status) {
    case RESERVATION_STATUS.APPROVED:
      return {
        badge: "bg-main/10 text-main border-main/20",
        glow: "shadow-main/5",
      };
    case RESERVATION_STATUS.PENDING:
      return {
        badge: "bg-red-50 text-red-500 border-red-100",
        glow: "shadow-red-500/5",
      };
    case RESERVATION_STATUS.SETTLED:
    case RESERVATION_STATUS.AUTO_SETTLED:
      return {
        badge: "bg-blue-50 text-blue-600 border-blue-100",
        glow: "shadow-blue-500/5",
      };
    default:
      return {
        badge: "bg-gray-50 text-gray-400 border-gray-100",
        glow: "shadow-gray-200/5",
      };
  }
};

const MarketReservation = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [reservations, setReservations] = useState<ReservationSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNext, setIsFetchingNext] = useState(false);
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

  const loadReservations = useCallback(async (cursor?: string) => {
    try {
      if (!cursor) setIsLoading(true);
      else setIsFetchingNext(true);

      const response = await getMyReservations(undefined, cursor);

      if (!cursor) setReservations(response.reservations);
      else setReservations((prev) => [...prev, ...response.reservations]);

      setNextCursor(response.nextCursor);
      setHasNext(response.hasNext);
      setLoadError("");
    } catch {
      setLoadError("예약 내역을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
      setIsFetchingNext(false);
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
      const detail = await getReservationDetail(reservationId);
      setSelectedDetail(detail);
    } catch {
      openAlert("예약 상세", "예약 상세 정보를 불러오지 못했습니다.");
    }
  };

  const handleCancelConfirm = async (reservationId: number) => {
    try {
      setIsMutating(true);
      await cancelMyReservation(reservationId);
      await loadReservations();
      openAlert("예약 취소", "예약이 성공적으로 취소되었습니다.");
    } catch {
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
      openAlert("수강 완료", "수강 완료 처리가 정상적으로 접수되었습니다.");
    } catch {
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
      title: "수강 완료 확정",
      desc: "운동을 모두 마치셨나요?<br/>확정 후 트레이너에게 정산 절차가 진행됩니다.",
      confirmLabel: isMutating ? "처리 중..." : "완료 확정",
      cancelLabel: "닫기",
      onConfirm: async () => {
        closeModal();
        await handleCompleteConfirm(reservationId);
      },
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#FDFDFD] min-h-screen">
      <SimpleHeader title="예약 및 이용 내역" />

      {/* Modern Pill Tabs */}
      <div className="sticky top-0 z-30 bg-[#FDFDFD]/80 backdrop-blur-xl border-b border-gray-50 px-5 py-3">
        <div className="flex p-1 bg-gray-100/50 rounded-2xl">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-2.5 text-[13px] font-black rounded-xl transition-all duration-300 ${
              activeTab === "upcoming"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            다가오는 예약
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`flex-1 py-2.5 text-[13px] font-black rounded-xl transition-all duration-300 ${
              activeTab === "past"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            지난 이용 내역
          </button>
        </div>
      </div>

      <div className="flex-1 px-5 py-8 flex flex-col gap-6 pb-28 animate-fade-in">
        {loadError && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-[13px] font-black animate-pulse">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-[5px] border-main/10 border-t-main rounded-full animate-spin" />
            <p className="text-[14px] font-black text-gray-300 tracking-tight">
              내역을 불러오는 중입니다...
            </p>
          </div>
        ) : filteredReservations.length > 0 ? (
          filteredReservations.map((item) => {
            const theme = getStatusTheme(item.status);
            return (
              <div
                key={item.reservationId}
                className={`bg-white rounded-[32px] border border-gray-50 shadow-2xl shadow-gray-200/40 overflow-hidden active:scale-[0.98] transition-all duration-300 animate-scale-in`}
              >
                <div className="p-6">
                  {/* Status & Date Line */}
                  <div className="flex justify-between items-center mb-6">
                    <div
                      className={`px-3 py-1.5 rounded-full border text-[10px] font-black tracking-wider uppercase ${theme.badge}`}
                    >
                      {getReservationStatusLabel(item.status)}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[14px] font-black text-gray-900">
                        {formatDate(item.reservationDate)}
                      </span>
                      <span className="text-[11px] font-bold text-main mt-0.5">
                        {formatTime(item.reservationTime)} 방문 예정
                      </span>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex gap-4 mb-6">
                    <div className="w-20 h-20 rounded-[24px] bg-gray-50 border border-gray-100 shrink-0 shadow-inner flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-main/5 to-transparent" />
                      <img
                        src="/icon/token.svg"
                        alt=""
                        className="w-8 h-8 opacity-10 grayscale"
                      />
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                          Program ID
                        </span>
                        <span className="text-[10px] font-black text-main bg-main/5 px-2 py-0.5 rounded-md">
                          #{item.reservationId}
                        </span>
                      </div>
                      <h3 className="font-black text-[18px] text-gray-900 leading-[1.3] line-clamp-2 break-keep mb-2">
                        {item.slotId % 2 === 0
                          ? "1:1 집중 PT 클래스"
                          : "그룹 필라테스 클래스"}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-main/40" />
                        <span className="text-[12.5px] font-bold text-gray-500">
                          {item.durationMinutes}분 집중 수업
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Refined Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 pt-6 border-t border-gray-50">
                    <button
                      onClick={() => void handleDetailClick(item.reservationId)}
                      className="h-12 bg-gray-50 text-gray-500 rounded-[18px] text-[13px] font-black btn-press hover:bg-gray-100 transition-all border-none"
                    >
                      상세 내역
                    </button>

                    {isReservationCancellable(item.status) && (
                      <button
                        onClick={() => openCancelModal(item.reservationId)}
                        disabled={isMutating}
                        className="h-12 bg-red-50 text-red-500 rounded-[18px] text-[13px] font-black btn-press border-none"
                      >
                        예약 취소
                      </button>
                    )}

                    {isReservationCompletable(item.status) && (
                      <button
                        onClick={() => openCompleteModal(item.reservationId)}
                        disabled={isMutating}
                        className="h-12 bg-main text-white rounded-[18px] text-[13px] font-black shadow-lg shadow-main/20 btn-press border-none"
                      >
                        수강 완료
                      </button>
                    )}

                    {(item.status === RESERVATION_STATUS.SETTLED ||
                      item.status === RESERVATION_STATUS.AUTO_SETTLED) && (
                      <button
                        onClick={() =>
                          navigate(`/market/review/${item.reservationId}`)
                        }
                        className="h-12 bg-main text-white rounded-[18px] text-[13px] font-black shadow-lg shadow-main/20 btn-press border-none"
                      >
                        리뷰 작성
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-28 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 rounded-[36px] bg-white shadow-2xl shadow-gray-200/50 flex items-center justify-center mb-8 relative">
              <div className="absolute inset-0 bg-main/5 rounded-[36px] animate-pulse" />
              <svg
                width="42"
                height="42"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="font-black text-gray-900 text-[20px] tracking-tight mb-3">
              {activeTab === "upcoming"
                ? "진행 중인 예약이 없습니다"
                : "지난 이용 내역이 없습니다"}
            </h3>
            <p className="text-gray-400 text-[14px] font-bold text-center leading-relaxed mb-12 max-w-[240px]">
              MZTK 마켓에서 몸짱이 될 수 있는 다양한 클래스를 찾아보세요.
            </p>
            <button
              onClick={() => navigate("/market")}
              className="px-10 py-4.5 bg-gray-900 text-white font-black text-[15px] rounded-[24px] shadow-2xl shadow-gray-900/30 btn-press border-none"
            >
              인기 클래스 둘러보기
            </button>
          </div>
        )}

        {!isLoading && hasNext && (
          <button
            onClick={() => void loadReservations(nextCursor || undefined)}
            disabled={isFetchingNext}
            className="w-full h-14 bg-white border border-gray-100 rounded-[22px] text-[14px] font-black text-gray-400 btn-press shadow-sm mt-6"
          >
            {isFetchingNext ? "내역 로딩 중..." : "이전 내역 더 보기"}
          </button>
        )}
      </div>

      {/* Refined Detail Modal */}
      {selectedDetail && (
        <CommonModal
          title="예약 상세 정보"
          desc="블록체인에 안전하게 기록된 정보입니다."
          confirmLabel="확인"
          onConfirmClick={() => setSelectedDetail(null)}
        >
          <div className="w-full mt-6 text-left flex flex-col gap-6 animate-fade-in">
            <div className="bg-[#F9FAFB] rounded-[32px] p-7 border border-gray-100 flex flex-col gap-6 shadow-inner">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Selected Program
                </span>
                <p className="text-[16px] font-black text-gray-900">
                  {selectedDetail.slotId % 2 === 0
                    ? "1:1 집중 PT 클래스"
                    : "그룹 필라테스 클래스"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Schedule
                </span>
                <p className="text-[16px] font-black text-gray-900">
                  {formatDate(selectedDetail.reservationDate)}{" "}
                  {formatTime(selectedDetail.reservationTime)}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  Status
                </span>
                <p className="text-[16px] font-black text-main">
                  {getReservationStatusLabel(selectedDetail.status)}
                </p>
              </div>

              {selectedDetail.userRequest && (
                <div className="pt-5 border-t border-gray-100/60">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    My Request
                  </span>
                  <div className="relative mt-3">
                    <div className="absolute -left-2 top-0 text-main/20 text-4xl font-serif">
                      "
                    </div>
                    <p className="text-[14px] font-bold text-gray-600 leading-relaxed pl-4">
                      {selectedDetail.userRequest}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-5 border-t border-gray-100/60">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                  On-Chain Transaction
                </span>
                <p className="text-[11px] font-bold text-gray-400 break-all bg-white p-4 rounded-2xl border border-gray-100 mt-3 shadow-inner font-mono leading-relaxed overflow-hidden">
                  {selectedDetail.txHash || "온체인 기록을 생성 중입니다..."}
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
