import { api } from "@services/client";

export type MarketplaceReservationStatus =
  | "PENDING"
  | "APPROVED"
  | "USER_CANCELLED"
  | "REJECTED"
  | "TIMEOUT_CANCELLED"
  | "SETTLED"
  | "AUTO_SETTLED";

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
  signedAmount: number;
  delegationSignature: string;
  executionSignature: string;
}

export interface ReservationMutationResponse {
  reservationId: number;
  status: MarketplaceReservationStatus;
}

export interface ReservationSummary {
  reservationId: number;
  slotId: number;
  trainerId: number;
  userId: number;
  reservationDate: string;
  reservationTime: string;
  durationMinutes: number;
  status: MarketplaceReservationStatus;
  userRequest: string | null;
}

export interface ReservationDetail extends ReservationSummary {
  orderId: string | null;
  txHash: string | null;
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
