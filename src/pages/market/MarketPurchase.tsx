import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CommonButton } from "@components/common";
import { SimpleHeader } from "@components/layout";
import {
  createClassReservation,
  getClassReservationInfo,
  getMarketplaceClassDetail,
} from "@services";
import type {
  AvailableReservationDate,
  AvailableReservationTime,
} from "@services";

const DAY_LABEL_MAP = ["일", "월", "화", "수", "목", "금", "토"];

const getDayLabel = (date: string) =>
  DAY_LABEL_MAP[new Date(`${date}T00:00:00`).getDay()];

const getMonthDateLabel = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  return `${parsed.getMonth() + 1}/${parsed.getDate()}`;
};

const formatTime = (time: string) => time.slice(0, 5);

const DEV_SIGNATURE_STUB = `0x${"0".repeat(130)}`;

const getReservationSignatures = () => {
  // TODO: replace this with the real EIP-7702 signing flow when the Web3 adapter is no longer stubbed.
  return {
    delegationSignature: DEV_SIGNATURE_STUB,
    executionSignature: DEV_SIGNATURE_STUB,
  };
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
  const [loadError, setLoadError] = useState("");
  const [selectedDate, setSelectedDate] =
    useState<AvailableReservationDate | null>(null);
  const [selectedTime, setSelectedTime] =
    useState<AvailableReservationTime | null>(null);
  const [requestMsg, setRequestMsg] = useState("");

  useEffect(() => {
    const classId = Number(id);
    if (!Number.isFinite(classId)) {
      setLoadError("클래스를 찾을 수 없습니다.");
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

        if (!isMounted) return;

        setData(detailResponse);
        setReservationInfo(reservationInfoResponse);
        setLoadError("");
      } catch (error) {
        console.error("Failed to load class for purchase", error);
        if (!isMounted) return;
        setLoadError("구매할 클래스 정보를 불러오지 못했습니다.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
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
      alert("예약 날짜와 시간을 모두 선택해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      const signatures = getReservationSignatures();

      await createClassReservation(classId, {
        slotId: selectedTime.slotId,
        reservationDate: selectedDate.date,
        reservationTime: selectedTime.startTime,
        userRequest: requestMsg.trim() || undefined,
        signedAmount: reservationInfo.priceAmount,
        ...signatures,
      });

      alert("예약 요청이 완료되었습니다.");
      navigate("/market/reservations");
    } catch (error) {
      console.error("Failed to create reservation", error);
      alert("예약 요청을 처리하지 못했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-10 text-center text-gray-400">
        구매 정보를 불러오는 중입니다...
      </div>
    );
  }

  if (loadError || !data || !reservationInfo) {
    return (
      <div className="p-10 text-center">
        {loadError || "클래스를 찾을 수 없습니다."}
      </div>
    );
  }

  const renderTimeButtons = () => {
    if (!selectedDate) {
      return (
        <div className="h-[120px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-400 text-[14px] font-medium">
            먼저 날짜를 선택해 주세요.
          </p>
        </div>
      );
    }

    if (selectedDate.availableTimes.length === 0) {
      return (
        <div className="h-[120px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-400 text-[14px] font-medium">
            예약 가능한 시간이 없습니다.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 w-full">
        {selectedDate.availableTimes.map((time) => {
          const isSelected = selectedTime?.slotId === time.slotId;
          const disabled = time.availableCapacity <= 0;

          return (
            <button
              key={`${time.slotId}-${time.startTime}`}
              disabled={disabled}
              onClick={() => {
                if (!disabled) {
                  setSelectedTime(time);
                }
              }}
              className={`flex flex-col items-center justify-center py-[7px] min-h-[50px] rounded-lg transition-all ${
                disabled
                  ? "bg-gray-100 text-gray-300 border border-transparent cursor-not-allowed"
                  : isSelected
                    ? "bg-main text-white shadow-md border border-main"
                    : "bg-[#FFF9EE] text-main border border-[#FAD390] hover:bg-main/10"
              }`}
            >
              <span className="text-[12px] sm:text-[14px] font-bold">
                {formatTime(time.startTime)}
              </span>
              <span
                className={`text-[9px] sm:text-[10px] mt-0.5 leading-none ${
                  isSelected ? "text-white/90" : "text-main/80"
                }`}
              >
                잔여 {time.availableCapacity}명
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-screen">
      <SimpleHeader />

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-32 flex flex-col gap-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
          <span className="text-main font-bold text-xs">
            {data.store?.storeName ?? `Trainer #${data.trainerId}`}
          </span>
          <h2 className="text-[17px] font-bold text-gray-900 leading-snug">
            {reservationInfo.classTitle}
          </h2>
          <div className="h-[1px] bg-gray-100 w-full my-1"></div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-gray-500 text-sm font-medium">
              1회권 구매 비용
            </span>
            <div className="flex items-center gap-1">
              <div className="w-[18px] h-[18px] rounded-full bg-main flex items-center justify-center text-white text-[10px] font-bold">
                MZTK
              </div>
              <span className="font-bold text-[18px] text-gray-900 leading-none">
                {reservationInfo.priceAmount}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-[16px] font-bold text-gray-900">
            1. 예약 날짜 <span className="text-red-500">*</span>
          </h3>
          {availableDates.length > 0 ? (
            <div className="grid grid-cols-7 gap-1.5 w-full">
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
                    className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
                      disabled
                        ? "bg-gray-100 text-gray-300 border border-transparent cursor-not-allowed"
                        : isSelected
                          ? "bg-main text-white shadow-md shadow-main/20 border border-transparent"
                          : "bg-white text-gray-600 border border-gray-200 cursor-pointer hover:border-main/50"
                    }`}
                  >
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold mb-0.5 ${
                        disabled
                          ? "text-gray-300"
                          : isSelected
                            ? "text-white/80"
                            : "text-gray-400"
                      }`}
                    >
                      {getDayLabel(dateInfo.date)}
                    </span>
                    <span
                      className={`text-[13px] sm:text-[14px] font-bold tabular-nums leading-none tracking-tight ${
                        disabled ? "text-gray-300" : ""
                      }`}
                    >
                      {getMonthDateLabel(dateInfo.date)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="h-[96px] flex items-center justify-center rounded-xl border border-gray-100 bg-white text-[14px] font-medium text-gray-400">
              예약 가능한 날짜가 없습니다.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 min-h-[140px]">
          <h3 className="text-[16px] font-bold text-gray-900 flex justify-between items-center">
            <div>
              2. 방문 시간 <span className="text-red-500">*</span>
            </div>
            {selectedDate && (
              <span className="text-[12px] text-gray-400 font-medium">
                ({getDayLabel(selectedDate.date)}요일 예약 가능 시간)
              </span>
            )}
          </h3>
          {renderTimeButtons()}
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-[16px] font-bold text-gray-900">
            3. 요청사항{" "}
            <span className="text-gray-400 text-[13px] font-medium">
              (선택)
            </span>
          </h3>
          <textarea
            value={requestMsg}
            onChange={(e) => setRequestMsg(e.target.value)}
            placeholder="예) 허리 통증이 있어 강도를 조절하고 싶어요."
            className="w-full h-[100px] bg-white border border-gray-200 rounded-xl p-4 text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-main focus:ring-1 focus:ring-main/20 resize-none transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="fixed bottom-0 max-w-[450px] w-full bg-white px-5 py-4 flex flex-col gap-3 border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] z-50 rounded-t-2xl">
        <CommonButton
          label={
            isSubmitting
              ? "예약 요청 중..."
              : `총 ${reservationInfo.priceAmount} MZTK 결제 및 예약 확정`
          }
          onClick={handlePurchase}
          disabled={!selectedDate || !selectedTime || isSubmitting}
          className={`h-[56px] rounded-xl font-bold text-[16px] ${
            selectedDate && selectedTime && !isSubmitting ? "" : "opacity-50"
          }`}
        />
      </div>
    </div>
  );
};

export default MarketPurchase;
