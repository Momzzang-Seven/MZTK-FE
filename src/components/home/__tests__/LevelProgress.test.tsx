import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LevelProgress } from "../LevelProgress";

const mockLevelUp = vi.fn();
const mockUseUserStore = vi.fn();

vi.mock("@store", () => ({
  useUserStore: () => mockUseUserStore(),
}));

const renderWithRouter = (ui: React.ReactElement) =>
  render(<MemoryRouter>{ui}</MemoryRouter>);

describe("LevelProgress", () => {
  beforeEach(() => {
    mockLevelUp.mockClear();
    vi.spyOn(window, "alert").mockImplementation(() => {});
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("현재 레벨이 표시된다", () => {
    mockUseUserStore.mockReturnValue({
      level: 5,
      xp: 50,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    renderWithRouter(<LevelProgress />);

    expect(screen.getByText("Lv.5")).toBeInTheDocument();
  });

  it("XP 진행도가 표시된다", () => {
    mockUseUserStore.mockReturnValue({
      level: 3,
      xp: 75,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    renderWithRouter(<LevelProgress />);

    expect(screen.getByText(/75\s*\/\s*100\s*EXP/)).toBeInTheDocument();
  });

  it("현재 레벨 텍스트가 표시된다", () => {
    mockUseUserStore.mockReturnValue({
      level: 2,
      xp: 30,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    renderWithRouter(<LevelProgress />);

    expect(screen.getByText("현재 레벨")).toBeInTheDocument();
  });

  it('레벨업 가능 시 "레벨업!" 버튼이 표시된다', () => {
    mockUseUserStore.mockReturnValue({
      level: 5,
      xp: 100,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    renderWithRouter(<LevelProgress />);

    const levelUpButton = screen.getByRole("button", { name: "레벨업!" });
    expect(levelUpButton).toBeInTheDocument();
  });

  it("레벨업 가능 시 현재 레벨 정보가 숨겨진다", () => {
    mockUseUserStore.mockReturnValue({
      level: 5,
      xp: 100,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    renderWithRouter(<LevelProgress />);

    expect(screen.queryByText("현재 레벨")).not.toBeInTheDocument();
    expect(screen.queryByText("Lv.5")).not.toBeInTheDocument();
  });

  it("레벨업 버튼 클릭 시 levelUp 함수가 호출된다", async () => {
    localStorage.setItem("wallet_address", "0x123");
    mockLevelUp.mockResolvedValue({ success: true, message: "Success" });
    mockUseUserStore.mockReturnValue({
      level: 5,
      xp: 100,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    renderWithRouter(<LevelProgress />);

    const levelUpButton = screen.getByRole("button", { name: "레벨업!" });
    fireEvent.click(levelUpButton);

    expect(mockLevelUp).toHaveBeenCalledTimes(1);
  });

  it("레벨업 성공 시 alert가 표시된다", async () => {
    localStorage.setItem("wallet_address", "0x123");
    mockLevelUp.mockResolvedValue({
      success: true,
      message: "축하합니다! Lv.6 달성! 보상으로 100 MZTK가 지급되었습니다.",
    });
    mockUseUserStore.mockReturnValue({
      level: 5,
      xp: 100,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    renderWithRouter(<LevelProgress />);

    const levelUpButton = screen.getByRole("button", { name: "레벨업!" });
    fireEvent.click(levelUpButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "축하합니다! Lv.6 달성! 보상으로 100 MZTK가 지급되었습니다."
      );
    });
  });

  it("레벨업 실패 시 실패 메시지 alert가 표시된다", async () => {
    localStorage.setItem("wallet_address", "0x123");
    mockLevelUp.mockResolvedValue({
      success: false,
      message: "경험치가 부족합니다.",
    });
    mockUseUserStore.mockReturnValue({
      level: 5,
      xp: 100,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    renderWithRouter(<LevelProgress />);

    const levelUpButton = screen.getByRole("button", { name: "레벨업!" });
    fireEvent.click(levelUpButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("경험치가 부족합니다.");
    });
  });

  it("SVG circle이 렌더링된다", () => {
    mockUseUserStore.mockReturnValue({
      level: 3,
      xp: 50,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    const { container } = renderWithRouter(<LevelProgress />);

    const circles = container.querySelectorAll("circle");
    expect(circles).toHaveLength(2);
  });

  it("XP가 maxXp를 초과해도 100%로 제한된다", () => {
    mockUseUserStore.mockReturnValue({
      level: 5,
      xp: 150,
      maxXp: 100,
      levelUp: mockLevelUp,
    });

    renderWithRouter(<LevelProgress />);

    expect(screen.getByRole("button", { name: "레벨업!" })).toBeInTheDocument();
  });
});
