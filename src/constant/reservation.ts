export const RESERVATION_STATUS = {
    PENDING: "신규 예약",
    CONFIRMED: "예약 확정",
    COMPLETED: "수강 완료",
    CANCELLED: "예약 취소",
    CANCELLATION_REQUESTED: "취소 요청 중",
    ADMIN_SETTLED: "정산 완료",
} as const;

export type ReservationStatus = typeof RESERVATION_STATUS[keyof typeof RESERVATION_STATUS];

/**
 * 클래스 취소 로직 (Mock)
 * @param currentStatus 현재 예약 상태
 * @returns 취소 가능 여부 및 변경될 상태
 */
export const cancleClass = (currentStatus: ReservationStatus) => {
    // 1. CONFIRMED 상태면 직접 취소 불가
    if (currentStatus === RESERVATION_STATUS.CONFIRMED) {
        return {
            allowed: false,
            message: "이미 확정된 예약은 직접 취소할 수 없습니다. 취소 요청을 진행해주세요.",
            nextStatus: RESERVATION_STATUS.CANCELLATION_REQUESTED
        };
    }

    // 2. 그 외 상태 (신규 예약 등)는 즉시 취소 가능 (또는 정책에 따라 처리)
    return {
        allowed: true,
        message: "예약이 취소되었습니다.",
        nextStatus: RESERVATION_STATUS.CANCELLED
    };
};
