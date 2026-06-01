import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { CommonButton, CommonModal } from "@components/common";
import { getKoreanErrorMessage } from "@constant";
import axios from "axios";
import {
  createClassReservation,
  getClassReservationInfo,
  getMarketplaceClassDetail,
} from "@services";
import { parseAmount } from "@utils";
import type {
  AvailableReservationDate,
  AvailableReservationTime,
} from "@services";

const DAY_LABEL_MAP = ["일", "월", "화", "수", "목", "금", "토"];

const getDayLabel = (date: string) =>
  DAY_LABEL_MAP[new Date(`${date}T00:00:00`).getDay()];

const getMonthDateLabel = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  return `${parsed.getMonth() + 1}.${parsed.getDate()}`;
};

const formatTime = (time: string) => time.slice(0, 5);

const createReservationIdempotencyKey = (
  classId: number,
  slotId: number,
  reservationDate: string,
  reservationTime: string
) => {
  const nonce =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `reservation:${classId}:${slotId}:${reservationDate}:${reservationTime}:${nonce}`;
};

const MarketPurchase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Awaited<
    ReturnType<typeof getMarketplaceClassDetail>
  > | null>(null);
  const [reservationInfo, setReservationInfo] = useState<Awaited<
    ReturnType<typeof getClassReservationInfo>
  > | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] =
    useState<AvailableReservationDate | null>(null);
  const [selectedTime, setSelectedTime] =
    useState<AvailableReservationTime | null>(null);
  const [requestMsg, setRequestMsg] = useState("");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
    variant?: "success" | "error" | "warning" | "info";
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    desc: "",
  });
  useEffect(() => {
    const classId = Number(id);
    if (!Number.isFinite(classId)) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const loadDetail = async () => {
      try {
        setIsLoading(true);
        const [detailResponse, reservationInfoResponse] = await Promise.all([
          getMarketplaceClassDetail(classId),
          getClassReservationInfo(classId),
        ]);
        if (isMounted) {
          setData(detailResponse);
          setReservationInfo(reservationInfoResponse);
        }
      } catch {
        if (isMounted) {
          setModalState({
            isOpen: true,
            title: "정보 로드 실패",
            desc: "클래스 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.",
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void loadDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const availableDates = useMemo(
    () =>
      reservationInfo?.availableDates.map((dateInfo) => ({
        ...dateInfo,
        isAvailable: dateInfo.availableTimes.some(
          (time) => time.availableCapacity > 0
        ),
      })) ?? [],
    [reservationInfo]
  );

  const handlePurchase = async () => {
    const classId = Number(id);
    if (
      !Number.isFinite(classId) ||
      !selectedDate ||
      !selectedTime ||
      !reservationInfo
    ) {
      setModalState({
        isOpen: true,
        title: "예약 오류",
        desc: "날짜와 시간을 모두 선택해 주세요.",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await createClassReservation(classId, {
        slotId: selectedTime.slotId,
        reservationDate: selectedDate.date,
        reservationTime: selectedTime.startTime,
        userRequest: requestMsg.trim() || undefined,
        idempotencyKey: createReservationIdempotencyKey(
          classId,
          selectedTime.slotId,
          selectedDate.date,
          selectedTime.startTime
        ),
        signedAmount: parseAmount(
          String(reservationInfo.priceAmount)
        ).toString(),
      });

      if (response.web3) {
        navigate(
          `/verify-wallet/${response.web3.resource.type}/${response.reservationId}`,
          {
            state: {
              intent: response.web3,
              recoveryScope: "member",
              returnTo: "/market/reservations",
            },
          }
        );
        return;
      }

      // Show success modal
      setModalState({
        isOpen: true,
        title: "예약 성공!",
        desc: "수업 예약이 성공적으로 완료되었습니다.<br/>트레이너의 승인을 기다려 주세요.",
        variant: "success",
        onConfirm: () => navigate("/market/reservations"),
      });
    } catch (error) {
      const axiosError = axios.isAxiosError(error) ? error : null;
      const code = axiosError?.response?.data?.code;
      const message = axiosError?.response?.data?.message;
      setModalState({
        isOpen: true,
        title: "결제 실패",
        desc:
          getKoreanErrorMessage(code, message) ||
          "예약 요청을 처리하지 못했습니다. 다시 시도해 주세요.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-[#FDFDFD] min-h-dvh items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-main/20 border-t-main rounded-full animate-spin" />
        <p className="text-[13px] font-black text-gray-300">
          결제 정보를 준비 중입니다...
        </p>
      </div>
    );
  }

  // 데이터가 없을 때의 기본 빈 상태 (모달이 띄워질 것임)
  if (!data || !reservationInfo) {
    return (
      <div className="flex flex-col h-full bg-[#FDFDFD] min-h-dvh relative">
        <button
          onClick={() => navigate(-1)}
          className="fixed top-6 left-6 z-[100] w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl shadow-gray-200/40 border border-gray-100/50"
        >
          <ChevronLeft size={26} className="text-gray-900" />
        </button>
        {modalState.isOpen && (
          <CommonModal
            title={modalState.title}
            desc={modalState.desc}
            confirmLabel="확인"
            onConfirmClick={() => {
              setModalState({ ...modalState, isOpen: false });
              navigate(-1);
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#FDFDFD] min-h-dvh relative">
      {/* Floating Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-[100] w-12 h-12 bg-white/90 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl shadow-gray-200/40 border border-gray-100/50 cursor-pointer active:scale-95 transition-all group"
      >
        <ChevronLeft
          size={26}
          className="text-gray-900 group-hover:text-main transition-colors"
        />
      </button>

      <div className="flex-1 overflow-y-auto px-5 pt-24 pb-40 flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* 1. Summary Card */}
        <section className="bg-white rounded-[28px] p-7 shadow-2xl shadow-gray-200/40 border border-gray-50 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <span className="text-main text-[11px] font-black uppercase tracking-widest">
              Selected Class
            </span>
            <h2 className="text-[19px] font-black text-gray-900 leading-tight">
              {reservationInfo.classTitle}
            </h2>
          </div>
          <div className="h-px bg-gray-50" />
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                Trainer
              </span>
              <span className="text-[14px] font-bold text-gray-800">
                {data.store?.storeName ?? `Trainer #${data.trainerId}`}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                Price
              </span>
              <div className="flex items-center gap-1">
                <span className="font-black text-[20px] text-gray-900 tabular-nums leading-none">
                  {reservationInfo.priceAmount.toLocaleString()}
                </span>
                <span className="text-[12px] font-black text-main">MZTK</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Date Selection */}
        <section className="flex flex-col gap-5">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-4 bg-main rounded-full" />
            <h3 className="text-[15px] font-black text-gray-900 tracking-tight">
              예약 날짜 선택
            </h3>
          </div>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2">
            {availableDates.map((dateInfo) => {
              const isSelected = selectedDate?.date === dateInfo.date;
              const disabled = !dateInfo.isAvailable;
              return (
                <button
                  key={dateInfo.date}
                  disabled={disabled}
                  onClick={() => {
                    if (disabled) return;
                    setSelectedDate(dateInfo);
                    setSelectedTime(null);
                  }}
                  className={`flex flex-col items-center justify-center min-w-[64px] h-[80px] rounded-[22px] transition-all duration-300 border ${
                    disabled
                      ? "bg-gray-50 text-gray-200 border-gray-50 opacity-40 cursor-not-allowed"
                      : isSelected
                        ? "bg-main text-white border-main shadow-xl shadow-main/20 scale-105"
                        : "bg-white text-gray-400 border-gray-100 hover:border-main/30"
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-tight mb-1">
                    {getDayLabel(dateInfo.date)}
                  </span>
                  <span className="text-[16px] font-black tabular-nums">
                    {getMonthDateLabel(dateInfo.date)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. Time Selection */}
        <section className="flex flex-col gap-5 min-h-[160px]">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-main rounded-full" />
              <h3 className="text-[15px] font-black text-gray-900 tracking-tight">
                방문 시간 선택
              </h3>
            </div>
            {selectedDate && (
              <span className="text-[11px] text-gray-300 font-black uppercase tracking-tight">
                {getDayLabel(selectedDate.date)}요일 예약
              </span>
            )}
          </div>
          {!selectedDate ? (
            <div className="h-28 flex items-center justify-center rounded-[26px] bg-gray-50/50 border border-dashed border-gray-100 px-10">
              <p className="text-gray-300 text-[13px] font-bold text-center leading-relaxed">
                날짜를 먼저 선택하시면
                <br />
                예약 가능한 시간이 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2.5">
              {selectedDate.availableTimes.map((time) => {
                const isSelected = selectedTime?.slotId === time.slotId;
                const disabled = time.availableCapacity <= 0;
                return (
                  <button
                    key={time.slotId}
                    disabled={disabled}
                    onClick={() => setSelectedTime(time)}
                    className={`flex flex-col items-center justify-center h-14 rounded-2xl transition-all border ${
                      disabled
                        ? "bg-gray-50 text-gray-200 border-gray-50"
                        : isSelected
                          ? "bg-gray-900 text-white border-gray-900 shadow-lg"
                          : "bg-white text-gray-600 border-gray-100 hover:border-main/30"
                    }`}
                  >
                    <span className="text-[13px] font-black">
                      {formatTime(time.startTime)}
                    </span>
                    <span
                      className={`text-[9px] font-bold mt-0.5 ${isSelected ? "text-white/60" : "text-gray-300"}`}
                    >
                      잔여 {time.availableCapacity}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* 4. Requests */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
            <div className="w-1 h-4 bg-main rounded-full" />
            <h3 className="text-[15px] font-black text-gray-900 tracking-tight">
              트레이너에게 요청사항
              <span className="text-gray-300 ml-2 text-[12px] font-bold">
                선택
              </span>
            </h3>
          </div>
          <textarea
            value={requestMsg}
            onChange={(e) => setRequestMsg(e.target.value)}
            placeholder="예) 허리 통증이 있어 강도를 조절하고 싶어요."
            className="w-full h-32 bg-white border border-gray-100 rounded-[22px] p-5 text-[14px] font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-main/30 transition-all shadow-sm resize-none leading-relaxed"
          />
        </section>
      </div>

      {/* Floating Checkout Footer */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 max-w-[450px] w-full bg-white/90 backdrop-blur-xl px-6 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom))] flex flex-col gap-4 border-t border-gray-100/50 shadow-[0_-15px_40px_rgba(0,0,0,0.06)] z-50 rounded-t-[32px]">
        <CommonButton
          label={
            isSubmitting
              ? "처리 중..."
              : `총 ${reservationInfo.priceAmount.toLocaleString()} MZTK 결제하기`
          }
          onClick={handlePurchase}
          disabled={!selectedDate || !selectedTime || isSubmitting}
          className="h-[60px] rounded-[22px] font-black text-[16px] shadow-xl shadow-main/20 active:scale-95 transition-all"
        />
      </div>

      {modalState.isOpen && (
        <CommonModal
          title={modalState.title}
          desc={modalState.desc}
          confirmLabel="확인"
          variant={modalState.variant}
          onConfirmClick={() => {
            if (modalState.onConfirm) modalState.onConfirm();
            setModalState({ ...modalState, isOpen: false });
          }}
        />
      )}
    </div>
  );
};

export default MarketPurchase;
