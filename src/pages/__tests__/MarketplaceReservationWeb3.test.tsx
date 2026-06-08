import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MarketReservation from "@pages/market/MarketReservation";
import TrainerReservations from "@pages/trainer/TrainerReservations";
import type { ReservationSummary } from "@services";

const mockGetMyReservations = vi.hoisted(() => vi.fn());
const mockGetReservationDetail = vi.hoisted(() => vi.fn());
const mockCancelMyReservation = vi.hoisted(() => vi.fn());
const mockCompleteMyReservation = vi.hoisted(() => vi.fn());
const mockGetTrainerReservations = vi.hoisted(() => vi.fn());
const mockGetTrainerReservationDetail = vi.hoisted(() => vi.fn());
const mockApproveTrainerReservation = vi.hoisted(() => vi.fn());
const mockRejectTrainerReservation = vi.hoisted(() => vi.fn());

vi.mock("@services", () => ({
  getMyReservations: mockGetMyReservations,
  getReservationDetail: mockGetReservationDetail,
  cancelMyReservation: mockCancelMyReservation,
  completeMyReservation: mockCompleteMyReservation,
  getTrainerReservations: mockGetTrainerReservations,
  getTrainerReservationDetail: mockGetTrainerReservationDetail,
  approveTrainerReservation: mockApproveTrainerReservation,
  rejectTrainerReservation: mockRejectTrainerReservation,
}));

const renderPage = (ui: ReactNode) => render(<MemoryRouter>{ui}</MemoryRouter>);

const buildBlockedReservation = (
  overrides: Partial<ReservationSummary> = {}
): ReservationSummary => ({
  reservationId: 501,
  slotId: 1,
  trainerId: 7,
  userId: 2,
  reservationDate: "2026-05-04",
  reservationTime: {
    hour: 10,
    minute: 0,
    second: 0,
    nano: 0,
  },
  durationMinutes: 50,
  status: "PENDING",
  userRequest: null,
  classTitle: "Morning PT",
  trainerNickname: "trainer",
  userNickname: "student",
  priceAmount: 300,
  thumbnailFinalObjectKey: null,
  web3Execution: {
    resource: {
      type: "MARKETPLACE_RESERVATION",
      id: "501",
      status: "PENDING_EXECUTION",
    },
    actionType: "MARKETPLACE_CLASS_PURCHASE",
    executionIntent: {
      id: "intent-501",
      status: "PENDING_ONCHAIN",
      expiresAt: "2026-05-23T10:05:00",
    },
    execution: {
      mode: "EIP7702",
      signCount: 2,
    },
    signRequest: null,
    transaction: {
      id: 2001,
      status: "UNCONFIRMED",
      txHash:
        "0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
    },
    recoveryStatus: "ONCHAIN_UNCERTAIN",
    recoveryReason: "RECEIPT_TIMEOUT",
    retryAllowed: false,
    viewerCanRecover: false,
  },
  ...overrides,
});

describe("Marketplace reservation Web3 timeout UX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetReservationDetail.mockResolvedValue(buildBlockedReservation());
    mockGetTrainerReservationDetail.mockResolvedValue(
      buildBlockedReservation()
    );
  });

  it("hides member cancel/complete actions while reservation transaction is uncertain", async () => {
    mockGetMyReservations.mockResolvedValue({
      reservations: [buildBlockedReservation()],
      hasNext: false,
      nextCursor: null,
    });

    renderPage(<MarketReservation />);

    expect(
      await screen.findByText(/블록체인 결과 확인이 지연되어/)
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(4);
    await waitFor(() => {
      expect(mockCancelMyReservation).not.toHaveBeenCalled();
      expect(mockCompleteMyReservation).not.toHaveBeenCalled();
    });
  });

  it("hides trainer approve/reject actions while reservation transaction is uncertain", async () => {
    mockGetTrainerReservations.mockResolvedValue({
      reservations: [buildBlockedReservation()],
      hasNext: false,
      nextCursor: null,
    });

    renderPage(<TrainerReservations />);

    expect(
      await screen.findByText(/블록체인 결과 확인이 지연되어/)
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(6);
    await waitFor(() => {
      expect(mockApproveTrainerReservation).not.toHaveBeenCalled();
      expect(mockRejectTrainerReservation).not.toHaveBeenCalled();
    });
  });
});
