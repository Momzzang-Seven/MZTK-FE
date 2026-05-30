import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import MarketDetail from "@pages/market/MarketDetail";
import MarketPurchase from "@pages/market/MarketPurchase";

const mocks = vi.hoisted(() => ({
  createClassReservation: vi.fn(),
  getClassReservationInfo: vi.fn(),
  getMarketplaceClassDetail: vi.fn(),
  useTokenBalance: vi.fn(),
}));

vi.mock("@services", () => ({
  createClassReservation: (...args: unknown[]) =>
    mocks.createClassReservation(...args),
  getClassReservationInfo: (...args: unknown[]) =>
    mocks.getClassReservationInfo(...args),
  getMarketplaceClassDetail: (...args: unknown[]) =>
    mocks.getMarketplaceClassDetail(...args),
}));

vi.mock("@hooks", () => ({
  useTokenBalance: () => mocks.useTokenBalance(),
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/market/purchase/101"]}>
      <Routes>
        <Route path="/market/purchase/:id" element={<MarketPurchase />} />
        <Route path="/market/reservations" element={<div>예약 내역</div>} />
      </Routes>
    </MemoryRouter>
  );

const renderDetailPage = () =>
  render(
    <MemoryRouter initialEntries={["/market/101"]}>
      <Routes>
        <Route path="/market/:id" element={<MarketDetail />} />
        <Route
          path="/market/purchase/:id"
          element={<div>구매 화면 진입</div>}
        />
      </Routes>
    </MemoryRouter>
  );

const detailResponse = {
  classId: 101,
  title: "아침 PT 클래스",
  trainerId: 7,
  category: "PT",
  priceAmount: 300,
  durationMinutes: 50,
  thumbnailFinalObjectKey: null,
  images: [],
  tags: ["초보"],
  features: ["자세 교정"],
  personalItems: "운동복",
  classTimes: [
    {
      daysOfWeek: ["MONDAY"],
      startTime: "10:00:00",
    },
  ],
  store: {
    storeName: "테스트 스토어",
    address: "서울시 중구",
    detailAddress: "2층",
    latitude: 37.5665,
    longitude: 126.978,
  },
};

const reservationInfoResponse = {
  classTitle: "아침 PT 클래스",
  priceAmount: 300,
  availableDates: [
    {
      date: "2026-05-18",
      availableTimes: [
        {
          slotId: 501,
          startTime: "10:00:00",
          availableCapacity: 2,
        },
      ],
    },
  ],
};

describe("MarketPurchase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMarketplaceClassDetail.mockResolvedValue(detailResponse);
    mocks.getClassReservationInfo.mockResolvedValue(reservationInfoResponse);
    mocks.createClassReservation.mockResolvedValue({
      reservationId: 10,
      status: "PENDING",
    });
    mocks.useTokenBalance.mockReturnValue({ balance: "1000", loading: false });
  });

  it("blocks entry into purchase page from detail when MZTK balance is insufficient", async () => {
    mocks.useTokenBalance.mockReturnValue({ balance: "120", loading: false });

    renderDetailPage();

    expect(await screen.findByText("아침 PT 클래스")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "지금 예약하기" }));

    expect(await screen.findByText("잔액 부족")).toBeInTheDocument();
    expect(
      screen.getByText(/예약에는 300 MZTK가 필요합니다/)
    ).toBeInTheDocument();
    expect(screen.queryByText("구매 화면 진입")).not.toBeInTheDocument();
  });

  it("allows entry into purchase page from detail when MZTK balance is enough", async () => {
    renderDetailPage();

    expect(await screen.findByText("아침 PT 클래스")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "지금 예약하기" }));

    expect(await screen.findByText("구매 화면 진입")).toBeInTheDocument();
  });

  it("blocks reservation payment before API request when MZTK balance is insufficient", async () => {
    mocks.useTokenBalance.mockReturnValue({ balance: "120", loading: false });

    renderPage();

    expect(await screen.findByText("아침 PT 클래스")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /5\.18/ }));
    fireEvent.click(screen.getByRole("button", { name: /10:00/ }));
    fireEvent.click(screen.getByRole("button", { name: "잔액 부족" }));

    expect(await screen.findAllByText("잔액 부족")).toHaveLength(2);
    expect(
      screen.getByText(/예약에는 300 MZTK가 필요합니다/)
    ).toBeInTheDocument();
    expect(mocks.createClassReservation).not.toHaveBeenCalled();
  });

  it("sends reservation request when selected slot and MZTK balance are valid", async () => {
    renderPage();

    expect(await screen.findByText("아침 PT 클래스")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /5\.18/ }));
    fireEvent.click(screen.getByRole("button", { name: /10:00/ }));
    fireEvent.click(screen.getByRole("button", { name: /300 MZTK 결제하기/ }));

    await waitFor(() => {
      expect(mocks.createClassReservation).toHaveBeenCalledWith(
        101,
        expect.objectContaining({
          slotId: 501,
          reservationDate: "2026-05-18",
          reservationTime: "10:00:00",
        })
      );
    });
    const request = mocks.createClassReservation.mock.calls[0][1] as Record<
      string,
      unknown
    >;
    expect(request).toEqual(
      expect.objectContaining({
        idempotencyKey: expect.stringMatching(
          /^reservation:101:501:2026-05-18:10:00:00:/
        ),
        signedAmount: "300",
      })
    );
    expect(request).not.toHaveProperty("delegationSignature");
    expect(request).not.toHaveProperty("executionSignature");
  });
});
