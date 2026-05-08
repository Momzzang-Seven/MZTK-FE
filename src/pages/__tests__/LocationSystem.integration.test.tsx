import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LocationRegister from "@pages/LocationRegister";
import { useUserStore } from "@store";
import { server } from "@mocks/server";
import { locationHandlers } from "@mocks/handlers/location";
import { UI_TEXT } from "@constant/index";

// 애니메이션 시간을 0으로 모킹
vi.mock("@constant/location", async () => {
  const actual = await vi.importActual("@constant/location");
  return {
    ...actual,
    LOCATION_CONSTANTS: {
      ...((actual as Record<string, unknown>).LOCATION_CONSTANTS as Record<
        string,
        unknown
      >),
      ANIMATION_DURATION: 0,
    },
  };
});

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...(actual as object),
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { from: "verify" } }),
  };
});

// Geolocation 모킹
const mockGetCurrentPosition = vi.fn((success) => {
  if (success) {
    success({ coords: { latitude: 37.5, longitude: 127.0 } });
  }
});
(global.navigator as unknown as { geolocation: unknown }).geolocation = {
  getCurrentPosition: mockGetCurrentPosition,
};

describe("[통합] Location System - 등록 및 로딩 흐름", () => {
  beforeEach(() => {
    server.use(...locationHandlers);
    useUserStore.getState().clearUser();
    vi.clearAllMocks();
  });

  it("홈 초기화 시 내 위치 목록을 API로 조회하여 Store에 반영한다", async () => {
    const store = useUserStore.getState();
    await act(async () => {
      await store.initLocation();
    });

    // msw/handlers/location.ts 의 mock 데이터 확인
    expect(useUserStore.getState().gymLocation?.address).toBe(
      "서울시 강남구 테헤란로 123"
    );
    expect(useUserStore.getState().gymLocation?.locationId).toBe(1);
  });

  it("위치 등록 페이지에서 등록 버튼 클릭 시 API 호출 및 성공 처리가 완료된다", async () => {
    render(
      <BrowserRouter>
        <LocationRegister />
      </BrowserRouter>
    );

    await waitFor(() => expect(mockGetCurrentPosition).toHaveBeenCalled());

    const registerBtn = screen.getByRole("button", {
      name: UI_TEXT.REGISTER_BTN,
    });

    await act(async () => {
      fireEvent.click(registerBtn);
    });

    // Store 업데이트 확인 (msw/handlers/location.ts 에서 locationId: 1 리턴)
    await waitFor(() => {
      const store = useUserStore.getState();
      expect(store.gymLocation?.locationId).toBe(1);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/verify");
    });
  });

  it("위치 삭제 API 호출이 에러 없이 수행된다 (Service Layer Check)", async () => {
    const { locationService } = await import("@services/location");
    const result = await locationService.deleteLocation(1);
    expect(result).toBeDefined();
  });
});
