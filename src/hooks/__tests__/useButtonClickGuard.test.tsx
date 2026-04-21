import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useButtonClickGuard } from "../useButtonClickGuard";

const GuardedButtons = ({
  allowRepeat = false,
  onClick,
}: {
  allowRepeat?: boolean;
  onClick: () => void;
}) => {
  const handleClickCapture = useButtonClickGuard();

  return (
    <div onClickCapture={handleClickCapture}>
      <button
        data-click-guard={allowRepeat ? "off" : undefined}
        onClick={onClick}
      >
        테스트 버튼
      </button>
    </div>
  );
};

describe("useButtonClickGuard", () => {
  it("빠른 중복 클릭을 한 번만 처리한다", () => {
    vi.useFakeTimers();
    const handleClick = vi.fn();
    render(<GuardedButtons onClick={handleClick} />);

    const button = screen.getByRole("button", { name: "테스트 버튼" });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it("opt-out 버튼은 연속 클릭을 허용한다", () => {
    const handleClick = vi.fn();
    render(<GuardedButtons allowRepeat onClick={handleClick} />);

    const button = screen.getByRole("button", { name: "테스트 버튼" });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});
