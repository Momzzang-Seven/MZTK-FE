import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuestionPostRewardSelector from "../newPost/QuestionPostRewardSelector";

vi.mock("@hooks", () => ({
  useTokenBalance: () => ({ balance: 80 }),
}));

describe("QuestionPostRewardSelector edge validation", () => {
  const setReward = vi.fn();

  beforeEach(() => {
    setReward.mockClear();
  });

  it("rejects precision-loss decimal rewards", () => {
    render(<QuestionPostRewardSelector reward={0} setReward={setReward} />);

    fireEvent.change(screen.getByPlaceholderText("0"), {
      target: { value: "1.000000000000000001" },
    });

    expect(setReward).not.toHaveBeenCalled();
  });

  it("rejects exponent notation rewards", () => {
    render(<QuestionPostRewardSelector reward={0} setReward={setReward} />);

    fireEvent.change(screen.getByPlaceholderText("0"), {
      target: { value: "1e2" },
    });

    expect(setReward).not.toHaveBeenCalled();
  });
});
