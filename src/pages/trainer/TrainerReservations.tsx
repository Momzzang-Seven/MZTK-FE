import { useState } from "react";
import TrainerHeader from "@components/trainer/TrainerHeader";
import { CommonModal } from "@components/common";

const MOCK_TRAINER_RESERVATIONS = [
    {
        id: "tr1",
        status: "신규 예약",
        className: "1:1 집중 웨이트 트레이닝",
        customerName: "초보헬린이",
        date: "2026-03-05",
        day: "목",
        time: "19:00",
        remainingTime: "71시간 58분",
        requestMsg: "오른쪽 무릎이 조금 안 좋습니다."
    },
    {
        id: "tr2",
        status: "예약 확정",
        className: "1:1 집중 웨이트 트레이닝",
        customerName: "열혈다이어터",
        date: "2026-03-06",
        day: "금",
        time: "09:00",
        requestMsg: "살 엄청 빼고 싶어요 ㅠㅠ"
    },
    {
        id: "tr3",
        status: "수강 완료",
        className: "바디프로필 준비반 (식단방 포함)",
        customerName: "몸짱도전기",
        date: "2026-02-15",
        day: "일",
        time: "10:00",
        requestMsg: "식단 점검 부탁드립니다."
    }
];

const TrainerReservations = () => {
    const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "completed">("pending");

    // 예약 반려 모달 상태
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);

    const handleRejectClick = (id: string) => {
        setSelectedRejectId(id);
        setRejectReason("");
        setRejectModalOpen(true);
    };

    const handleRejectConfirm = () => {
        if (!rejectReason.trim()) {
            alert("반려 사유를 입력해주세요.");
            return;
        }

        // [TODO] 실제 서버 연동 로직 (선택된 ID: selectedRejectId)
        console.log("Rejecting:", selectedRejectId);
        alert(`예약이 반려되었습니다.\n사유: ${rejectReason}`);
        setRejectModalOpen(false);
        setSelectedRejectId(null);
    };

    const filteredReservations = MOCK_TRAINER_RESERVATIONS.filter(res => {
        if (activeTab === "pending") return res.status === "신규 예약";
        if (activeTab === "confirmed") return res.status === "예약 확정";
        return res.status === "수강 완료";
    });

    return (
        <div className="flex flex-col h-full bg-gray-50 min-h-screen">
            <TrainerHeader title="예약 확인하기" showBack />

            {/* 탭 바 */}
            <div className="flex w-full bg-white border-b border-gray-100 z-10 sticky top-0">
                <button
                    onClick={() => setActiveTab("pending")}
                    className={`flex-1 py-4 text-[14px] font-bold transition-all relative ${activeTab === "pending" ? "text-gray-900" : "text-gray-400"
                        }`}
                >
                    승인 대기
                    <span className="ml-1.5 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 align-middle">
                        {MOCK_TRAINER_RESERVATIONS.filter(r => r.status === "신규 예약").length}
                    </span>
                    {activeTab === "pending" && (
                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 rounded-t-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("confirmed")}
                    className={`flex-1 py-4 text-[14px] font-bold transition-all relative ${activeTab === "confirmed" ? "text-gray-900" : "text-gray-400"
                        }`}
                >
                    확정된 예약
                    {activeTab === "confirmed" && (
                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 rounded-t-full"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("completed")}
                    className={`flex-1 py-4 text-[14px] font-bold transition-all relative ${activeTab === "completed" ? "text-gray-900" : "text-gray-400"
                        }`}
                >
                    수강 완료
                    {activeTab === "completed" && (
                        <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gray-900 rounded-t-full"></div>
                    )}
                </button>
            </div>

            {/* 안내 경고 메시지 영역 */}
            {activeTab === "pending" && (
                <div className="bg-red-50 px-5 py-3 text-[12px] text-red-600 font-medium tracking-tight">
                    <p>🚨 72시간 내 미승인 시 서버 지갑에서 자동 환불 및 트레이너 제재 시스템이 동작합니다.</p>
                </div>
            )}

            {(activeTab === "pending" || activeTab === "confirmed") && (
                <div className="bg-[#FFF9EE] px-5 py-3 text-[12px] text-orange-500 font-medium tracking-tight border-t border-[#FAD390]/30 shadow-sm">
                    <p>⚠️ 3회 이상 예약 반려 시 트레이너 이용 정지 됩니다.</p>
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4 pb-24">
                {filteredReservations.length > 0 ? (
                    filteredReservations.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
                            {/* 헤더: 상태 & 날짜/시간 */}
                            <div className="flex justify-between items-center mb-1 border-b border-gray-100 pb-2">
                                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${item.status === "신규 예약"
                                    ? "bg-red-50 text-red-500"
                                    : item.status === "예약 확정"
                                        ? "bg-orange-50 text-orange-500"
                                        : "bg-gray-100 text-gray-500"
                                    }`}>
                                    {item.status}
                                </span>
                                {item.status === "신규 예약" && (
                                    <span className="text-[12px] font-bold text-red-500 flex items-center gap-1">
                                        <span className="text-[10px]">⏱</span> 자동 거절까지 <span className="underline">{item.remainingTime}</span>
                                    </span>
                                )}
                            </div>

                            {/* 고객 및 클래스 정보 */}
                            <div className="flex flex-col gap-1.5 pt-1 pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-gray-900 font-bold text-[18px]">{item.customerName} 회원님</h3>
                                </div>
                                <span className="text-gray-500 text-[13px] font-medium leading-snug break-keep">
                                    {item.className}
                                </span>
                            </div>

                            {/* 상세 정보 (일시, 요구사항) */}
                            <div className="flex flex-col gap-2.5">
                                <div className="flex items-center justify-between text-[14px]">
                                    <span className="text-gray-400 font-medium">예약 일시</span>
                                    <div className="flex items-center gap-1.5 text-gray-800 font-bold">
                                        <span>{item.date} ({item.day})</span>
                                        <span>{item.time}</span>
                                    </div>
                                </div>
                                {item.requestMsg && (
                                    <div className="flex flex-col gap-1.5 mt-1">
                                        <span className="text-gray-400 text-[13px] font-medium">요청/특이사항</span>
                                        <div className="bg-gray-50 p-3 rounded-lg text-gray-700 text-[14px] leading-relaxed break-keep">
                                            {item.requestMsg}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 액션 버튼 */}
                            {item.status === "신규 예약" && (
                                <div className="flex gap-2 mt-2 pt-1 border-t border-gray-100">
                                    <button
                                        onClick={() => handleRejectClick(item.id)}
                                        className="flex-1 py-3.5 mt-2 rounded-xl font-bold text-[14px] bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        예약 반려
                                    </button>
                                    <button
                                        onClick={() => alert("예약이 확정되었습니다.")}
                                        className="flex-1 py-3.5 mt-2 rounded-xl font-bold text-[14px] bg-main text-white shadow-sm hover:brightness-95 transition-all"
                                    >
                                        예약 승인
                                    </button>
                                </div>
                            )}

                            {item.status === "예약 확정" && (
                                <div className="mt-2 pt-1 border-t border-gray-100">
                                    <button
                                        onClick={() => handleRejectClick(item.id)}
                                        className="w-full mt-2 py-3.5 rounded-xl font-bold text-[14px] bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    >
                                        예약 반려하기
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 gap-3">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                            <img src="/icon/calendar.svg" alt="empty" className="w-8 h-8 opacity-30" />
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-gray-700 mb-1">
                                {activeTab === "pending" ? "대기 중인 예약이 없습니다" :
                                    activeTab === "confirmed" ? "확정된 예약이 없습니다" : "완료된 수강 내역이 없습니다"}
                            </h3>
                            <p className="text-sm text-gray-400 whitespace-pre-line">
                                {activeTab === "pending" ? "새로운 예약 요청이 들어오면\n이곳에서 확인하고 승인할 수 있습니다." : ""}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* 예약 반려 사유 입력 모달 */}
            {rejectModalOpen && (
                <CommonModal
                    title="예약 반려"
                    desc="반려 사유를 입력해주세요. 해당 사유는 회원에게 전달됩니다."
                    confirmLabel="반려 확인"
                    onConfirmClick={handleRejectConfirm}
                    cancelLabel="취소"
                    onCancelClick={() => {
                        setRejectModalOpen(false);
                        setSelectedRejectId(null);
                    }}
                >
                    <div className="w-full mt-2">
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="예) 해당 시간대에 이미 잡혀있는 오프라인 일정이 있습니다. 다른 시간대로 예약 부탁드립니다."
                            className="w-full h-[100px] bg-gray-50 border border-gray-200 rounded-xl p-3 text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-main focus:ring-1 focus:ring-main/20 resize-none transition-all shadow-sm text-left"
                        />
                    </div>
                </CommonModal>
            )}
        </div>
    );
};

export default TrainerReservations;
