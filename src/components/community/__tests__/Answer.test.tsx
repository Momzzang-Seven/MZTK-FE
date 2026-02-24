import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Answer from "../Answer";
import { formatTimeAgo } from "@utils";

vi.mock("@utils", () => ({
  formatTimeAgo: vi.fn(),
}));

vi.mock("@components/community", () => ({
  CommentItem: ({ comment }: any) => (
    <div data-testid="mock-comment-item">{comment.content}</div>
  ),
  CommentInput: ({ comment, setComment, handleCommentSubmit }: any) => (
    <div data-testid="mock-comment-input">
      <input
        aria-label="comment input"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button onClick={handleCommentSubmit}>등록</button>
    </div>
  ),
  ActionList: () => <div data-testid="mock-action-list" />,
}));

describe("Answer 컴포넌트", () => {
  const mockAnswer = {
    answerId: 1,
    content: "이것은 답변 내용입니다.",
    createdAt: "2024-02-24T00:00:00Z",
    isAccepted: false,
    commentCount: 5,
    writer: {
      userId: 1,
      nickname: "작성자닉네임",
      profileImage: null,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (formatTimeAgo as any).mockReturnValue("방금 전");
    // 3. fetch는 vi.spyOn(global, "fetch")로 mock 처리
    vi.spyOn(global, "fetch");
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("기본 정보(작성자, 본문, 댓글 수, 시간)가 올바르게 렌더링된다", () => {
    render(<Answer answer={mockAnswer as any} isSelectable={false} />);

    expect(screen.getByText("작성자닉네임")).toBeInTheDocument();
    expect(screen.getByText("이것은 답변 내용입니다.")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // commentCount
    expect(screen.getByText("방금 전")).toBeInTheDocument(); // formatTimeAgo
  });

  it("isAccepted가 true일 때 '✓ 채택된 답변'이 표시된다", () => {
    const acceptedAnswer = { ...mockAnswer, isAccepted: true };
    render(<Answer answer={acceptedAnswer as any} isSelectable={false} />);

    expect(screen.getByText("✓ 채택된 답변")).toBeInTheDocument();
  });

  it("profileImage가 없을 때 기본 이미지를 렌더링한다", () => {
    render(<Answer answer={mockAnswer as any} isSelectable={false} />);
    expect(screen.getByAltText("작성자닉네임")).toHaveAttribute(
      "src",
      "/icon/defaultUser.svg"
    );
  });

  it("profileImage가 존재하면 해당 이미지를 렌더링한다", () => {
    const answerWithProfile = {
      ...mockAnswer,
      writer: { ...mockAnswer.writer, profileImage: "/images/profile.png" },
    };
    render(<Answer answer={answerWithProfile as any} isSelectable={false} />);

    expect(screen.getByAltText("작성자닉네임")).toHaveAttribute(
      "src",
      "/images/profile.png"
    );
  });

  it("댓글 아이콘 클릭 시 댓글 영역이 열리고 닫힌다", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => [{ commentId: 1, content: "댓글 1", replyCount: 0 }],
    });

    render(<Answer answer={mockAnswer as any} isSelectable={false} />);

    expect(screen.queryByTestId("mock-comment-input")).not.toBeInTheDocument();

    const commentToggle = screen.getByAltText("comment");
    fireEvent.click(commentToggle);

    await waitFor(() => {
      expect(screen.getByTestId("mock-comment-input")).toBeInTheDocument();
    });
    expect(screen.getByText("댓글 1")).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith("/data/comments.json");

    fireEvent.click(commentToggle);
    expect(screen.queryByTestId("mock-comment-input")).not.toBeInTheDocument();
  });

  it("댓글이 없을 때 '댓글이 없습니다.' 문구를 표시한다", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => [],
    });

    render(<Answer answer={mockAnswer as any} isSelectable={false} />);

    fireEvent.click(screen.getByAltText("comment"));

    await waitFor(() => {
      expect(screen.getByText("댓글이 없습니다.")).toBeInTheDocument();
    });
  });

  it("replyCount가 0보다 크면 답글 펼쳐보기 버튼이 보이고, 클릭 시 답글을 로드하여 렌더링한다", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        json: async () => [{ commentId: 1, content: "댓글 1", replyCount: 2 }],
      })
      .mockResolvedValueOnce({
        json: async () => [{ commentId: 2, content: "답글 1", replyCount: 0 }],
      });

    render(<Answer answer={mockAnswer as any} isSelectable={false} />);

    fireEvent.click(screen.getByAltText("comment"));

    await waitFor(() => {
      expect(screen.getByText("답글 펼쳐보기 (2개)")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("답글 펼쳐보기 (2개)"));

    await waitFor(() => {
      expect(screen.getByText("답글 1")).toBeInTheDocument();
    });
    expect(global.fetch).toHaveBeenCalledWith("/data/replies.json");
  });

  it("댓글 입력 후 제출하면 console.log가 호출되고 입력창이 초기화된다", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      json: async () => [],
    });

    render(<Answer answer={mockAnswer as any} isSelectable={false} />);

    fireEvent.click(screen.getByAltText("comment"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-comment-input")).toBeInTheDocument();
    });

    const input = screen.getByLabelText("comment input");
    const submitBtn = screen.getByText("등록");

    fireEvent.change(input, { target: { value: "새로운 댓글입니다" } });
    expect(input).toHaveValue("새로운 댓글입니다");

    fireEvent.click(submitBtn);

    expect(console.log).toHaveBeenCalledWith(1, "새로운 댓글입니다");
    expect(input).toHaveValue("");
  });
});
