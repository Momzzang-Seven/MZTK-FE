import { api } from "@services/client";
import type { Web3Execution } from "@types";

export type MarketplaceReservationStatus =
  | "HOLDING"
  | "PENDING"
  | "APPROVED"
  | "USER_CANCELLED"
  | "REJECTED"
  | "TIMEOUT_CANCELLED"
  | "SETTLED"
  | "AUTO_SETTLED"
  | "HOLD_EXPIRED"
  | "PAYMENT_FAILED"
  | "DEADLINE_REFUNDED"
  | "MANUAL_SYNC_REQUIRED"
  | "PURCHASE_PREPARING"
  | "PURCHASE_PENDING"
  | "CANCEL_PENDING"
  | "REJECT_PENDING"
  | "CONFIRM_PENDING"
  | "ADMIN_REFUND_PENDING"
  | "ADMIN_SETTLE_PENDING"
  | "DEADLINE_REFUND_PENDING"
  | "DEADLINE_REFUND_AVAILABLE"
  | "DEADLINE_RECOVERY_REQUIRED"
  | "DEADLINE_SYNC_REQUIRED";

export type MarketplaceReservationEscrowStatus =
  | "NONE"
  | "PURCHASE_PREPARING"
  | "PURCHASE_PENDING"
  | "LOCKED"
  | "CANCEL_PENDING"
  | "REJECT_PENDING"
  | "CONFIRM_PENDING"
  | "ADMIN_REFUND_PENDING"
  | "ADMIN_SETTLE_PENDING"
  | "DEADLINE_REFUND_AVAILABLE"
  | "DEADLINE_REFUND_PENDING"
  | "REFUNDED"
  | "SETTLED"
  | "DEADLINE_REFUNDED"
  | "DEADLINE_RECOVERY_REQUIRED"
  | "DEADLINE_SYNC_REQUIRED"
  | "MANUAL_SYNC_REQUIRED"
  | "HOLD_EXPIRED"
  | "PAYMENT_FAILED"
  | "FAILED";

export interface AvailableReservationTime {
  slotId: number;
  startTime: string;
  capacity: number;
  availableCapacity: number;
}

export interface AvailableReservationDate {
  date: string;
  availableTimes: AvailableReservationTime[];
}

export interface ClassReservationInfo {
  classId: number;
  classTitle: string;
  trainerId: number;
  priceAmount: number;
  durationMinutes: number;
  availableDates: AvailableReservationDate[];
}

export interface CreateReservationRequest {
  slotId: number;
  reservationDate: string;
  reservationTime: string;
  userRequest?: string;
  idempotencyKey: string;
  signedAmount: string;
}

export interface ReservationMutationResponse {
  reservationId: number;
  status: MarketplaceReservationStatus;
  businessStatus?: MarketplaceReservationStatus;
  escrowStatus?: MarketplaceReservationEscrowStatus | string;
  orderKey?: string | null;
  web3?: Web3Execution | null;
}

export interface ReservationTime {
  hour: number;
  minute: number;
  second: number;
  nano: number;
}

export interface ReservationSummary {
  reservationId: number;
  slotId: number;
  trainerId: number;
  userId: number;
  reservationDate: string;
  reservationTime: ReservationTime;
  durationMinutes: number;
  status: MarketplaceReservationStatus;
  businessStatus?: MarketplaceReservationStatus;
  escrowStatus?: MarketplaceReservationEscrowStatus | string;
  userRequest: string | null;
  classTitle: string;
  trainerNickname: string;
  userNickname: string;
  priceAmount: number;
  thumbnailFinalObjectKey: string | null;
  web3Execution?: Web3Execution | null;
}

export interface ReservationDetail extends ReservationSummary {
  orderId: string | null;
  orderKey?: string | null;
  txHash: string | null;
  contractDeadlineAt?: string | null;
  contractDeadlineEpochSeconds?: number | null;
  viewerCanRecover?: boolean;
  viewerCanClaimDeadlineRefund?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RejectReservationRequest {
  rejectionReason: string;
}

export interface CursorSlice<T> {
  reservations: T[];
  nextCursor: string | null;
  hasNext: boolean;
}

const unwrap = <T>(response: { data: { data: T } }) => response.data.data;

export const getClassReservationInfo = async (
  classId: number
): Promise<ClassReservationInfo> => {
  const response = await api.get(
    `/marketplace/classes/${classId}/reservation-info`
  );
  return unwrap<ClassReservationInfo>(response);
};

export const createClassReservation = async (
  classId: number,
  request: CreateReservationRequest
): Promise<ReservationMutationResponse> => {
  const response = await api.post(
    `/marketplace/classes/${classId}/reservations`,
    request
  );
  return unwrap<ReservationMutationResponse>(response);
};

export const getMyReservations = async (
  status?: MarketplaceReservationStatus,
  cursor?: string,
  size: number = 10
): Promise<CursorSlice<ReservationSummary>> => {
  const response = await api.get("/marketplace/me/reservations", {
    params: { status, cursor, size },
  });
  return unwrap<CursorSlice<ReservationSummary>>(response);
};

export const getReservationDetail = async (
  reservationId: number
): Promise<ReservationDetail> => {
  const response = await api.get(`/marketplace/reservations/${reservationId}`);
  return unwrap<ReservationDetail>(response);
};

export const cancelMyReservation = async (
  reservationId: number
): Promise<ReservationMutationResponse> => {
  const response = await api.patch(
    `/marketplace/me/reservations/${reservationId}/cancel`
  );
  return unwrap<ReservationMutationResponse>(response);
};

export const completeMyReservation = async (
  reservationId: number
): Promise<ReservationMutationResponse> => {
  const response = await api.patch(
    `/marketplace/me/reservations/${reservationId}/complete`
  );
  return unwrap<ReservationMutationResponse>(response);
};

export const claimExpiredRefundMyReservation = async (
  reservationId: number
): Promise<ReservationMutationResponse> => {
  const response = await api.patch(
    `/marketplace/me/reservations/${reservationId}/deadline-refund`
  );
  return unwrap<ReservationMutationResponse>(response);
};

export const recoverMyReservationEscrow = async (
  reservationId: number
): Promise<ReservationMutationResponse> => {
  const response = await api.post(
    `/marketplace/me/reservations/${reservationId}/web3/recover`
  );
  return unwrap<ReservationMutationResponse>(response);
};

export const getTrainerReservations = async (
  status?: MarketplaceReservationStatus,
  cursor?: string,
  size: number = 10
): Promise<CursorSlice<ReservationSummary>> => {
  const response = await api.get("/marketplace/trainer/reservations", {
    params: { status, cursor, size },
  });
  return unwrap<CursorSlice<ReservationSummary>>(response);
};

export const getTrainerReservationDetail = async (
  reservationId: number
): Promise<ReservationDetail> => {
  const response = await api.get(
    `/marketplace/trainer/reservations/${reservationId}`
  );
  return unwrap<ReservationDetail>(response);
};

export const approveTrainerReservation = async (
  reservationId: number
): Promise<ReservationMutationResponse> => {
  const response = await api.patch(
    `/marketplace/trainer/reservations/${reservationId}/approve`
  );
  return unwrap<ReservationMutationResponse>(response);
};

export const rejectTrainerReservation = async (
  reservationId: number,
  request: RejectReservationRequest
): Promise<ReservationMutationResponse> => {
  const response = await api.patch(
    `/marketplace/trainer/reservations/${reservationId}/reject`,
    request
  );
  return unwrap<ReservationMutationResponse>(response);
};

export const recoverTrainerReservationEscrow = async (
  reservationId: number
): Promise<ReservationMutationResponse> => {
  const response = await api.post(
    `/marketplace/trainer/reservations/${reservationId}/web3/recover`
  );
  return unwrap<ReservationMutationResponse>(response);
};
