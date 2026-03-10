import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CommonButton } from "@components/common";
import { SimpleHeader } from "@components/layout";
// import { calculateEndTime } from "@utils";

// 실제 앱에서는 API로 호출하거나 상태관리 도구를 사용하므로 여기선 임시로 재정의합니다.
const MOCK_DATA: Record<string, any> = {
    "1": {
        id: "1",
        title: "1:1 집중 웨이트 트레이닝",
        trainerName: "김근육 트레이너",
        price: 350,
        capacity: 1,
        duration: "50분",
        operatingDays: ["월", "수", "금"],
        operatingTimes: {
            월: ["09:00", "13:00", "18:00"],
            수: ["09:00", "13:00", "18:00"],
            금: ["09:00", "10:00", "11:00"],
        }
    },
    "2": {
        id: "2",
        title: "체형 교정 & 코어 강화 소그룹 PT",
        trainerName: "이유연 강사",
        price: 180,
        capacity: 4,
        duration: "50분",
        operatingDays: ["화", "목", "토"],
        operatingTimes: {
            화: ["10:00", "14:00", "19:00"],
            목: ["10:00", "14:00", "19:00"],
            토: ["09:00", "11:00", "13:00"],
        }
    },
    "3": {
        id: "3",
        title: "바디프로필 준비반 (식단방 포함)",
        trainerName: "박태환 강사",
        price: 500,
        capacity: 2,
        duration: "60분",
        operatingDays: ["월", "화", "수", "목", "금"],
        operatingTimes: {
            월: ["06:00", "12:00", "18:00", "20:00"],
            화: ["06:00", "12:00", "18:00", "20:00"],
            수: ["06:00", "12:00", "18:00", "20:00"],
            목: ["06:00", "12:00", "18:00", "20:00"],
            금: ["06:00", "12:00", "18:00", "20:00"],
        }
    }
};

const MarketPurchase = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const data = MOCK_DATA[id || "1"];

    const [selectedDateObj, setSelectedDateObj] = useState<{ full: string, day: string } | null>(null);
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [requestMsg, setRequestMsg] = useState<string>("");

    if (!data) return <div className="p-10 text-center">클래스를 찾을 수 없습니다.</div>;

    // 휴무일 포함 4주치 전체 날짜 배열 생성
    const getAvailableDates = () => {
        const today = new Date();
        const dates = [];
        const dayMap: Record<number, string> = { 0: "일", 1: "월", 2: "화", 3: "수", 4: "목", 5: "금", 6: "토" };

        // 이번 주 월요일부터 시작 (일요일은 0이므로 월요일은 1)
        const currentDay = today.getDay();
        const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

        const startDate = new Date(today);
        startDate.setDate(today.getDate() + diffToMonday);

        for (let i = 0; i < 28; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const dayStr = dayMap[d.getDay()];

            // 오늘 이전 날짜인지 체크
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const targetStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const isPast = targetStart.getTime() < todayStart.getTime();

            dates.push({
                full: d.toISOString().split("T")[0], // YYYY-MM-DD
                month: d.getMonth() + 1,
                date: d.getDate(),
                day: dayStr,
                isAvailable: !isPast && data.operatingDays.includes(dayStr)
            });
        }
        return dates;
    };

    const availableDates = getAvailableDates();

    // 예약 가능한 날짜 버튼
    const renderDateButtons = () => {
        return (
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
                                setSelectedTime(""); // 날짜 바뀌면 시간 초기화
                            }}
                            className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all ${disabled
                                ? "bg-gray-100 text-gray-300 border border-transparent cursor-not-allowed"
                                : isSelected
                                    ? "bg-main text-white shadow-md shadow-main/20 border border-transparent"
                                    : "bg-white text-gray-600 border border-gray-200 cursor-pointer hover:border-main/50"
                                }`}
                        >
                            <span className={`text-[10px] sm:text-[11px] font-bold mb-0.5 ${disabled ? "text-gray-300" : isSelected ? "text-white/80" : "text-gray-400"}`}>{d.day}</span>
                            <span className={`text-[13px] sm:text-[14px] font-bold tabular-nums leading-none tracking-tight ${disabled ? "text-gray-300" : ""}`}>{d.month}/{d.date}</span>
                        </button>
                    )
                })}
            </div>
        );
    };

    // 날짜 선택 시 00:00 ~ 24:00 전체 시간표 안에서 가능한 시간을 색칠해서 보여주기
    const renderTimeButtons = () => {
        if (!selectedDateObj) return (
            <div className="h-[120px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-400 text-[14px] font-medium">먼저 날짜를 선택해주세요.</p>
            </div>
        );

        const availableTimes = (data.operatingTimes[selectedDateObj.day] as string[]) || [];

        // 00:00 부터 23:00까지 기본 1시간 단위 배열 + 실제 예약 가능 시간이 30분 단위 등일 경우 추가
        const allTimesSet = new Set<string>();
        for (let i = 0; i <= 23; i++) {
            allTimesSet.add(`${String(i).padStart(2, '0')}:00`);
        }
        availableTimes.forEach(t => allTimesSet.add(t));
        const sortedAllTimes = Array.from(allTimesSet).sort();

        return (
            <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 w-full">
                {sortedAllTimes.map((time) => {
                    const isAvailable = availableTimes.includes(time);
                    const isSelected = selectedTime === time;

                    // 더미 데이터 예약된 인원 (임시: 0으로 처리)
                    const capacity = data.capacity || 1;
                    const booked = 0;
                    const remain = capacity - booked;

                    return (
                        <button
                            key={time}
                            disabled={!isAvailable}
                            onClick={() => setSelectedTime(time)}
                            className={`flex flex-col items-center justify-center py-[7px] min-h-[50px] rounded-lg transition-all ${!isAvailable
                                ? "bg-[#EFEFEF] text-[#D1D1D1] border border-transparent cursor-not-allowed" // 불가능한 시간 (회색 박스)
                                : isSelected
                                    ? "bg-main text-white shadow-md border border-main" // 선택됨 (주황 바탕)
                                    : "bg-[#FFF9EE] text-main border border-[#FAD390] hover:bg-main/10" // 예약 가능 (연한 주황 바탕 + 주황 테두리)
                                }`}
                        >
                            <span className={`text-[12px] sm:text-[14px] font-bold ${!isAvailable ? "opacity-80 font-medium" : ""}`}>{time}</span>
                            {/* 인원수 표기 */}
                            <span className={`text-[9px] sm:text-[10px] mt-0.5 leading-none ${!isAvailable
                                ? "text-transparent" // 불가능할 땐 숨김
                                : isSelected
                                    ? "text-white/90"
                                    : "text-main/80"
                                }`}>
                                잔여 {remain}명
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    };

    const handlePurchase = async () => {
        if (!selectedDateObj || !selectedTime) {
            alert("예약하실 날짜와 시간을 모두 선택해주세요!");
            return;
        }

        // 백엔드 명세서에 맞춘 ISO8601 (YYYYMMDDThhmmss) 형식 포맷팅 변환
        // selectedDateObj.full = "2026-03-05" -> "20260305"
        // selectedTime = "09:00" -> "090000"
        const formattedDate = selectedDateObj.full.replace(/-/g, "");
        const formattedTime = selectedTime.replace(/:/g, "") + "00";
        const reservationDateTime = `${formattedDate}T${formattedTime}`;

        try {
            // [TODO] 실제 서버 연동 로직
            // 예시 페이로드: 
            // const payload = {
            //     classId: id,
            //     reservationTime: reservationDateTime, // ex) "20260305T090000"
            //     requestMessage: requestMsg
            // };
            // const response = await createReservationApi(payload)

            // !! 임시 기획: 테스트를 위해 30% 확률로 구매 실패를 재현합니다 !!
            const isSuccess = Math.random() > 0.3;
            if (!isSuccess) {
                throw new Error("결제/예약 시스템 오류 또는 MZT 부족");
            }

            alert(`🎉 예약이 확정되었습니다!\n\n${data.title}\n${selectedDateObj.full} (${selectedDateObj.day}요일) ${selectedTime}\n요청사항: ${requestMsg || "없음"}\n(서버 전송 시간 포맷: ${reservationDateTime})`);
            navigate("/market/reservations");
        } catch (error) {
            // 예약/결제 실패 시 실패 안내 페이지로 리다이렉트
            navigate("/market/purchase-fail");
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-50 min-h-screen">
            <SimpleHeader />

            <div className="flex-1 overflow-y-auto px-5 pt-6 pb-32 flex flex-col gap-8">
                {/* 상단 클래스 요약 정보 */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                    <span className="text-main font-bold text-xs">{data.trainerName}</span>
                    <h2 className="text-[17px] font-bold text-gray-900 leading-snug">{data.title}</h2>
                    <div className="h-[1px] bg-gray-100 w-full my-1"></div>
                    <div className="flex justify-between items-center mt-1">
                        <span className="text-gray-500 text-sm font-medium">1회 구매 비용</span>
                        <div className="flex items-center gap-1">
                            <div className="w-[18px] h-[18px] rounded-full bg-main flex items-center justify-center text-white text-[10px] font-bold">
                                MZT
                            </div>
                            <span className="font-bold text-[18px] text-gray-900 leading-none">{data.price}</span>
                        </div>
                    </div>
                </div>

                {/* 날짜 선택 */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-[16px] font-bold text-gray-900">1. 예약 날짜 <span className="text-red-500">*</span></h3>
                    {renderDateButtons()}
                </div>

                {/* 시간 선택 */}
                <div className="flex flex-col gap-3 min-h-[140px]">
                    <h3 className="text-[16px] font-bold text-gray-900 flex justify-between items-center">
                        <div>2. 방문 시간 <span className="text-red-500">*</span></div>
                        {selectedDateObj && <span className="text-[12px] text-gray-400 font-medium">({selectedDateObj.day}요일 예약 가능 시간)</span>}
                    </h3>
                    {renderTimeButtons()}
                </div>

                {/* 요청사항 입력 */}
                <div className="flex flex-col gap-3">
                    <h3 className="text-[16px] font-bold text-gray-900">3. 요청사항 <span className="text-gray-400 text-[13px] font-medium">(선택)</span></h3>
                    <textarea
                        value={requestMsg}
                        onChange={(e) => setRequestMsg(e.target.value)}
                        placeholder="예) 오른쪽 무릎이 조금 안 좋습니다. / 다이어트 목적입니다."
                        className="w-full h-[100px] bg-white border border-gray-200 rounded-xl p-4 text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-main focus:ring-1 focus:ring-main/20 resize-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* 하단 고정 토큰 지불 / 구매 바 */}
            <div className="fixed bottom-0 max-w-[450px] w-full bg-white px-5 py-4 flex flex-col gap-3 border-t border-gray-100 shadow-[0_-4px_15px_rgba(0,0,0,0.03)] z-50 rounded-t-2xl">
                <CommonButton
                    label={`총 ${data.price} MZT 결제 및 예약 확정`}
                    onClick={handlePurchase}
                    className={`h-[56px] rounded-xl font-bold text-[16px] ${selectedDateObj && selectedTime ? "" : "opacity-50"}`}
                />
            </div>
        </div>
    );
};

export default MarketPurchase;
