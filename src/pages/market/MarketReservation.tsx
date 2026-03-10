import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SimpleHeader } from "@components/layout";
import { CommonButton } from "@components/common";

const MOCK_RESERVATIONS = [
    {
        id: "r1",
        status: "예약 확정",
        title: "1:1 집중 웨이트 트레이닝",
        trainerName: "김근육 트레이너",
        date: "2026-03-05",
        day: "목",
        time: "19:00",
        image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
        price: 350,
        requestMsg: "오른쪽 무릎이 조금 안 좋습니다."
    },
    {
        id: "r2",
        status: "수강 완료",
        title: "체형 교정 & 코어 강화 소그룹 PT",
        trainerName: "이유연 강사",
        date: "2026-02-15",
        day: "일",
        time: "10:00",
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop",
        price: 180,
        requestMsg: ""
    },
    {
        id: "r3",
        status: "예약 취소",
        title: "바디프로필 준비반 (식단방 포함)",
        trainerName: "박태환 강사",
        date: "2026-02-10",
        day: "화",
        time: "20:00",
        image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop",
        price: 500,
        requestMsg: "다이어트 목적입니다."
    }
];

const MarketReservation = () => {
    const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
    const navigate = useNavigate();

    const filteredReservations = MOCK_RESERVATIONS.filter(res => {
        if (activeTab === "upcoming") return res.status === "예약 확정";
        return res.status === "수강 완료" || res.status === "예약 취소";
    });

    return (
        <div className="flex flex-col h-full bg-gray-50 min-h-screen">
            <SimpleHeader />

            {/* 탭 바 */}
            <div className="flex w-full bg-white border-b border-gray-100 z-10 sticky top-0">
                <button
                    onClick={() => setActiveTab("upcoming")}
                    className={`flex-1 py-4 text-[15px] font-bold transition-all relative ${activeTab === "upcoming" ? "text-gray-900" : "text-gray-400"
                        }`}
                >
                    다가오는 클래스
                    {activeTab === "upcoming" && (
                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 rounded-t-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("past")}
                    className={`flex-1 py-4 text-[15px] font-bold transition-all relative ${activeTab === "past" ? "text-gray-900" : "text-gray-400"
                        }`}
                >
                    지난 클래스
                    {activeTab === "past" && (
                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 rounded-t-full"></div>
                    )}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4 pb-24">
                {filteredReservations.length > 0 ? (
                    filteredReservations.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-4">
                            {/* 헤더 */}
                            <div className="flex justify-between items-center">
                                <span className={`text-[12px] font-bold px-2.5 py-1 rounded-md ${item.status === "예약 확정"
                                    ? "bg-main/10 text-main"
                                    : item.status === "수강 완료"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-500"
                                    }`}>
                                    {item.status}
                                </span>
                                <span className="text-[12px] font-bold text-gray-400 cursor-pointer hover:text-gray-600 underline">
                                    예약 상세
                                </span>
                            </div>

                            {/* 메인 콘텐츠 */}
                            <div className="flex gap-4">
                                <img src={item.image} alt={item.title} className="w-20 h-20 rounded-xl object-cover bg-gray-100" />
                                <div className="flex flex-col justify-center flex-1">
                                    <span className="text-gray-500 text-[12px] font-medium mb-0.5">{item.trainerName}</span>
                                    <h3 className="font-bold text-[15px] text-gray-900 leading-tight line-clamp-2 break-keep mb-1.5">{item.title}</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-[14px] h-[14px] rounded-full bg-main flex items-center justify-center text-white text-[8px] font-bold">
                                            T
                                        </div>
                                        <span className="font-bold text-[14px] text-gray-800">{item.price}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 예약 일시 */}
                            <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-1.5">
                                <div className="flex items-center gap-2">
                                    <img src="/icon/calendar.svg" alt="calendar" className="w-[14px] h-[14px] opacity-40" />
                                    <span className="text-[13px] font-bold text-gray-700">{item.date} ({item.day})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <img src="/icon/clock.svg" alt="clock" className="w-[14px] h-[14px] opacity-40" />
                                    <span className="text-[13px] font-bold text-gray-700">{item.time} 방문</span>
                                </div>
                            </div>

                            {/* 액션 버튼 */}
                            {item.status === "예약 확정" && (
                                <div className="flex flex-col gap-2 mt-1">
                                    <div className="flex gap-2.5">
                                        <button
                                            onClick={() => {
                                                if (window.confirm("예약을 취소하시겠습니까? (규정에 따라 수수료가 발생할 수 있습니다.)")) {
                                                    alert("예약이 취소되었습니다.");
                                                }
                                            }}
                                            className="flex-1 py-3.5 rounded-xl font-bold text-[14px] bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors"
                                        >
                                            예약 취소
                                        </button>
                                        <button
                                            className="flex-1 py-3.5 rounded-xl font-bold text-[14px] bg-main text-white shadow-sm hover:brightness-95 transition-all border border-transparent"
                                            onClick={() => {
                                                if (window.confirm("클래스 수강이 완료되었나요?\n'구매 확정' 시 트레이너에게 대금이 정산됩니다.")) {
                                                    alert("구매 확정이 완료되었습니다. 클래스가 '지난 내역'으로 이동합니다.");
                                                }
                                            }}
                                        >
                                            구매 확정
                                        </button>
                                    </div>
                                    <button
                                        className="w-full py-3 rounded-xl font-bold text-[13px] text-gray-400 border border-gray-100 bg-white"
                                        onClick={() => navigate(`/market/purchase/${item.id.replace('r', '')}`)}
                                    >
                                        클래스 상세 정보 보기
                                    </button>
                                </div>
                            )}

                            {item.status === "수강 완료" && (
                                <CommonButton
                                    label="리뷰 남기기"
                                    onClick={() => alert("리뷰 작성 화면으로 이동합니다.")}
                                    className="h-[48px] rounded-xl font-bold text-[14px] mt-1"
                                />
                            )}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <span className="text-3xl opacity-30">📭</span>
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-gray-700 mb-1">
                                {activeTab === "upcoming" ? "예정된 클래스가 없습니다." : "지난 클래스 내역이 없습니다."}
                            </h3>
                            <p className="text-sm text-gray-400 whitespace-pre-line">
                                마켓에서 마음에 드는 운동을 찾아보세요!
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
        </div>
    );
};

export default MarketReservation;
