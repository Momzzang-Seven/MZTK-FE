import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TokenSelector from "../newPost/QuestionPostRewardSelector";

vi.mock("@hooks", () => ({
  useTokenBalance: vi.fn(() => ({ balance: 80 })),
}));

describe("TokenSelect", () => {
  const setRewardMock = vi.fn();

  beforeEach(() => {
    setRewardMock.mockClear();
  });

  describe("기본 렌더링", () => {
    it("10, 30, 50, 100, 200 버튼이 렌더링되어야 한다", () => {
      render(<TokenSelector reward={0} setReward={setRewardMock} />);

      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(5);

      [10, 30, 50, 100, 200].forEach((amount) => {
        expect(
          screen.getByRole("button", { name: String(amount) })
        ).toBeInTheDocument();
      });
    });

    it('"보유: 80 MZTK"이 표시되어야 한다', () => {
      render(<TokenSelector reward={0} setReward={setRewardMock} />);
      expect(screen.getByText("보유: 80 MZTK")).toBeInTheDocument();
    });

    it("직접 입력 input이 렌더링되어야 한다", () => {
      render(<TokenSelector reward={0} setReward={setRewardMock} />);
      expect(screen.getByPlaceholderText("0")).toBeInTheDocument();
    });
  });

  describe("버튼 클릭 동작", () => {
    it("버튼 클릭 시 setReward가 해당 값으로 호출되어야 한다", () => {
      render(<TokenSelector reward={0} setReward={setRewardMock} />);

      const button30 = screen.getByRole("button", { name: "30" });
      fireEvent.click(button30);

      expect(setRewardMock).toHaveBeenCalledTimes(1);
      expect(setRewardMock).toHaveBeenCalledWith(30);
    });

    it("reward prop과 동일한 버튼에 선택 스타일(bg-main)이 적용되어야 한다", () => {
      const { rerender } = render(
        <TokenSelector reward={30} setReward={setRewardMock} />
      );

      let button30 = screen.getByRole("button", { name: "30" });
      expect(button30).toHaveClass("bg-main");

      let button50 = screen.getByRole("button", { name: "50" });
      expect(button50).not.toHaveClass("bg-main");

      // prop이 변경될 경우 스타일이 바뀌는지 추가 검증
      rerender(<TokenSelector reward={50} setReward={setRewardMock} />);
      button30 = screen.getByRole("button", { name: "30" });
      button50 = screen.getByRole("button", { name: "50" });

      expect(button30).not.toHaveClass("bg-main");
      expect(button50).toHaveClass("bg-main");
    });
  });

  describe("비활성화 버튼", () => {
    it("balance(80)보다 큰 버튼은 disabled 상태여야 한다", () => {
      render(<TokenSelector reward={0} setReward={setRewardMock} />);

      // 80 이하 버튼은 활성화 상태
      [10, 30, 50].forEach((amount) => {
        expect(
          screen.getByRole("button", { name: String(amount) })
        ).not.toBeDisabled();
      });

      // 80 초과 버튼은 비활성화 상태
      expect(screen.getByRole("button", { name: "100" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "200" })).toBeDisabled();
    });

    it("disabled 버튼 클릭 시 setReward가 호출되지 않아야 한다", () => {
      render(<TokenSelector reward={0} setReward={setRewardMock} />);

      const button100 = screen.getByRole("button", { name: "100" });
      fireEvent.click(button100);

      expect(setRewardMock).not.toHaveBeenCalled();
    });
  });

  describe("직접 입력", () => {
    it("숫자 입력 시 setReward가 호출되어야 한다", () => {
      render(<TokenSelector reward={0} setReward={setRewardMock} />);

      const input = screen.getByPlaceholderText("0");
      fireEvent.change(input, { target: { value: "50" } });

      expect(setRewardMock).toHaveBeenCalledWith(50);
    });

    it("80 초과 입력 시 80으로 제한되어야 한다", () => {
      render(<TokenSelector reward={0} setReward={setRewardMock} />);

      const input = screen.getByPlaceholderText("0");
      fireEvent.change(input, { target: { value: "100" } });

      expect(setRewardMock).toHaveBeenCalledWith(80);
    });

    it("음수 입력 시 setReward가 호출되지 않아야 한다", () => {
      render(<TokenSelector reward={0} setReward={setRewardMock} />);

      const input = screen.getByPlaceholderText("0");
      fireEvent.change(input, { target: { value: "-10" } });

      expect(setRewardMock).not.toHaveBeenCalled();
    });

    it("숫자가 아닌 값 입력 시 setReward가 호출되지 않아야 한다", () => {
      render(<TokenSelector reward={0} setReward={setRewardMock} />);

      const input = screen.getByPlaceholderText("0");

      fireEvent.change(input, { target: { value: "abc" } });

      expect(setRewardMock).not.toHaveBeenCalled();
    });
  });

  describe("경계값", () => {
    it("0 입력 시 정상 동작해야 한다", () => {
      render(<TokenSelector reward={10} setReward={setRewardMock} />);

      const input = screen.getByPlaceholderText("0");
      fireEvent.change(input, { target: { value: "0" } });

      expect(setRewardMock).toHaveBeenCalledWith(0);
    });

    it("80 입력 시 정상 동작해야 한다", () => {
      render(<TokenSelector reward={0} setReward={setRewardMock} />);

      const input = screen.getByPlaceholderText("0");
      fireEvent.change(input, { target: { value: "80" } });

      expect(setRewardMock).toHaveBeenCalledWith(80);
    });
  });
});
