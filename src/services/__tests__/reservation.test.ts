import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  approveTrainerReservation,
  cancelMyReservation,
  completeMyReservation,
  createClassReservation,
  getClassReservationInfo,
  getMyReservations,
  getReservationDetail,
  getTrainerReservationDetail,
  getTrainerReservations,
  rejectTrainerReservation,
} from "../reservation";

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock("../client", () => ({
  api: mockApi,
}));

const apiResponse = <T>(data: T) => ({ data: { data } });

beforeEach(() => {
  vi.clearAllMocks();
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
    mockApi.get.mockResolvedValueOnce(apiResponse(response));

    await expect(getClassReservationInfo(101)).resolves.toEqual(response);

    expect(mockApi.get).toHaveBeenCalledWith(
      "/marketplace/classes/101/reservation-info"
    );
  });

  it("예약 생성 API에 선택한 슬롯과 서명 정보를 전달한다", async () => {
    const request = {
      slotId: 1,
      reservationDate: "2026-05-04",
      reservationTime: "10:00:00",
      userRequest: "허리 통증이 있습니다.",
      signedAmount: 300,
      delegationSignature: `0x${"1".repeat(130)}`,
      executionSignature: `0x${"2".repeat(130)}`,
    };
    const response = { reservationId: 10, status: "PENDING" as const };
    mockApi.post.mockResolvedValueOnce(apiResponse(response));

    await expect(createClassReservation(101, request)).resolves.toEqual(
      response
    );

    expect(mockApi.post).toHaveBeenCalledWith(
      "/marketplace/classes/101/reservations",
      request
    );
  });

  it("회원 예약 목록/상세/상태 변경 API를 호출한다", async () => {
    mockApi.get.mockResolvedValueOnce(apiResponse([]));
    mockApi.get.mockResolvedValueOnce(apiResponse({ reservationId: 10 }));
    mockApi.patch.mockResolvedValueOnce(
      apiResponse({ reservationId: 10, status: "USER_CANCELLED" })
    );
    mockApi.patch.mockResolvedValueOnce(
      apiResponse({ reservationId: 10, status: "SETTLED" })
    );

    await getMyReservations("PENDING");
    await getReservationDetail(10);
    await cancelMyReservation(10);
    await completeMyReservation(10);

    expect(mockApi.get).toHaveBeenNthCalledWith(
      1,
      "/marketplace/me/reservations",
      { params: { status: "PENDING" } }
    );
    expect(mockApi.get).toHaveBeenNthCalledWith(
      2,
      "/marketplace/reservations/10"
    );
    expect(mockApi.patch).toHaveBeenNthCalledWith(
      1,
      "/marketplace/me/reservations/10/cancel"
    );
    expect(mockApi.patch).toHaveBeenNthCalledWith(
      2,
      "/marketplace/me/reservations/10/complete"
    );
  });

  it("트레이너 예약 목록/상세/승인/반려 API를 호출한다", async () => {
    mockApi.get.mockResolvedValueOnce(apiResponse([]));
    mockApi.get.mockResolvedValueOnce(apiResponse({ reservationId: 10 }));
    mockApi.patch.mockResolvedValueOnce(
      apiResponse({ reservationId: 10, status: "APPROVED" })
    );
    mockApi.patch.mockResolvedValueOnce(
      apiResponse({ reservationId: 10, status: "REJECTED" })
    );

    await getTrainerReservations("PENDING");
    await getTrainerReservationDetail(10);
    await approveTrainerReservation(10);
    await rejectTrainerReservation(10, { rejectionReason: "일정 불가" });

    expect(mockApi.get).toHaveBeenNthCalledWith(
      1,
      "/marketplace/trainer/reservations",
      { params: { status: "PENDING" } }
    );
    expect(mockApi.get).toHaveBeenNthCalledWith(
      2,
      "/marketplace/trainer/reservations/10"
    );
    expect(mockApi.patch).toHaveBeenNthCalledWith(
      1,
      "/marketplace/trainer/reservations/10/approve"
    );
    expect(mockApi.patch).toHaveBeenNthCalledWith(
      2,
      "/marketplace/trainer/reservations/10/reject",
      { rejectionReason: "일정 불가" }
    );
  });
});
