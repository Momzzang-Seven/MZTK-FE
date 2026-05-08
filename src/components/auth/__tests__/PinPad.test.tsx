import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PinPad } from "@components/auth/PinPad";

describe("PinPad", () => {
  const mockOnInput = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    mockOnInput.mockClear();
    mockOnDelete.mockClear();
  });

  it("제목이 렌더링된다", () => {
    render(
      <PinPad
        title="PIN 번호 설정"
        pin=""
        onInput={mockOnInput}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("PIN 번호 설정")).toBeInTheDocument();
  });

  it("안내 문구가 표시된다", () => {
    render(
      <PinPad
        title="PIN 번호 설정"
        pin=""
        onInput={mockOnInput}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText(/6자리 숫자를 입력해 주세요/)).toBeInTheDocument();
  });

  it("6개의 PIN 인디케이터가 렌더링된다", () => {
    const { container } = render(
      <PinPad
        title="PIN 번호 설정"
        pin=""
        onInput={mockOnInput}
        onDelete={mockOnDelete}
      />
    );

    const indicators = container.querySelectorAll(
      ".w-3\\.5.h-3\\.5.rounded-full"
    );
    expect(indicators).toHaveLength(6);
  });

  it("입력된 PIN 길이만큼 인디케이터가 활성화된다", () => {
    const { container } = render(
      <PinPad
        title="PIN 번호 설정"
        pin="123"
        onInput={mockOnInput}
        onDelete={mockOnDelete}
      />
    );

    const allIndicators = Array.from(
      container.querySelectorAll(".w-3\\.5.h-3\\.5.rounded-full")
    );
    const activeIndicators = allIndicators.filter((el) =>
      el.classList.contains("bg-main")
    );
    const inactiveIndicators = allIndicators.filter((el) =>
      el.classList.contains("bg-gray-100")
    );

    expect(activeIndicators).toHaveLength(3);
    expect(inactiveIndicators).toHaveLength(3);
  });

  it("숫자 버튼 (0-9)이 렌더링된다", () => {
    render(
      <PinPad
        title="PIN 번호 설정"
        pin=""
        onInput={mockOnInput}
        onDelete={mockOnDelete}
      />
    );

    for (let i = 0; i <= 9; i++) {
      expect(
        screen.getByRole("button", { name: i.toString() })
      ).toBeInTheDocument();
    }
  });

  it("숫자 버튼 클릭 시 onInput이 호출된다", () => {
    render(
      <PinPad
        title="PIN 번호 설정"
        pin=""
        onInput={mockOnInput}
        onDelete={mockOnDelete}
      />
    );

    const button5 = screen.getByRole("button", { name: "5" });
    fireEvent.click(button5);

    expect(mockOnInput).toHaveBeenCalledWith(5);
  });

  it("삭제 버튼이 렌더링된다", () => {
    const { container } = render(
      <PinPad
        title="PIN 번호 설정"
        pin=""
        onInput={mockOnInput}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = container.querySelector("button svg")?.parentElement;
    expect(deleteButton).toBeInTheDocument();
  });

  it("삭제 버튼 클릭 시 onDelete가 호출된다", () => {
    const { container } = render(
      <PinPad
        title="PIN 번호 설정"
        pin="123"
        onInput={mockOnInput}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = container.querySelector("button svg")?.parentElement;
    if (deleteButton) fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it("그리드 레이아웃이 올바르게 구성된다", () => {
    const { container } = render(
      <PinPad
        title="PIN 번호 설정"
        pin=""
        onInput={mockOnInput}
        onDelete={mockOnDelete}
      />
    );

    const grid = container.querySelector(".grid.grid-cols-3");
    expect(grid).toBeInTheDocument();
  });
});
