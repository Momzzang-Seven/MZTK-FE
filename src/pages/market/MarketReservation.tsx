import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { CommonModal } from "@components/common";
import {
  getReservationStatusLabel,
  isReservationCancellable,
  isReservationCompletable,
  isReservationPast,
  RESERVATION_STATUS,
  type ReservationStatus,
} from "@constant/reservation";
import {
  cancelMyReservation,
  completeMyReservation,
  getMyReservations,
  getReservationDetail,
} from "@services";
import type {
  ReservationDetail,
  ReservationSummary,
  ReservationTime,
} from "@services";
import type { Web3Execution } from "@types";

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00`));

const formatTime = (time: ReservationTime | string | null | undefined) => {
  if (!time) return "--:--";
  if (typeof time === "string") return time.slice(0, 5);
  const hh = String(time.hour ?? 0).padStart(2, "0");
  const mm = String(time.minute ?? 0).padStart(2, "0");
  return `${hh}:${mm}`;
};

const formatPrice = (price: number) => {
  return `${new Intl.NumberFormat("ko-KR").format(price)} MZTK`;
};

const getStatusBadgeStyles = (status: ReservationSummary["status"]) => {
  switch (status) {
    case RESERVATION_STATUS.PENDING:
      return "bg-amber-50 text-amber-600 border-amber-100";
    case RESERVATION_STATUS.APPROVED:
      return "bg-main/5 text-main border-main/10";
    case RESERVATION_STATUS.SETTLED:
    case RESERVATION_STATUS.AUTO_SETTLED:
      return "bg-orange-50 text-orange-700 border-orange-100";
    case RESERVATION_STATUS.USER_CANCELLED:
    case RESERVATION_STATUS.REJECTED:
    case RESERVATION_STATUS.TIMEOUT_CANCELLED:
      return "bg-gray-100 text-gray-400 border-gray-200";
    default:
      return "bg-gray-50 text-gray-400 border-gray-100";
  }
};

const isReservationWeb3Blocked = (
  reservation: Pick<ReservationSummary, "web3Execution">
) =>
  reservation.web3Execution?.recoveryStatus === "ONCHAIN_UNCERTAIN" ||
  reservation.web3Execution?.retryAllowed === false;

const Web3PendingNotice = () => (
  <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 rounded-2xl border border-amber-100">
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#D97706"
      strokeWidth="3"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
    <span className="text-[11px] font-black text-amber-700 leading-relaxed">
      블록체인 결과 확인이 지연되어 취소, 완료, 환불 작업을 잠시 제한합니다.
    </span>
  </div>
);

type ReservationTab = "active" | "history";

const MarketReservation = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ReservationTab>("active");
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
    variant?: "warning" | "error" | "info" | "success";
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

      const response = await getMyReservations(undefined, cursor);
      const newReservations = response.reservations ?? [];

      if (!cursor) setReservations(newReservations);
      else setReservations((prev) => [...prev, ...newReservations]);

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

  const filteredReservations = useMemo(() => {
    const filtered = (reservations ?? []).filter((r) => {
      const isPast = isReservationPast(r.status);
      return activeTab === "active" ? !isPast : isPast;
    });

    return filtered.sort((a, b) => {
      const getTimeStr = (res: ReservationSummary) => {
        const date = res.reservationDate;
        const time = res.reservationTime;
        let timeStr = "00:00";

        if (time && typeof time === "object" && "hour" in time) {
          timeStr = `${String(time.hour ?? 0).padStart(2, "0")}:${String(time.minute ?? 0).padStart(2, "0")}`;
        }
        return `${date}T${timeStr}`;
      };

      const timeA = getTimeStr(a);
      const timeB = getTimeStr(b);

      if (activeTab === "active") {
        return timeA.localeCompare(timeB); // Earlier first
      } else {
        return timeB.localeCompare(timeA); // Latest first
      }
    });
  }, [activeTab, reservations]);

  const closeModal = () =>
    setModal((prev) => ({ ...prev, isOpen: false, onConfirm: undefined }));

  const openAlert = (
    title: string,
    desc: string,
    variant: "info" | "success" | "error" = "info"
  ) => {
    setModal({
      isOpen: true,
      title,
      desc,
      confirmLabel: "확인",
      variant,
      onConfirm: closeModal,
    });
  };

  const openReservationWeb3 = (
    intent: Web3Execution,
    reservationId: number
  ) => {
    navigate(`/verify-wallet/${intent.resource.type}/${reservationId}`, {
      state: {
        intent,
        recoveryScope: "member",
        returnTo: "/market/reservations",
      },
    });
  };

  const isWeb3Signable = (intent?: Web3Execution | null) =>
    !!intent &&
    (intent.executionIntent.status === "AWAITING_SIGNATURE" ||
      intent.viewerCanExecute === true ||
      intent.viewerCanRecover === true) &&
    intent.retryAllowed !== false &&
    intent.recoveryStatus !== "ONCHAIN_UNCERTAIN";

  const handleDetailClick = async (reservationId: number) => {
    try {
      const detail = await getReservationDetail(reservationId);
      setSelectedDetail(detail);
    } catch {
      openAlert("예약 상세", "상세 정보를 불러오지 못했습니다.", "error");
    }
  };

  const handleCancelClick = (reservationId: number) => {
    setModal({
      isOpen: true,
      title: "예약 취소",
      desc: "수업 예약을 취소하시겠습니까?<br/>취소 시 규정에 따라 환불 및 토큰 반환이 진행됩니다.",
      confirmLabel: isMutating ? "처리 중..." : "예약 취소",
      cancelLabel: "유지하기",
      variant: "warning",
      onConfirm: async () => {
        closeModal();
        try {
          setIsMutating(true);
          const response = await cancelMyReservation(reservationId);
          if (response.web3) {
            openReservationWeb3(response.web3, response.reservationId);
            return;
          }
          await loadReservations();
          openAlert(
            "취소 완료",
            "예약이 성공적으로 취소되었습니다.",
            "success"
          );
        } catch {
          openAlert("취소 실패", "예약 취소 중 오류가 발생했습니다.", "error");
        } finally {
          setIsMutating(false);
        }
      },
    });
  };

  const handleCompleteClick = (reservationId: number) => {
    setModal({
      isOpen: true,
      title: "수업 완료 확인",
      desc: "수업이 성공적으로 완료되었나요?<br/>완료 확인 시 트레이너에게 정산이 진행됩니다.",
      confirmLabel: isMutating ? "처리 중..." : "완료 확인",
      cancelLabel: "취소",
      variant: "success",
      onConfirm: async () => {
        closeModal();
        try {
          setIsMutating(true);
          const response = await completeMyReservation(reservationId);
          if (response.web3) {
            openReservationWeb3(response.web3, response.reservationId);
            return;
          }
          await loadReservations();
          openAlert("처리 완료", "수업 완료가 확인되었습니다.", "success");
        } catch {
          openAlert("처리 실패", "완료 확인 중 오류가 발생했습니다.", "error");
        } finally {
          setIsMutating(false);
        }
      },
    });
  };

  const renderTabButton = (tab: ReservationTab, label: string) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        className={`flex-1 py-4 text-[14px] font-black transition-all relative ${
          isActive ? "text-gray-900" : "text-gray-400"
        }`}
      >
        <span className="relative z-10">{label}</span>
        {isActive && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-[4px] bg-main rounded-full animate-in zoom-in-50 duration-300" />
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#F8F9FA] font-pretendard relative">
      {/* Sticky Back Button Wrapper */}
      <div className="sticky top-6 z-[100] px-6 h-0 pointer-events-none">
        <button
          onClick={() => navigate("/my")}
          className="w-12 h-12 bg-white/80 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-white/50 active:scale-95 transition-all pointer-events-auto"
        >
          <ChevronLeft size={26} className="text-gray-900" />
        </button>
      </div>

      <div className="px-6 pt-24 pb-4">
        <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">
          예약 및 이용 내역
        </h1>
        <p className="text-[14px] font-bold text-gray-400 mt-2">
          신청하신 수업의 상태와 일정을 확인하세요.
        </p>
      </div>

      {/* Premium Glass Tabs */}
      <div className="sticky top-0 z-30 bg-[#F8F9FA]/80 backdrop-blur-md border-b border-gray-100/50 flex px-2">
        {renderTabButton("active", "진행 중")}
        {renderTabButton("history", "지난 내역")}
      </div>

      <div className="flex-1 px-5 py-8 pb-32 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {loadError && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-[13px] font-black">
            {loadError}
          </div>
        )}

        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-main/20 border-t-main rounded-full animate-spin" />
            <p className="text-[13px] font-bold text-gray-300">
              내역 불러오는 중...
            </p>
          </div>
        ) : filteredReservations.length > 0 ? (
          filteredReservations.map((item) => {
            const isCancelled = (
              [
                RESERVATION_STATUS.USER_CANCELLED,
                RESERVATION_STATUS.REJECTED,
                RESERVATION_STATUS.TIMEOUT_CANCELLED,
              ] as ReservationStatus[]
            ).includes(item.status as ReservationStatus);
            const isWeb3Blocked = isReservationWeb3Blocked(item);

            return (
              <div
                key={item.reservationId}
                className={`bg-white rounded-[28px] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all active:scale-[0.99] ${
                  isCancelled ? "opacity-60 grayscale-[0.5]" : ""
                }`}
              >
                <div className="p-6">
                  {/* Header: Status & Time */}
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-black ${getStatusBadgeStyles(item.status)}`}
                    >
                      {getReservationStatusLabel(item.status)}
                    </div>
                    <div className="text-right">
                      <p className="text-[14px] font-black text-gray-900">
                        {formatDate(item.reservationDate)}
                      </p>
                      <p
                        className={`text-[12px] font-bold mt-0.5 ${isCancelled ? "text-gray-400" : "text-main"}`}
                      >
                        {formatTime(item.reservationTime)} (
                        {item.durationMinutes}분 수업)
                      </p>
                    </div>
                  </div>

                  {/* Body: Program & Trainer Info */}
                  <div className="flex flex-col gap-4 mb-6">
                    <div>
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest block mb-1">
                        PROGRAM
                      </span>
                      <h3
                        className={`text-[18px] font-black text-gray-900 leading-tight ${isCancelled ? "line-through text-gray-400" : ""}`}
                      >
                        {item.classTitle || "PT/필라테스 프로그램"}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-gray-100">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#D1D5DB"
                            strokeWidth="2.5"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                            TRAINER
                          </p>
                          <p className="text-[14px] font-black text-gray-700">
                            @{item.trainerNickname}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                          PRICE
                        </p>
                        <p className="text-[14px] font-black text-main">
                          {formatPrice(item.priceAmount || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* User Request Preview */}
                  {item.userRequest && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 relative">
                      <div className="absolute -left-1 top-0 text-main/10 text-3xl font-serif">
                        "
                      </div>
                      <p className="text-[12px] font-bold text-gray-500 leading-relaxed pl-3 italic line-clamp-1">
                        {item.userRequest}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-3 pt-5 border-t border-gray-50">
                    {isWeb3Blocked && <Web3PendingNotice />}
                    {isWeb3Signable(item.web3Execution) && (
                      <button
                        onClick={() =>
                          openReservationWeb3(
                            item.web3Execution as Web3Execution,
                            item.reservationId
                          )
                        }
                        className="w-full h-12 bg-main text-white rounded-xl text-[13px] font-black transition-all active:scale-95"
                      >
                        블록체인 서명 계속하기
                      </button>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDetailClick(item.reservationId)}
                        className="flex-1 h-12 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-xl text-[13px] font-black transition-all"
                      >
                        상세 정보
                      </button>
                      {isReservationCancellable(item.status) &&
                        !isWeb3Blocked && (
                          <button
                            onClick={() =>
                              handleCancelClick(item.reservationId)
                            }
                            disabled={isMutating}
                            className="flex-1 h-12 bg-gray-50 hover:bg-gray-100 text-red-500 rounded-xl text-[13px] font-black transition-all"
                          >
                            예약 취소
                          </button>
                        )}
                    </div>
                    {isReservationCompletable(item.status) &&
                      !isWeb3Blocked &&
                      (() => {
                        const resTime = item.reservationTime;
                        const resDate = item.reservationDate;

                        let timeStr = "00:00:00";
                        if (
                          resTime &&
                          typeof resTime === "object" &&
                          "hour" in resTime
                        ) {
                          timeStr = `${String(resTime.hour ?? 0).padStart(2, "0")}:${String(resTime.minute ?? 0).padStart(2, "0")}:00`;
                        }

                        const resDateTime = new Date(`${resDate}T${timeStr}`);
                        const duration = item.durationMinutes ?? 0;
                        const resEndTime = new Date(
                          resDateTime.getTime() + duration * 60 * 1000
                        );
                        const now = new Date();
                        const canComplete =
                          !isNaN(resEndTime.getTime()) && now >= resEndTime;

                        const formatEndTime = (date: Date) => {
                          return date.toLocaleTimeString("ko-KR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });
                        };

                        return (
                          <div className="flex flex-col gap-2">
                            {!canComplete && (
                              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="#F59E0B"
                                  strokeWidth="3"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                <span className="text-[11px] font-black text-amber-600 italic">
                                  수업 종료({formatEndTime(resEndTime)}) 이후
                                  완료 가능합니다.
                                </span>
                              </div>
                            )}
                            <button
                              onClick={() =>
                                handleCompleteClick(item.reservationId)
                              }
                              disabled={isMutating || !canComplete}
                              className={`w-full h-14 rounded-2xl text-[15px] font-black transition-all flex items-center justify-center gap-2 ${
                                canComplete
                                  ? "bg-main text-white shadow-[0_12px_24px_rgba(255,107,0,0.25)] active:scale-95 cursor-pointer"
                                  : "bg-gray-100 text-gray-300 cursor-not-allowed"
                              }`}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              수업 완료 확인하기
                            </button>
                          </div>
                        );
                      })()}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-28 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-white shadow-xl flex items-center justify-center mb-8">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="2.5"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
            </div>
            <h3 className="font-black text-gray-900 text-[19px] mb-3">
              내역이 없습니다
            </h3>
            <p className="text-gray-400 text-[14px] font-bold text-center">
              {activeTab === "active"
                ? "현재 진행 중인 예약이 없습니다.\n마켓에서 새로운 수업을 찾아보세요!"
                : "과거 이용 내역이 없습니다."}
            </p>
          </div>
        )}

        {!isLoading && hasNext && (
          <button
            onClick={() => void loadReservations(nextCursor || undefined)}
            disabled={isFetchingNext}
            className="w-full h-14 bg-white border border-gray-100 rounded-2xl text-[14px] font-black text-gray-400 mt-4 shadow-sm"
          >
            {isFetchingNext ? "로딩 중..." : "내역 더 보기"}
          </button>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDetail && (
        <CommonModal
          title="상세 예약 정보"
          desc="신청하신 예약의 세부 내역입니다."
          confirmLabel="확인"
          onConfirmClick={() => setSelectedDetail(null)}
        >
          <div className="w-full mt-6 text-left flex flex-col gap-4">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex flex-col gap-4">
              <DetailRow
                label="프로그램"
                value={selectedDetail.classTitle || "PT/필라테스"}
              />
              <DetailRow
                label="담당 트레이너"
                value={`@${selectedDetail.trainerNickname}`}
              />
              <DetailRow
                label="수업 일정"
                value={`${formatDate(selectedDetail.reservationDate)} ${formatTime(selectedDetail.reservationTime)} (${selectedDetail.durationMinutes}분 수업)`}
              />
              <DetailRow
                label="결제 금액"
                value={formatPrice(selectedDetail.priceAmount || 0)}
                highlight
              />
              <DetailRow
                label="상태"
                value={getReservationStatusLabel(selectedDetail.status)}
                highlight
              />
              {isReservationWeb3Blocked(selectedDetail) && (
                <Web3PendingNotice />
              )}
              <div className="pt-4 border-t border-gray-200">
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                  Transaction Hash
                </span>
                <p className="text-[11px] font-medium text-gray-400 break-all bg-white p-3 rounded-lg border border-gray-100 mt-2 font-mono">
                  {selectedDetail.txHash || "기록된 해시가 없습니다."}
                </p>
              </div>
            </div>
          </div>
        </CommonModal>
      )}

      {/* Confirmation Modals */}
      {modal.isOpen && (
        <CommonModal
          title={modal.title}
          desc={modal.desc}
          confirmLabel={modal.confirmLabel}
          onConfirmClick={modal.onConfirm}
          cancelLabel={modal.cancelLabel}
          onCancelClick={closeModal}
          variant={modal.variant}
        />
      )}
    </div>
  );
};

const DetailRow = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
      {label}
    </span>
    <p
      className={`text-[15px] font-black ${highlight ? "text-main" : "text-gray-800"}`}
    >
      {value}
    </p>
  </div>
);

export default MarketReservation;
