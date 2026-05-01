import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CommonButton } from "@components/common";
import { SimpleHeader } from "@components/layout";
import { getMarketplaceClassDetail } from "@services";

const DAY_LABEL_MAP: Record<number, string> = {
    0: "일",
    1: "월",
    2: "화",
    3: "수",
    4: "목",
    5: "금",
    6: "토",
};

const DAY_ORDER = ["월", "화", "수", "목", "금", "토", "일"];

const MarketPurchase = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState<Awaited<ReturnType<typeof getMarketplaceClassDetail>> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [selectedDateObj, setSelectedDateObj] = useState<{ full: string; day: string } | null>(null);
    const [selectedTime, setSelectedTime] = useState("");
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
                const response = await getMarketplaceClassDetail(classId);

                if (!isMounted) return;

                setData(response);
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

    const operatingTimes = useMemo(() => {
        if (!data) return {} as Record<string, string[]>;

        return data.classTimes.reduce<Record<string, string[]>>((acc, classTime) => {
            const normalizedTime = classTime.startTime.slice(0, 5);
            classTime.daysOfWeek.forEach((apiDay) => {
                const day = apiDay === "MONDAY"
                    ? "월"
                    : apiDay === "TUESDAY"
                        ? "화"
                        : apiDay === "WEDNESDAY"
                            ? "수"
                            : apiDay === "THURSDAY"
                                ? "목"
                                : apiDay === "FRIDAY"
                                    ? "금"
                                    : apiDay === "SATURDAY"
                                        ? "토"
                                        : "일";

                const existing = acc[day] ?? [];
                if (!existing.includes(normalizedTime)) {
                    acc[day] = [...existing, normalizedTime].sort();
                }
            });
            return acc;
        }, {});
    }, [data]);

    const capacity = data?.classTimes[0]?.capacity ?? 1;
    const operatingDays = DAY_ORDER.filter((day) => (operatingTimes[day] ?? []).length > 0);

    const availableDates = useMemo(() => {
        const today = new Date();
        const dates = [];

        for (let i = 0; i < 28; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const dayStr = DAY_LABEL_MAP[d.getDay()];
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const targetStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const isPast = targetStart.getTime() < todayStart.getTime();

            dates.push({
                full: d.toISOString().split("T")[0],
                month: d.getMonth() + 1,
                date: d.getDate(),
                day: dayStr,
                isAvailable: !isPast && operatingDays.includes(dayStr),
            });
        }

        return dates;
    }, [operatingDays]);

    const handlePurchase = async () => {
        if (!selectedDateObj || !selectedTime || !data) {
            alert("예약 날짜와 시간을 모두 선택해 주세요.");
            return;
        }

        const formattedDate = selectedDateObj.full.replace(/-/g, "");
        const formattedTime = selectedTime.replace(/:/g, "") + "00";
        const reservationDateTime = `${formattedDate}T${formattedTime}`;

        alert(
            `예약 요청 준비 완료\n\n${data.title}\n${selectedDateObj.full} (${selectedDateObj.day}) ${selectedTime}\n요청사항: ${requestMsg || "없음"}\n전송 예정 포맷: ${reservationDateTime}`
        );
        navigate("/market/reservations");
    };

    if (isLoading) {
        return <div className="p-10 text-center text-gray-400">구매 정보를 불러오는 중입니다...</div>;
    }

    if (loadError || !data) {
        return <div className="p-10 text-center">{loadError || "클래스를 찾을 수 없습니다."}</div>;
    }

    const renderTimeButtons = () => {
        if (!selectedDateObj) {
            return (
                <div className="h-[120px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-gray-400 text-[14px] font-medium">먼저 날짜를 선택해 주세요.</p>
                </div>
            );
        }

        const availableTimes = operatingTimes[selectedDateObj.day] ?? [];

        return (
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 w-full">
                {availableTimes.map((time) => {
                    const isSelected = selectedTime === time;

                    return (
                        <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`flex flex-col items-center justify-center py-[7px] min-h-[50px] rounded-lg transition-all ${
                                isSelected
                                    ? "bg-main text-white shadow-md border border-main"
                                    : "bg-[#FFF9EE] text-main border border-[#FAD390] hover:bg-main/10"
                            }`}
                        >
                            <span className="text-[12px] sm:text-[14px] font-bold">{time}</span>
                            <span className={`text-[9px] sm:text-[10px] mt-0.5 leading-none ${
                                isSelected ? "text-white/90" : "text-main/80"
                            }`}>
                                잔여 {capacity}명
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
                    <h2 className="text-[17px] font-bold text-gray-900 leading-snug">{data.title}</h2>
                    <div className="h-[1px] bg-gray-100 w-full my-1"></div>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-500 text-sm font-medium">1회 구매 비용</span>
                        <div className="flex items-center gap-1">
                            <div className="w-[18px] h-[18px] rounded-full bg-main flex items-center justify-center text-white text-[10px] font-bold">
                                MZTK
                            </div>
                            <span className="font-bold text-[18px] text-gray-900 leading-none">{data.priceAmount}</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <h3 className="text-[16px] font-bold text-gray-900">1. 예약 날짜 <span className="text-red-500">*</span></h3>
                    <div className="grid grid-cols-7 gap-1.5 w-full">
                        {availableDates.map((d) => {
                            const isSelected = selectedDateObj?.full === d.full;
                            const disabled = !d.isAvailable;
                            return (
                                <button
                                    key={d.full}
                                    disabled={disabled}
                                    onClick={() => {
                                        if (disabled) return;
                                        setSelectedDateObj(d);
                                        setSelectedTime("");
                                    }}
                                    className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all ${
                                        disabled
                                            ? "bg-gray-100 text-gray-300 border border-transparent cursor-not-allowed"
                                            : isSelected
                                                ? "bg-main text-white shadow-md shadow-main/20 border border-transparent"
                                                : "bg-white text-gray-600 border border-gray-200 cursor-pointer hover:border-main/50"
                                    }`}
                                >
                                    <span className={`text-[10px] sm:text-[11px] font-bold mb-0.5 ${
                                        disabled ? "text-gray-300" : isSelected ? "text-white/80" : "text-gray-400"
                                    }`}>
                                        {d.day}
                                    </span>
                                    <span className={`text-[13px] sm:text-[14px] font-bold tabular-nums leading-none tracking-tight ${
                                        disabled ? "text-gray-300" : ""
                                    }`}>
                                        {d.month}/{d.date}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex flex-col gap-3 min-h-[140px]">
                    <h3 className="text-[16px] font-bold text-gray-900 flex justify-between items-center">
                        <div>2. 방문 시간 <span className="text-red-500">*</span></div>
                        {selectedDateObj && (
                            <span className="text-[12px] text-gray-400 font-medium">
                                ({selectedDateObj.day}요일 예약 가능 시간)
                            </span>
                        )}
                    </h3>
                    {renderTimeButtons()}
                </div>

                <div className="flex flex-col gap-3">
                    <h3 className="text-[16px] font-bold text-gray-900">3. 요청사항 <span className="text-gray-400 text-[13px] font-medium">(선택)</span></h3>
                    <textarea
                        value={requestMsg}
                        onChange={(e) => setRequestMsg(e.target.value)}
                        placeholder="예: 허리 통증이 있어 강도를 조절하고 싶어요."
                        className="w-full h-[100px] bg-white border border-gray-200 rounded-xl p-4 text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-main focus:ring-1 focus:ring-main/20 resize-none transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="fixed bottom-0 max-w-[450px] w-full bg-white px-5 py-4 flex flex-col gap-3 border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] z-50 rounded-t-2xl">
                <CommonButton
                    label={`총 ${data.priceAmount} MZTK 결제 및 예약 확정`}
                    onClick={handlePurchase}
                    className={`h-[56px] rounded-xl font-bold text-[16px] ${selectedDateObj && selectedTime ? "" : "opacity-50"}`}
                />
            </div>
        </div>
    );
};

export default MarketPurchase;
