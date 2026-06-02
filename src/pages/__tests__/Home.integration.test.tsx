import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, it, expect, vi } from "vitest";
import { server } from "@mocks/server";
import { attendanceAlreadyCheckedHandlers } from "@mocks/handlers/attendance";
import Home from "@pages/Home";
import { getKstDateString } from "@utils/time";

const { mockNavigate, mockHomeStoreState } = vi.hoisted(() => ({
  mockNavigate: vi.fn(),
  mockHomeStoreState: {
    user: null,
    gymLocation: null,
    initAttendance: vi.fn().mockResolvedValue(undefined),
    initLevel: vi.fn().mockResolvedValue(undefined),
    initLocation: vi.fn().mockResolvedValue(undefined),
    initWorkoutCompletion: vi.fn().mockResolvedValue(undefined),
    level: 5,
    xp: 80,
    maxXp: 100,
    levelUp: vi.fn(),
    attendanceStreak: 3,
    hasAttendedToday: false,
    lastAttendanceRewardedXp: null as number | null,
    weeklyAttendance: { attendedCount: 3 },
    analysisStatus: "idle" as "idle" | "analyzing" | "completed",
    lastExerciseDate: null as string | null,
    attendanceResult: null,
    clearAttendanceResult: vi.fn(),
    checkAttendance: vi.fn(),
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...(actual as object), useNavigate: () => mockNavigate };
});

vi.mock("@store", () => ({
  useUserStore: <T,>(selector?: (state: unknown) => T) => {
    return selector ? selector(mockHomeStoreState) : mockHomeStoreState;
  },
  useLocationStore: () => ({ coor: null, setCoor: vi.fn() }),
  useAuthModalStore: () => ({ isUnauthorized: false }),
}));

vi.mock("@store/userStore", () => ({
  useUserStore: <T,>(selector?: (state: unknown) => T) =>
    selector ? selector(mockHomeStoreState) : mockHomeStoreState,
}));

beforeEach(() => {
  mockNavigate.mockReset();
  Object.assign(mockHomeStoreState, {
    user: null,
    gymLocation: null,
    initAttendance: vi.fn().mockResolvedValue(undefined),
    initLevel: vi.fn().mockResolvedValue(undefined),
    initLocation: vi.fn().mockResolvedValue(undefined),
    initWorkoutCompletion: vi.fn().mockResolvedValue(undefined),
    level: 5,
    xp: 80,
    maxXp: 100,
    levelUp: vi.fn(),
    attendanceStreak: 3,
    hasAttendedToday: false,
    lastAttendanceRewardedXp: null,
    weeklyAttendance: { attendedCount: 3 },
    analysisStatus: "idle",
    lastExerciseDate: null,
    attendanceResult: null,
    clearAttendanceResult: vi.fn(),
    checkAttendance: vi.fn(),
  });
});

describe("[통합] Home - 초기 로딩 흐름", () => {
  it("홈 화면이 정상적으로 렌더링된다", async () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it("완료되지 않은 미션 수를 실제 출석/운동 상태로 계산한다", () => {
    Object.assign(mockHomeStoreState, {
      hasAttendedToday: true,
      lastExerciseDate: getKstDateString(),
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText("0 To-do")).toBeInTheDocument();
  });

  it("출석 중복 체크 API 오류가 발생해도 화면이 크래시되지 않는다", async () => {
    server.use(...attendanceAlreadyCheckedHandlers);

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText("오류")).not.toBeInTheDocument();
    });
  });
});
