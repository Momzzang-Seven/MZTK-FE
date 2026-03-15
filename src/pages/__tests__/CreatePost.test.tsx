import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CreatePost from "../community/CreatePost";
import { useNavigate, useParams } from "react-router-dom";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
}));

vi.mock("@components/common", () => ({
  CommonModal: ({ children, title, onConfirmClick }: any) => (
    <div data-testid="common-modal">
      <h2>{title}</h2>
      <button onClick={onConfirmClick}>confirm</button>
      {children}
    </div>
  ),
}));

vi.mock("@components/layout", () => ({
  SimpleHeader: ({ button }: any) => (
    <header data-testid="simple-header">{button}</header>
  ),
}));

vi.mock("@components/community", () => ({
  NewPostImageUploader: () => <div data-testid="new-post-image-uploader" />,
  NewPostContentInput: ({ onChange }: any) => (
    <input
      data-testid="new-post-content-input"
      onChange={(e) => onChange(e.target.value)}
      placeholder="내용 입력"
    />
  ),
  RewardToken: ({ onClick }: any) => (
    <button data-testid="reward-token" onClick={onClick}>
      RewardToken
    </button>
  ),
  TokenSelect: ({ setReward }: any) => (
    <div data-testid="token-select">
      <button onClick={() => setReward(10)}>Set Reward (10)</button>
    </div>
  ),
}));

vi.mock("@components/community/newPost/NewPostTitleInput", () => ({
  default: ({ onChange }: { onChange: (v: string) => void }) => (
    <input
      data-testid="new-post-title-input"
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

describe("CreatePost", () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
  });

  describe("기본 렌더링 - question 타입", () => {
    beforeEach(() => {
      vi.mocked(useParams).mockReturnValue({ type: "question" });
    });

    it("제목 입력 컴포넌트가 렌더링된다", () => {
      render(<CreatePost />);
      expect(screen.getByTestId("new-post-title-input")).toBeInTheDocument();
    });

    it("RewardToken이 렌더링된다", () => {
      render(<CreatePost />);
      expect(screen.getByTestId("reward-token")).toBeInTheDocument();
    });
  });

  describe("기본 렌더링 - free 타입", () => {
    beforeEach(() => {
      vi.mocked(useParams).mockReturnValue({ type: "free" });
    });

    it("제목 입력 컴포넌트가 렌더링되지 않는다", () => {
      render(<CreatePost />);
      expect(
        screen.queryByTestId("new-post-title-input")
      ).not.toBeInTheDocument();
    });

    it("RewardToken이 렌더링되지 않는다", () => {
      render(<CreatePost />);
      expect(screen.queryByTestId("reward-token")).not.toBeInTheDocument();
    });
  });

  describe("등록 버튼 활성화 로직 - question", () => {
    beforeEach(() => {
      vi.mocked(useParams).mockReturnValue({ type: "question" });
    });

    it("content가 비어있으면 비활성(text-gray-400) 상태이다", () => {
      render(<CreatePost />);
      const submitBtn = screen.getByText("등록하기");
      expect(submitBtn).toHaveClass("text-gray-400");
    });

    it("content만 있고 reward=0이면 비활성 상태이다", () => {
      render(<CreatePost />);
      const contentInput = screen.getByTestId("new-post-content-input");
      fireEvent.change(contentInput, { target: { value: "질문 내용" } });

      const submitBtn = screen.getByText("등록하기");
      expect(submitBtn).toHaveClass("text-gray-400");
    });

    it("content 있고 title 있고 reward>=1이면 활성(text-main) 상태이다", () => {
      render(<CreatePost />);

      const titleInput = screen.getByTestId("new-post-title-input");
      fireEvent.change(titleInput, { target: { value: "질문 제목" } });

      const contentInput = screen.getByTestId("new-post-content-input");
      fireEvent.change(contentInput, { target: { value: "질문 내용" } });

      const rewardTokenBtn = screen.getByTestId("reward-token");
      fireEvent.click(rewardTokenBtn);

      const setRewardBtn = screen.getByText("Set Reward (10)");
      fireEvent.click(setRewardBtn);

      const submitBtn = screen.getByText("등록하기");
      expect(submitBtn).toHaveClass("text-main");
    });
  });

  describe("등록 버튼 활성화 로직 - free", () => {
    beforeEach(() => {
      vi.mocked(useParams).mockReturnValue({ type: "free" });
    });

    it("content가 있으면 활성 상태이다", () => {
      render(<CreatePost />);
      const contentInput = screen.getByTestId("new-post-content-input");
      fireEvent.change(contentInput, { target: { value: "자유게시판 내용" } });

      const submitBtn = screen.getByText("등록하기");
      expect(submitBtn).toHaveClass("text-main");
    });

    it("content가 없으면 비활성 상태이다", () => {
      render(<CreatePost />);
      const submitBtn = screen.getByText("등록하기");
      expect(submitBtn).toHaveClass("text-gray-400");
    });
  });

  describe("등록 클릭", () => {
    it("활성 상태에서 클릭 시 navigate(-1)이 호출된다", () => {
      vi.mocked(useParams).mockReturnValue({ type: "free" });
      render(<CreatePost />);

      // free 타입은 content만 있으면 활성화
      const contentInput = screen.getByTestId("new-post-content-input");
      fireEvent.change(contentInput, { target: { value: "게시글 내용" } });

      const submitBtn = screen.getByText("등록하기");
      fireEvent.click(submitBtn);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it("비활성 상태에서는 클릭해도 navigate가 호출되지 않는다", () => {
      vi.mocked(useParams).mockReturnValue({ type: "question" });
      render(<CreatePost />);

      // 초기 상태에서는 비활성이므로 navigate 호출 X
      const submitBtn = screen.getByText("등록하기");
      fireEvent.click(submitBtn);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("보상 토큰 모달", () => {
    beforeEach(() => {
      vi.mocked(useParams).mockReturnValue({ type: "question" });
    });

    it("RewardToken 클릭 시 CommonModal과 TokenSelect가 렌더링된다", () => {
      render(<CreatePost />);

      const rewardTokenBtn = screen.getByTestId("reward-token");
      fireEvent.click(rewardTokenBtn);

      expect(screen.getByTestId("common-modal")).toBeInTheDocument();
      expect(screen.getByTestId("token-select")).toBeInTheDocument();
    });

    it("confirm 클릭 시 모달이 닫힌다", () => {
      render(<CreatePost />);

      const rewardTokenBtn = screen.getByTestId("reward-token");
      fireEvent.click(rewardTokenBtn);

      // 모달이 열린 상태 확인
      expect(screen.getByTestId("common-modal")).toBeInTheDocument();

      const confirmBtn = screen.getByText("confirm");
      fireEvent.click(confirmBtn);

      // 모달 닫힘 확인
      expect(screen.queryByTestId("common-modal")).not.toBeInTheDocument();
    });
  });
});
