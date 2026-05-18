import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import QuestionPostForm from "../QuestionPostForm";
import { usePostStore } from "@store";

const useTokenBalanceMock = vi.hoisted(() => vi.fn());

vi.mock("@hooks", () => ({
  useTokenBalance: useTokenBalanceMock,
}));

vi.mock("@components/community", () => ({
  TiptapEditor: () => <div data-testid="mock-editor" />,
  QuestionPostTitle: () => <div data-testid="mock-title" />,
  TagInput: () => <div data-testid="mock-tags" />,
  QuestionPostRewardSelector: () => <div data-testid="mock-reward-selector" />,
  QuestionPostRewardToken: ({
    rewardToken,
    hint,
    tone,
  }: {
    rewardToken: number;
    hint?: string;
    tone?: string;
  }) => (
    <div data-testid="reward-token" data-tone={tone}>
      <span>{hint}</span>
      <span>{rewardToken}</span>
    </div>
  ),
}));

describe("QuestionPostForm", () => {
  beforeEach(() => {
    usePostStore.getState().reset();
    useTokenBalanceMock.mockReset();
  });

  it("질문 보상이 보유 잔액보다 크면 보상 카드에 부족 상태를 표시한다", () => {
    usePostStore.getState().setReward(30);
    useTokenBalanceMock.mockReturnValue({ balance: "10", loading: false });

    render(<QuestionPostForm />);

    expect(screen.getByTestId("reward-token")).toHaveAttribute(
      "data-tone",
      "warning"
    );
    expect(screen.getByText("보유 10 MZTK")).toBeInTheDocument();
  });

  it("잔액 확인 중에는 보상 카드에 로딩 안내를 표시한다", () => {
    usePostStore.getState().setReward(30);
    useTokenBalanceMock.mockReturnValue({ balance: "0", loading: true });

    render(<QuestionPostForm />);

    expect(screen.getByTestId("reward-token")).toHaveAttribute(
      "data-tone",
      "default"
    );
    expect(screen.getByText("보유 잔액 확인 중")).toBeInTheDocument();
  });
});
