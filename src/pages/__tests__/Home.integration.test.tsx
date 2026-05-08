import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { server } from "@mocks/server";
import { attendanceAlreadyCheckedHandlers } from "@mocks/handlers/attendance";
import Home from "@pages/Home";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...(actual as object), useNavigate: () => mockNavigate };
});

vi.mock("@store", () => ({
  useUserStore: <T,>(selector?: (state: unknown) => T) => {
    const state = {
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
      weeklyAttendance: { attendedCount: 3 },
      analysisStatus: "idle",
      lastExerciseDate: null,
      checkAttendance: vi.fn(),
    };
    return selector ? selector(state) : state;
  },
  useLocationStore: () => ({ coor: null, setCoor: vi.fn() }),
  useAuthModalStore: () => ({ isUnauthorized: false }),
}));

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
