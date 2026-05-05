export const RESERVATION_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  USER_CANCELLED: "USER_CANCELLED",
  REJECTED: "REJECTED",
  TIMEOUT_CANCELLED: "TIMEOUT_CANCELLED",
  SETTLED: "SETTLED",
  AUTO_SETTLED: "AUTO_SETTLED",
} as const;

export type ReservationStatus =
  (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS];

export const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  [RESERVATION_STATUS.PENDING]: "승인 대기",
  [RESERVATION_STATUS.APPROVED]: "예약 확정",
  [RESERVATION_STATUS.USER_CANCELLED]: "예약 취소",
  [RESERVATION_STATUS.REJECTED]: "예약 반려",
  [RESERVATION_STATUS.TIMEOUT_CANCELLED]: "자동 취소",
  [RESERVATION_STATUS.SETTLED]: "수강 완료",
  [RESERVATION_STATUS.AUTO_SETTLED]: "자동 정산",
};

export const UPCOMING_RESERVATION_STATUSES: ReservationStatus[] = [
  RESERVATION_STATUS.PENDING,
  RESERVATION_STATUS.APPROVED,
];

export const PAST_RESERVATION_STATUSES: ReservationStatus[] = [
  RESERVATION_STATUS.USER_CANCELLED,
  RESERVATION_STATUS.REJECTED,
  RESERVATION_STATUS.TIMEOUT_CANCELLED,
  RESERVATION_STATUS.SETTLED,
  RESERVATION_STATUS.AUTO_SETTLED,
];

export const getReservationStatusLabel = (status: ReservationStatus) =>
  RESERVATION_STATUS_LABEL[status] ?? status;

export const isReservationPast = (status: ReservationStatus) =>
  PAST_RESERVATION_STATUSES.includes(status);

export const isReservationCancellable = (status: ReservationStatus) =>
  status === RESERVATION_STATUS.PENDING;

export const isReservationCompletable = (status: ReservationStatus) =>
  status === RESERVATION_STATUS.APPROVED;
