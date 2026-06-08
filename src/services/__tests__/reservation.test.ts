import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@services/client";
import {
  approveTrainerReservation,
  cancelMyReservation,
  claimExpiredRefundMyReservation,
  completeMyReservation,
  createClassReservation,
  getClassReservationInfo,
  getMyReservations,
  getReservationDetail,
  getTrainerReservationDetail,
  getTrainerReservations,
  rejectTrainerReservation,
  recoverMyReservationEscrow,
  recoverTrainerReservationEscrow,
} from "@services/reservation";

const apiResponse = <T>(data: T) => ({ data: { data } });

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(api, "get").mockImplementation(vi.fn());
  vi.spyOn(api, "post").mockImplementation(vi.fn());
  vi.spyOn(api, "patch").mockImplementation(vi.fn());
});

describe("reservation service", () => {
  it("예약 가능 정보 조회 API를 호출한다", async () => {
    const response = {
      classId: 101,
      classTitle: "아침 PT 클래스",
      trainerId: 7,
      priceAmount: 300,
      durationMinutes: 50,
      availableDates: [],
    };
    vi.mocked(api.get).mockResolvedValueOnce(apiResponse(response));

    await expect(getClassReservationInfo(101)).resolves.toEqual(response);

    expect(api.get).toHaveBeenCalledWith(
      "/marketplace/classes/101/reservation-info"
    );
  });

  it("예약 생성 API에 선택한 슬롯과 서명 정보를 전달한다", async () => {
    const request = {
      slotId: 1,
      reservationDate: "2026-05-04",
      reservationTime: "10:00:00",
      idempotencyKey: "reservation:101:1:2026-05-04:10:00:00:test",
      signedAmount: "300",
      userRequest: "허리 통증이 있습니다.",
    };
    const response = { reservationId: 10, status: "PENDING" as const };
    vi.mocked(api.post).mockResolvedValueOnce(apiResponse(response));

    await expect(createClassReservation(101, request)).resolves.toEqual(
      response
    );

    expect(api.post).toHaveBeenCalledWith(
      "/marketplace/classes/101/reservations",
      request
    );
  });

  it("회원 예약 목록/상세/상태 변경 API를 호출한다", async () => {
    vi.mocked(api.get).mockResolvedValueOnce(
      apiResponse({ reservations: [], nextCursor: null, hasNext: false })
    );
    vi.mocked(api.get).mockResolvedValueOnce(
      apiResponse({ reservationId: 10 })
    );
    vi.mocked(api.patch).mockResolvedValueOnce(
      apiResponse({ reservationId: 10, status: "USER_CANCELLED" })
    );
    vi.mocked(api.patch).mockResolvedValueOnce(
      apiResponse({ reservationId: 10, status: "SETTLED" })
    );
    vi.mocked(api.patch).mockResolvedValueOnce(
      apiResponse({ reservationId: 10, status: "DEADLINE_REFUND_PENDING" })
    );
    vi.mocked(api.post).mockResolvedValueOnce(
      apiResponse({ reservationId: 10, status: "PURCHASE_PENDING" })
    );

    await getMyReservations("PENDING");
    await getReservationDetail(10);
    await cancelMyReservation(10);
    await completeMyReservation(10);
    await claimExpiredRefundMyReservation(10);
    await recoverMyReservationEscrow(10);

    expect(api.get).toHaveBeenNthCalledWith(1, "/marketplace/me/reservations", {
      params: { status: "PENDING", cursor: undefined, size: 10 },
    });
    expect(api.get).toHaveBeenNthCalledWith(2, "/marketplace/reservations/10");
    expect(api.patch).toHaveBeenNthCalledWith(
      1,
      "/marketplace/me/reservations/10/cancel"
    );
    expect(api.patch).toHaveBeenNthCalledWith(
      2,
      "/marketplace/me/reservations/10/complete"
    );
    expect(api.patch).toHaveBeenNthCalledWith(
      3,
      "/marketplace/me/reservations/10/deadline-refund"
    );
    expect(api.post).toHaveBeenNthCalledWith(
      1,
      "/marketplace/me/reservations/10/web3/recover"
    );
  });

  it("트레이너 예약 목록/상세/승인/반려 API를 호출한다", async () => {
    vi.mocked(api.get).mockResolvedValueOnce(
      apiResponse({ reservations: [], nextCursor: null, hasNext: false })
    );
    vi.mocked(api.get).mockResolvedValueOnce(
      apiResponse({ reservationId: 10 })
    );
    vi.mocked(api.patch).mockResolvedValueOnce(
      apiResponse({ reservationId: 10, status: "APPROVED" })
    );
    vi.mocked(api.patch).mockResolvedValueOnce(
      apiResponse({ reservationId: 10, status: "REJECTED" })
    );
    vi.mocked(api.post).mockResolvedValueOnce(
      apiResponse({ reservationId: 10, status: "REJECT_PENDING" })
    );

    await getTrainerReservations("PENDING");
    await getTrainerReservationDetail(10);
    await approveTrainerReservation(10);
    await rejectTrainerReservation(10, { rejectionReason: "일정 불가" });
    await recoverTrainerReservationEscrow(10);

    expect(api.get).toHaveBeenNthCalledWith(
      1,
      "/marketplace/trainer/reservations",
      { params: { status: "PENDING", cursor: undefined, size: 10 } }
    );
    expect(api.get).toHaveBeenNthCalledWith(
      2,
      "/marketplace/trainer/reservations/10"
    );
    expect(api.patch).toHaveBeenNthCalledWith(
      1,
      "/marketplace/trainer/reservations/10/approve"
    );
    expect(api.patch).toHaveBeenNthCalledWith(
      2,
      "/marketplace/trainer/reservations/10/reject",
      { rejectionReason: "일정 불가" }
    );
    expect(api.post).toHaveBeenNthCalledWith(
      1,
      "/marketplace/trainer/reservations/10/web3/recover"
    );
  });
});
