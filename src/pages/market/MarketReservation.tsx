import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SimpleHeader } from "@components/layout";
import { CommonButton, CommonModal } from "@components/common";
import { RESERVATION_STATUS } from "@constant/reservation";
import type { ReservationStatus } from "@constant/reservation";

// TODO: API 연동 시 실제 데이터로 교체
const MOCK_RESERVATIONS: {
    id: string;
    status: ReservationStatus;
    title: string;
    trainerName: string;
    date: string;
    day: string;
    time: string;
    image: string;
    price: number;
    requestMsg: string;
}[] = [];

const MarketReservation = () => {
    const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
    const [reservations, setReservations] = useState(MOCK_RESERVATIONS);
    // TODO: API 연동 시 useEffect에서 데이터 fetch 필요
    const [selectedRes, setSelectedRes] = useState<typeof MOCK_RESERVATIONS[0] | null>(null);
    const navigate = useNavigate();

    // TODO: API 연동 시 과거 클래스 자동 정산은 서버에서 처리 예정

    // 모달 관리 상태 (Stale Closure 방지 및 구조 통일)
    const [modal, setModal] = useState<{
        isOpen: boolean;
        type: "CANCEL_PENDING" | "REQUEST_CANCEL" | "CONFIRM_PURCHASE" | "ALERT" | "";
        title: string;
        desc: string;
        confirmLabel: string;
        cancelLabel?: string;
        targetId?: string;
    }>({
        isOpen: false,
        type: "",
        title: "",
        desc: "",
        confirmLabel: "확인"
    });

    const [cancelReason, setCancelReason] = useState("");

    const filteredReservations = reservations.filter(res => {
        if (activeTab === "upcoming") return ([RESERVATION_STATUS.PENDING, RESERVATION_STATUS.CONFIRMED, RESERVATION_STATUS.CANCELLATION_REQUESTED] as ReservationStatus[]).includes(res.status as ReservationStatus);
        return ([RESERVATION_STATUS.COMPLETED, RESERVATION_STATUS.ADMIN_SETTLED, RESERVATION_STATUS.CANCELLED] as ReservationStatus[]).includes(res.status as ReservationStatus);
    });

    const closeModal = () => {
        setModal(prev => ({ ...prev, isOpen: false, type: "" }));
        setCancelReason("");
    };

    const openModal = (config: Partial<typeof modal>) => {
        setModal({
            isOpen: true,
            type: config.type || "",
            title: config.title || "",
            desc: config.desc || "",
            confirmLabel: config.confirmLabel || "확인",
            cancelLabel: config.cancelLabel,
            targetId: config.targetId
        });
    };

    const handleModalConfirm = () => {
        const { type, targetId } = modal;

        if (type === "CANCEL_PENDING") {
            setReservations(prev => prev.map(res =>
                res.id === targetId ? { ...res, status: RESERVATION_STATUS.CANCELLED } : res
            ));
            openModal({
                type: "ALERT",
                title: "처리 완료",
                desc: "취소가 완료되었습니다.",
                confirmLabel: "확인"
            });
        }
        else if (type === "REQUEST_CANCEL") {
            if (!cancelReason.trim()) {
                setModal(prev => ({
                    ...prev,
                    type: "ALERT",
                    title: "알림",
                    desc: "취소 요청 사유를 입력해주세요.",
                    confirmLabel: "확인",
                    cancelLabel: undefined
                }));
                return;
            }

            setReservations(prev => prev.map(res =>
                res.id === targetId ? { ...res, status: RESERVATION_STATUS.CANCELLATION_REQUESTED, requestMsg: cancelReason } : res
            ));

            openModal({
                type: "ALERT",
                title: "요청 완료",
                desc: "취소 요청이 접수되었습니다.<br/>강사의 승인 후 취소가 완료됩니다.",
                confirmLabel: "확인"
            });
        }
        else {
            closeModal();
        }
    };

    const handleCancelClick = (id: string, currentStatus: ReservationStatus) => {
        if (currentStatus === RESERVATION_STATUS.PENDING) {
            openModal({
                type: "CANCEL_PENDING",
                targetId: id,
                title: "예약 취소",
                desc: "진짜 취소하시겠습니까?<br/>취소 후 복구가 불가능합니다.",
                confirmLabel: "취소하기",
                cancelLabel: "닫기"
            });
        } else if (currentStatus === RESERVATION_STATUS.CONFIRMED) {
            setCancelReason("");
            openModal({
                type: "REQUEST_CANCEL",
                targetId: id,
                title: "취소 요청",
                desc: "이미 확정된 예약은 직접 취소할 수 없습니다.<br/>취소 요청 사유를 작성해주세요.",
                confirmLabel: "요청하기",
                cancelLabel: "닫기"
            });
        }
    };

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
                                <span className={`text-[12px] font-bold px-2.5 py-1 rounded-md ${item.status === RESERVATION_STATUS.CONFIRMED
                                    ? "bg-main/10 text-main"
                                    : item.status === RESERVATION_STATUS.PENDING
                                        ? "bg-red-50 text-red-500"
                                        : item.status === RESERVATION_STATUS.CANCELLATION_REQUESTED
                                            ? "bg-orange-50 text-orange-500"
                                            : item.status === RESERVATION_STATUS.COMPLETED
                                                ? "bg-green-100 text-green-700"
                                                : item.status === RESERVATION_STATUS.ADMIN_SETTLED
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "bg-gray-100 text-gray-500"
                                    }`}>
                                    {item.status}
                                </span>
                                <span
                                    onClick={() => setSelectedRes(item)}
                                    className="text-[12px] font-bold text-gray-400 cursor-pointer hover:text-gray-600 underline"
                                >
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
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                                        <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="text-[13px] font-bold text-gray-700">{item.date} ({item.day})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                                        <path d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12ZM15.71 15.18L12.61 13.33C12.11 13.03 11.71 12.31 11.71 11.72V7.61" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span className="text-[13px] font-bold text-gray-700">{item.time} 방문</span>
                                </div>
                            </div>

                            {/* 액션 버튼 */}
                            {(item.status === RESERVATION_STATUS.PENDING || item.status === RESERVATION_STATUS.CONFIRMED || item.status === RESERVATION_STATUS.CANCELLATION_REQUESTED) && (
                                <div className="flex flex-col gap-2 mt-1">
                                    <div className="flex gap-2.5">
                                        <button
                                            onClick={() => handleCancelClick(item.id, item.status)}
                                            disabled={item.status === RESERVATION_STATUS.CANCELLATION_REQUESTED}
                                            className={`w-full py-3.5 rounded-xl font-bold text-[14px] transition-colors ${item.status === RESERVATION_STATUS.CANCELLATION_REQUESTED
                                                ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                                                : item.status === RESERVATION_STATUS.PENDING
                                                    ? "bg-main text-white hover:brightness-95 shadow-sm"
                                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                                }`}
                                        >
                                            {item.status === RESERVATION_STATUS.CANCELLATION_REQUESTED ? "취소 요청 중" : "예약 취소"}
                                        </button>
                                    </div>
                                    {item.status === RESERVATION_STATUS.PENDING ? (
                                        <p className="text-[11px] text-red-400 text-center font-medium">
                                            * 강사가 예약 승인을 검토 중입니다.
                                        </p>
                                    ) : item.status === RESERVATION_STATUS.CANCELLATION_REQUESTED && (
                                        <p className="text-[11px] text-orange-400 text-center font-medium">
                                            * 강사가 취소 요청을 확인하고 있습니다. 조금만 기다려주세요.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* 모달 렌더링 */}
                            {modal.isOpen && (
                                <CommonModal
                                    title={modal.title}
                                    desc={modal.desc}
                                    confirmLabel={modal.confirmLabel}
                                    onConfirmClick={handleModalConfirm}
                                    cancelLabel={modal.cancelLabel}
                                    onCancelClick={closeModal}
                                >
                                    {modal.type === "REQUEST_CANCEL" && (
                                        <div className="w-full mt-2">
                                            <textarea
                                                value={cancelReason}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                                placeholder="취소 사유를 입력해주세요. (예: 갑작스러운 일정 변경)"
                                                className="w-full h-[100px] bg-gray-50 border border-gray-200 rounded-xl p-3 text-[14px] text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-main focus:ring-1 focus:ring-main/20 resize-none transition-all shadow-sm text-left"
                                            />
                                        </div>
                                    )}
                                </CommonModal>
                            )}

                            {(item.status === RESERVATION_STATUS.COMPLETED || item.status === RESERVATION_STATUS.ADMIN_SETTLED) && (
                                <CommonButton
                                    label="리뷰 남기기"
                                    onClick={() => navigate(`/market/review/${item.id}`)}
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

            {/* 예약 상세 모달 */}
            {selectedRes && (
                <CommonModal
                    title="예약 상세 정보"
                    desc="블록체인에 기록된 예약 정보입니다."
                    confirmLabel="확인"
                    onConfirmClick={() => setSelectedRes(null)}
                >
                    <div className="w-full flex flex-col gap-4 mt-2 mb-1">
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">클래스 정보</span>
                                <p className="text-[14px] text-gray-800 font-bold">{selectedRes.title}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">트레이너</span>
                                <p className="text-[14px] text-gray-800 font-bold">{selectedRes.trainerName}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">결제 금액</span>
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 rounded-full bg-main flex items-center justify-center text-white text-[9px] font-bold">T</div>
                                    <p className="text-[14px] text-gray-800 font-bold">{selectedRes.price} MZTK</p>
                                </div>
                            </div>
                            {selectedRes.requestMsg && (
                                <div className="flex flex-col gap-1">
                                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                                        {selectedRes.status === RESERVATION_STATUS.CANCELLED ? "취소 사유" : "내 요청사항"}
                                    </span>
                                    <div className="bg-white p-3 rounded-xl border border-gray-100 text-[13px] text-gray-600 leading-relaxed italic">
                                        "{selectedRes.requestMsg}"
                                    </div>
                                </div>
                            )}
                            <div className="flex flex-col gap-1 pt-2 border-t border-gray-100">
                                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Transaction ID</span>
                                <p className="text-[10px] text-gray-400 font-mono break-all bg-white p-2 rounded border border-gray-50">
                                    0x{Math.random().toString(16).substring(2, 10)}...{Math.random().toString(16).substring(2, 10)}
                                </p>
                            </div>
                        </div>
                        <button
                            className="text-[12px] text-gray-400 underline font-medium text-center"
                            onClick={() => {
                                setSelectedRes(null);
                                openModal({
                                    type: "ALERT",
                                    title: "알림",
                                    desc: "블록체인 익스플로러로 연결됩니다.",
                                    confirmLabel: "확인"
                                });
                            }}
                        >
                            온체인 데이터 자세히 보기
                        </button>
                    </div>
                </CommonModal>
            )}
        </div>
    );
};

export default MarketReservation;
