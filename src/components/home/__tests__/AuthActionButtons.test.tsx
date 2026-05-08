import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthActionButtons } from "../AuthActionButtons";

const mockCheckAttendance = vi.fn();

let mockStoreState = {
  checkAttendance: mockCheckAttendance,
  hasAttendedToday: false,
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

    const exerciseButton = screen.getByRole("button", { name: "운동 인증" });

    expect(screen.getByText("운동 인증 분석 중")).toBeInTheDocument();
    expect(exerciseButton).toBeDisabled();

    fireEvent.click(exerciseButton);

    expect(onExerciseClick).not.toHaveBeenCalled();
  });

  it("opens workout verification when no analysis is running", () => {
    const onExerciseClick = vi.fn();

    render(<AuthActionButtons onExerciseClick={onExerciseClick} />);

    const exerciseButton = screen.getByRole("button", { name: "운동 인증" });
    fireEvent.click(exerciseButton);

    expect(onExerciseClick).toHaveBeenCalledTimes(1);
  });
});
