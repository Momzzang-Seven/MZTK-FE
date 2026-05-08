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
    } catch (error) {
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
      <SimpleHeader />

      {/* Premium Tabs */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex px-2">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 py-4 text-[14px] font-black transition-all relative ${
            activeTab === "upcoming" ? "text-gray-900" : "text-gray-400"
          }`}
        >
          다가오는 예약
          {activeTab === "upcoming" && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-[4px] bg-main rounded-full animate-in zoom-in-50 duration-300" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`flex-1 py-4 text-[14px] font-black transition-all relative ${
            activeTab === "past" ? "text-gray-900" : "text-gray-400"
          }`}
        >
          지난 이용 내역
          {activeTab === "past" && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-[4px] bg-main rounded-full animate-in zoom-in-50 duration-300" />
          )}
        </button>
      </div>

      <div className="flex-1 px-5 py-8 flex flex-col gap-6 pb-28 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {loadError && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-[13px] font-black">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-main/20 border-t-main rounded-full animate-spin" />
            <p className="text-[13px] font-black text-gray-300 tracking-tight">
              예약 내역을 가져오고 있습니다...
            </p>
          </div>
        ) : filteredReservations.length > 0 ? (
          filteredReservations.map((item) => {
            const theme = getStatusTheme(item.status);
            return (
              <div
                key={item.reservationId}
                className={`bg-white rounded-[26px] border border-gray-100 shadow-xl ${theme.glow} overflow-hidden group hover:border-main/20 transition-all duration-300`}
              >
                <div className="p-6">
                  {/* Card Header: Status & Date */}
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`px-3 py-1 rounded-full border text-[10px] font-black tracking-tight uppercase ${theme.badge}`}
                    >
                      {getReservationStatusLabel(item.status)}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[13px] font-black text-gray-900">
                        {formatDate(item.reservationDate)}
                      </span>
                      <span className="text-[11px] font-bold text-main mt-0.5">
                        {formatTime(item.reservationTime)} 방문
                      </span>
                    </div>
                  </div>

                  {/* Card Body: Class Info */}
                  <div className="flex gap-5 mb-6">
                    <div className="w-20 h-20 rounded-[22px] overflow-hidden bg-gray-50 border border-gray-100 shrink-0 shadow-inner flex items-center justify-center">
                      <img
                        src="/icon/gallery.svg"
                        alt=""
                        className="w-8 h-8 opacity-20"
                      />
                    </div>
                    <div className="flex flex-col justify-center flex-1">
                      <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1.5">
                        Trainer #{item.trainerId}
                      </span>
                      <h3 className="font-black text-[17px] text-gray-900 leading-tight line-clamp-2 break-keep mb-2">
                        클래스 예약 #{item.slotId}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-main" />
                        <span className="text-[12px] font-bold text-gray-500">
                          {item.durationMinutes}분 집중 수업
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div className="flex flex-col gap-3 pt-6 border-t border-gray-50">
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          void handleDetailClick(item.reservationId)
                        }
                        className="flex-1 h-12 bg-gray-50 text-gray-400 rounded-[18px] text-[13px] font-black btn-press hover:bg-gray-100 transition-all"
                      >
                        상세 내역
                      </button>

                      {isReservationCancellable(item.status) && (
                        <button
                          onClick={() => openCancelModal(item.reservationId)}
                          disabled={isMutating}
                          className="flex-1 h-12 bg-red-50 text-red-500 rounded-[18px] text-[13px] font-black btn-press"
                        >
                          예약 취소
                        </button>
                      )}

                      {isReservationCompletable(item.status) && (
                        <button
                          onClick={() => openCompleteModal(item.reservationId)}
                          disabled={isMutating}
                          className="flex-1 h-12 bg-main text-white rounded-[18px] text-[13px] font-black shadow-lg shadow-main/20 btn-press"
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
                          className="flex-1 h-12 bg-main text-white rounded-[18px] text-[13px] font-black shadow-lg shadow-main/20 btn-press"
                        >
                          리뷰 작성
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
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
              {activeTab === "upcoming"
                ? "진행 중인 예약이 없습니다"
                : "지난 이용 내역이 없습니다"}
            </h3>
            <p className="text-gray-400 text-[13px] font-bold text-center leading-relaxed mb-10">
              MZTK 마켓에서 몸짱이 될 수 있는
              <br />
              다양한 운동 클래스를 찾아보세요.
            </p>
            <button
              onClick={() => navigate("/market")}
              className="px-10 py-4.5 bg-gray-900 text-white font-black text-[14px] rounded-[22px] shadow-xl shadow-gray-900/20 btn-press"
            >
              운동 클래스 보러 가기
            </button>
          </div>
        )}

        {!isLoading && hasNext && (
          <button
            onClick={() => void loadReservations(nextCursor || undefined)}
            disabled={isFetchingNext}
            className="w-full h-14 bg-white border border-gray-100 rounded-2xl text-[14px] font-black text-gray-400 btn-press shadow-sm mt-4"
          >
            {isFetchingNext ? "내역 로딩 중..." : "이전 예약 더 보기"}
          </button>
        )}
      </div>

      {/* Reservation Detail Modal */}
      {selectedDetail && (
        <CommonModal
          title="예약 상세 정보"
          desc="블록체인에 안전하게 기록된 정보입니다."
          confirmLabel="확인"
          onConfirmClick={() => setSelectedDetail(null)}
        >
          <div className="w-full mt-6 text-left flex flex-col gap-6">
            <div className="bg-[#F9FAFB] rounded-[28px] p-6 border border-gray-100 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Selected Program
                </span>
                <p className="text-[15px] font-black text-gray-900">
                  클래스 예약 #{selectedDetail.slotId}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Exercise Schedule
                </span>
                <p className="text-[15px] font-black text-gray-900">
                  {formatDate(selectedDetail.reservationDate)}{" "}
                  {formatTime(selectedDetail.reservationTime)}
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Current Status
                </span>
                <p className="text-[15px] font-black text-main">
                  {getReservationStatusLabel(selectedDetail.status)}
                </p>
              </div>

              {selectedDetail.userRequest && (
                <div className="pt-4 border-t border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    My Request
                  </span>
                  <p className="text-[13px] font-bold text-gray-600 leading-relaxed italic mt-2 bg-white p-4 rounded-2xl border border-gray-50 shadow-inner">
                    "{selectedDetail.userRequest}"
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  On-Chain Evidence
                </span>
                <p className="text-[10px] font-bold text-gray-500 break-all bg-white p-3 rounded-xl border border-gray-100 mt-2 shadow-inner font-mono leading-relaxed">
                  {selectedDetail.txHash ||
                    "아직 온체인 기록이 생성되지 않았습니다."}
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
