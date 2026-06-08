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
const mockVerifyLocation = vi.fn();
type MockCoordinate = { lat: number; lng: number };
type MockGymLocation = (MockCoordinate & { locationId: number }) | null;

let mockLocationStoreState = {
  coor: { lat: 37.5665, lng: 126.978 } as MockCoordinate | null,
  setCoor: mockSetCoor,
};
let mockUserStoreState: {
  gymLocation: MockGymLocation;
  completeExercise: typeof mockCompleteExercise;
} = {
  gymLocation: { locationId: 1, lat: 37.5665, lng: 126.978 },
  completeExercise: mockCompleteExercise,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@store", () => ({
  useLocationStore: () => mockLocationStoreState,
}));

vi.mock("@store/userStore", () => ({
  useUserStore: () => mockUserStoreState,
}));

vi.mock("@services/location", () => ({
  locationService: {
    verifyLocation: mockVerifyLocation,
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
    mockLocationStoreState = {
      coor: { lat: 37.5665, lng: 126.978 },
      setCoor: mockSetCoor,
    };
    mockUserStoreState = {
      gymLocation: { locationId: 1, lat: 37.5665, lng: 126.978 },
      completeExercise: mockCompleteExercise,
    };
    mockWatchPosition.mockReturnValue(1);
    mockVerifyLocation.mockResolvedValue({
      isVerified: true,
      xpGranted: true,
      grantedXp: 100,
    });
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

  it("서버 기준 위치 인증 실패 메시지를 보여주고 XP를 반영하지 않는다", async () => {
    mockVerifyLocation.mockResolvedValue({
      isVerified: false,
      xpGranted: false,
      grantedXp: 0,
      distance: 13,
      xpGrantMessage: "XP not granted",
    });

    render(
      <BrowserRouter>
        <Verify />
      </BrowserRouter>
    );

    const verifyButton = await screen.findByRole(
      "button",
      { name: VERIFY_TEXT.BTN_VERIFY },
      { timeout: 3000 }
    );
    fireEvent.click(verifyButton);

    expect(
      await screen.findByText(/서버 기준 위치 인증 범위를 벗어났습니다/)
    ).toBeInTheDocument();
    expect(screen.getByText(/현재 거리: 13m/)).toBeInTheDocument();
    expect(mockCompleteExercise).not.toHaveBeenCalled();
  });

  it("등록된 위치가 없으면 위치 등록 안내 모달을 보여준다", async () => {
    mockUserStoreState = {
      ...mockUserStoreState,
      gymLocation: null,
    };

    render(
      <BrowserRouter>
        <Verify />
      </BrowserRouter>
    );

    expect(
      await screen.findByRole(
        "heading",
        {
          name: VERIFY_TEXT.MODAL_REG_TITLE,
        },
        { timeout: 3000 }
      )
    ).toBeInTheDocument();
    expect(mockVerifyLocation).not.toHaveBeenCalled();
  });

  it("현재 위치가 아직 없으면 대기 안내를 보여주고 서버 검증을 호출하지 않는다", async () => {
    mockLocationStoreState = {
      ...mockLocationStoreState,
      coor: null,
    };

    render(
      <BrowserRouter>
        <Verify />
      </BrowserRouter>
    );

    const moveButton = await screen.findByRole(
      "button",
      { name: VERIFY_TEXT.BTN_MOVE_TO_RANGE },
      { timeout: 3000 }
    );
    fireEvent.click(moveButton);

    expect(
      await screen.findByText(VERIFY_TEXT.WARNING_WAIT_CURRENT_LOCATION)
    ).toBeInTheDocument();
    expect(mockVerifyLocation).not.toHaveBeenCalled();
  });

  it("위치 권한 실패는 권한 안내 모달로 구분한다", async () => {
    mockWatchPosition.mockImplementation(
      (
        _onSuccess: unknown,
        onError: (error: GeolocationPositionError) => void
      ) => {
        onError({
          code: 1,
          message: "denied",
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
        return 1;
      }
    );

    render(
      <BrowserRouter>
        <Verify />
      </BrowserRouter>
    );

    expect(
      await screen.findByRole(
        "heading",
        {
          name: VERIFY_TEXT.MODAL_PERM_TITLE,
        },
        { timeout: 3000 }
      )
    ).toBeInTheDocument();
  });

  it("프론트 기준 반경 밖이면 서버 검증 없이 거리 실패를 보여준다", async () => {
    mockLocationStoreState = {
      ...mockLocationStoreState,
      coor: { lat: 37.57, lng: 126.978 },
    };

    render(
      <BrowserRouter>
        <Verify />
      </BrowserRouter>
    );

    const moveButton = await screen.findByRole(
      "button",
      { name: VERIFY_TEXT.BTN_MOVE_TO_RANGE },
      { timeout: 3000 }
    );
    fireEvent.click(moveButton);

    expect(
      await screen.findByRole(
        "heading",
        { name: VERIFY_TEXT.MODAL_FAIL_TITLE },
        { timeout: 3000 }
      )
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(VERIFY_TEXT.WARNING_OUT_OF_RANGE).length
    ).toBeGreaterThan(0);
    expect(mockVerifyLocation).not.toHaveBeenCalled();
  });

  it("위치는 성공했지만 XP 지급이 실패하면 보상을 반영하지 않고 별도 메시지를 보여준다", async () => {
    mockVerifyLocation.mockResolvedValue({
      isVerified: true,
      xpGranted: false,
      grantedXp: 0,
      xpGrantMessage: "XP grant failed",
    });

    render(
      <BrowserRouter>
        <Verify />
      </BrowserRouter>
    );

    const verifyButton = await screen.findByRole(
      "button",
      { name: VERIFY_TEXT.BTN_VERIFY },
      { timeout: 3000 }
    );
    fireEvent.click(verifyButton);

    expect(await screen.findByText("XP grant failed")).toBeInTheDocument();
    expect(mockCompleteExercise).not.toHaveBeenCalled();
  });
});
