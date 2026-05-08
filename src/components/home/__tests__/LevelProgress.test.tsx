import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LevelProgress } from "../LevelProgress";

const mockLevelUp = vi.fn();
const mockShowSnackbar = vi.fn();

let mockStoreState = {
  level: 5,
  xp: 50,
  maxXp: 100,
  levelUp: mockLevelUp,
  showSnackbar: mockShowSnackbar,
};

vi.mock("@store", () => ({
  useUserStore: vi.fn(<T,>(selector: (state: typeof mockStoreState) => T) =>
    selector(mockStoreState)
  ),
}));

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("LevelProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("현재 레벨과 남은 XP가 표시된다", async () => {
    mockStoreState = {
      level: 5,
      xp: 50,
      maxXp: 100,
      levelUp: mockLevelUp,
      showSnackbar: mockShowSnackbar,
    };
    renderWithRouter(<LevelProgress />);

    await waitFor(() => {
      expect(screen.getByText("LV.5")).toBeInTheDocument();
      expect(screen.getByText(/50\s*EXP/)).toBeInTheDocument();
    });
  });

  it('레벨업 가능 시 "지금 바로 레벨업!" 버튼이 표시된다', async () => {
    mockStoreState = {
      level: 5,
      xp: 100,
      maxXp: 100,
      levelUp: mockLevelUp,
      showSnackbar: mockShowSnackbar,
    };

    renderWithRouter(<LevelProgress />);

    await waitFor(() => {
      const levelUpButton = screen.getByText(/지금 바로 레벨업!/);
      expect(levelUpButton).toBeInTheDocument();
    });
  });

  it("레벨업 버튼 클릭 시 levelUp 함수가 호출된다", async () => {
    mockStoreState = {
      level: 5,
      xp: 100,
      maxXp: 100,
      levelUp: mockLevelUp,
      showSnackbar: mockShowSnackbar,
    };
    mockLevelUp.mockResolvedValue({ success: true, message: "Level Up!" });
    localStorage.setItem("wallet_address", "0x123");

    renderWithRouter(<LevelProgress />);

    const levelUpButton = await screen.findByText(/지금 바로 레벨업!/);
    fireEvent.click(levelUpButton);

    expect(mockLevelUp).toHaveBeenCalled();
    await waitFor(() => {
      expect(mockShowSnackbar).toHaveBeenCalledWith("Level Up!", {
        variant: "success",
      });
    });
  });
});
