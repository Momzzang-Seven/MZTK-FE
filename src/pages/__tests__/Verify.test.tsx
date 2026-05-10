import { useEffect } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Verify from "../Verify";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { VERIFY_TEXT } from "@constant/location";

// 모킹
const mockNavigate = vi.fn();
const mockCompleteExercise = vi.fn();
const mockSetCoor = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@store", () => ({
  useLocationStore: () => ({
    coor: { lat: 37.5665, lng: 126.978 },
    setCoor: mockSetCoor,
  }),
}));

vi.mock("@store/userStore", () => ({
  useUserStore: () => ({
    gymLocation: { locationId: 1, lat: 37.5665, lng: 126.978 }, // locationId 추가
    completeExercise: mockCompleteExercise,
  }),
}));

vi.mock("@services/location", () => ({
  locationService: {
    verifyLocation: vi
      .fn()
      .mockResolvedValue({ isVerified: true, grantedXp: 100 }),
  },
}));

vi.mock("@components/verify", () => ({
  MapView: ({ onMapLoad }: { onMapLoad: () => void }) => {
    useEffect(() => {
      onMapLoad();
    }, [onMapLoad]);
    return <div data-testid="mock-map-view" />;
  },
  VerifyStatusOverlay: () => <div data-testid="mock-status-overlay" />,
  RangeCircle: () => null,
}));

// Geolocation 모킹
const mockWatchPosition = vi.fn();
const mockClearWatch = vi.fn();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global.navigator as any).geolocation = {
  watchPosition: mockWatchPosition,
  clearWatch: mockClearWatch,
};

describe("Verify Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("인증 버튼 클릭 시 성공 오버레이가 표시되고 2초 후 홈으로 이동한다", async () => {
    render(
      <BrowserRouter>
        <Verify />
      </BrowserRouter>
    );

    // 버튼이 '인증 위치로 이동해주세요'에서 '위치 인증하기'로 바뀔 때까지 대기
    // Verify.tsx에서 setTimeout 1000ms가 있으므로 timeout을 넉넉히 준다
    const verifyButton = await screen.findByRole(
      "button",
      { name: VERIFY_TEXT.BTN_VERIFY },
      { timeout: 3000 }
    );
    fireEvent.click(verifyButton);

    await waitFor(
      () => {
        expect(mockCompleteExercise).toHaveBeenCalled();
      },
      { timeout: 2000 }
    );

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      },
      { timeout: 3000 }
    );
  });
});
