import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthActionButtons } from "../AuthActionButtons";

const mockCheckAttendance = vi.fn();

let mockStoreState = {
  checkAttendance: mockCheckAttendance,
  hasAttendedToday: false,
  lastAttendanceRewardedXp: null as number | null,
  lastExerciseDate: null as string | null,
  analysisStatus: "idle" as "idle" | "analyzing" | "completed",
};

vi.mock("@store", () => ({
  useUserStore: vi.fn(<T,>(selector: (state: typeof mockStoreState) => T) =>
    selector(mockStoreState)
  ),
}));

describe("AuthActionButtons", () => {
  beforeEach(() => {
    mockCheckAttendance.mockReset();
    mockStoreState = {
      checkAttendance: mockCheckAttendance,
      hasAttendedToday: false,
      lastAttendanceRewardedXp: null,
      lastExerciseDate: null,
      analysisStatus: "idle",
    };
  });

  it("locks workout verification while background analysis is running", () => {
    const onExerciseClick = vi.fn();
    mockStoreState = {
      ...mockStoreState,
      analysisStatus: "analyzing",
    };

    render(<AuthActionButtons onExerciseClick={onExerciseClick} />);

    const exerciseButton = screen.getByRole("button", {
      name: /운동 분석 중/i,
    });

    expect(screen.getByText(/운동 분석 중/i)).toBeInTheDocument();
    expect(exerciseButton).toBeDisabled();

    fireEvent.click(exerciseButton);

    expect(onExerciseClick).not.toHaveBeenCalled();
  });

  it("shows the actual attendance reward amount from the store", () => {
    mockStoreState = {
      ...mockStoreState,
      hasAttendedToday: true,
      lastAttendanceRewardedXp: 17,
    };

    render(<AuthActionButtons onExerciseClick={vi.fn()} />);

    expect(screen.getByText("17 XP를 획득했어요")).toBeInTheDocument();
    expect(screen.queryByText("10 XP를 획득했어요 ✨")).not.toBeInTheDocument();
  });

  it("opens workout verification when no analysis is running", () => {
    const onExerciseClick = vi.fn();

    render(<AuthActionButtons onExerciseClick={onExerciseClick} />);

    const exerciseButton = screen.getByRole("button", { name: /운동 인증/i });
    fireEvent.click(exerciseButton);

    expect(onExerciseClick).toHaveBeenCalledTimes(1);
  });
});
