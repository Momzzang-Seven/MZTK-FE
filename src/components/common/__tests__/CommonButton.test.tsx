import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommonButton } from "../CommonButton";

describe("CommonButton", () => {
  it("기본 버튼이 올바르게 렌더링된다", () => {
    render(<CommonButton label="테스트 버튼" />);

    const button = screen.getByRole("button", { name: "테스트 버튼" });
    expect(button).toBeInTheDocument();
  });

  it("클릭 이벤트가 정상적으로 동작한다", () => {
    const handleClick = vi.fn();
    render(<CommonButton label="클릭 버튼" onClick={handleClick} />);

    const button = screen.getByRole("button", { name: "클릭 버튼" });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disabled 상태에서는 클릭이 동작하지 않는다", () => {
    const handleClick = vi.fn();
    render(<CommonButton label="비활성 버튼" onClick={handleClick} disabled />);

    const button = screen.getByRole("button", { name: "비활성 버튼" });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("커스텀 스타일이 적용된다", () => {
    render(
      <CommonButton
        label="스타일 버튼"
        textColor="text-blue-500"
        bgColor="bg-red-500"
        className="w-[200px]"
      />
    );

    const button = screen.getByRole("button", { name: "스타일 버튼" });
    expect(button).toHaveClass("text-blue-500", "bg-red-500", "w-[200px]");
  });

  it("아이콘과 함께 렌더링된다", () => {
    const TestIcon = () => <span data-testid="test-icon">icon</span>;
    render(<CommonButton label="아이콘 버튼" icon={<TestIcon />} />);

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /아이콘 버튼/ })
    ).toBeInTheDocument();
  });

  it("border prop이 적용된다", () => {
    render(
      <CommonButton label="테두리 버튼" border="border border-gray-300" />
    );

    const button = screen.getByRole("button", { name: "테두리 버튼" });
    expect(button).toHaveClass("border");
  });
});
