import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Answer from "../Answer";
import { formatTimeAgo } from "@utils";
import { useCommentService } from "@hooks";

vi.mock("@utils", () => ({
  formatTimeAgo: vi.fn(),
  replaceImageSrc: vi.fn((content: string) => content),
}));

vi.mock("@components/common", () => ({
  LoadingSpinner: () => <div data-testid="mock-loading-spinner" />,
}));

vi.mock("@components/community", () => ({
  CommentItem: ({
    comment,
  }: {
    comment: { content: string; replyCount: number };
  }) => (
    <div data-testid="mock-comment-item">
      <span>{comment.content}</span>
      {comment.replyCount > 0 && (
        <button>답글 펼쳐보기 ({comment.replyCount}개)</button>
      )}
    </div>
  ),
  CommentInput: ({
    writingComment,
    setWritingComment,
    handleCommentSubmit,
  }: {
    writingComment: string;
    setWritingComment: (c: string) => void;
    handleCommentSubmit: () => void;
  }) => (
    <div data-testid="mock-comment-input">
      <input
        aria-label="comment input"
        value={writingComment}
        onChange={(e) => setWritingComment(e.target.value)}
      />
      <button onClick={handleCommentSubmit}>등록</button>
    </div>
  ),
  ActionList: () => <div data-testid="mock-action-list" />,
  QnaContent: ({ content }: { content: string }) => (
    <div data-testid="mock-qna-content">{content}</div>
  ),
}));

const commentServiceState: {
  comments: Array<{ commentId: number; content: string; replyCount: number }>;
  isLoading: boolean;
  error: string | null;
  fetchComments: ReturnType<typeof vi.fn>;
  createComment: ReturnType<typeof vi.fn>;
  refetch: ReturnType<typeof vi.fn>;
} = {
  comments: [],
  isLoading: false,
  error: null,
  fetchComments: vi.fn(),
  createComment: vi.fn(),
  refetch: vi.fn(),
};

vi.mock("@hooks", () => ({
  useCommentService: vi.fn(() => commentServiceState),
}));

describe("Answer 컴포넌트", () => {
  const defaultProps = {
    parentId: 1,
    isSelectable: false,
    isEditable: false,
    isWeb3Executable: false,
  };

  const mockAnswer = {
    answerId: 1,
    userId: 1,
    nickname: "작성자닉네임",
    profileImageUrl: "",
    content: "이것은 답변 내용입니다.",
    createdAt: "2024-02-24T00:00:00Z",
    isAccepted: false,
    commentCount: 5,
    images: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (formatTimeAgo as import("vitest").Mock).mockReturnValue("방금 전");

    commentServiceState.comments = [];
    commentServiceState.isLoading = false;
    commentServiceState.error = null;
    commentServiceState.fetchComments = vi.fn();
    commentServiceState.createComment = vi.fn().mockResolvedValue(undefined);
    commentServiceState.refetch = vi.fn();
    (useCommentService as unknown as import("vitest").Mock).mockReturnValue(
      commentServiceState
    );
  });

  it("기본 정보(작성자, 본문, 댓글 수, 시간)가 올바르게 렌더링된다", () => {
    render(
      <Answer
        answer={mockAnswer as unknown as Parameters<typeof Answer>[0]["answer"]}
        {...defaultProps}
      />
    );

    expect(screen.getByText("작성자닉네임")).toBeInTheDocument();
    expect(screen.getByText("이것은 답변 내용입니다.")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument(); // commentCount
    expect(screen.getByText("방금 전")).toBeInTheDocument(); // formatTimeAgo
  });

  it("isAccepted가 true일 때 '질문자 채택 답변'이 표시된다", () => {
    const acceptedAnswer = { ...mockAnswer, isAccepted: true };
    render(
      <Answer
        answer={
          acceptedAnswer as unknown as Parameters<typeof Answer>[0]["answer"]
        }
        {...defaultProps}
      />
    );

    expect(screen.getByText("질문자 채택 답변")).toBeInTheDocument();
  });

  it("profileImageUrl이 없을 때 기본 이미지를 렌더링한다", () => {
    render(
      <Answer
        answer={mockAnswer as unknown as Parameters<typeof Answer>[0]["answer"]}
        {...defaultProps}
      />
    );
    expect(screen.getByAltText("작성자닉네임")).toHaveAttribute(
      "src",
      "/icon/defaultUser.svg"
    );
  });

  it("profileImageUrl이 존재하면 해당 이미지를 렌더링한다", () => {
    const answerWithProfile = {
      ...mockAnswer,
      profileImageUrl: "/images/profile.png",
    };
    render(
      <Answer
        answer={
          answerWithProfile as unknown as Parameters<typeof Answer>[0]["answer"]
        }
        {...defaultProps}
      />
    );

    expect(screen.getByAltText("작성자닉네임")).toHaveAttribute(
      "src",
      "/images/profile.png"
    );
  });

  it("댓글 아이콘 클릭 시 댓글 영역이 열리고 닫힌다", async () => {
    commentServiceState.comments = [
      { commentId: 1, content: "댓글 1", replyCount: 0 },
    ];

    render(
      <Answer
        answer={mockAnswer as unknown as Parameters<typeof Answer>[0]["answer"]}
        {...defaultProps}
      />
    );

    expect(screen.queryByTestId("mock-comment-input")).not.toBeInTheDocument();

    const commentToggle = screen.getByText(mockAnswer.commentCount.toString());
    fireEvent.click(commentToggle);

    await waitFor(() => {
      expect(screen.getByTestId("mock-comment-input")).toBeInTheDocument();
    });
    expect(screen.getByText("댓글 1")).toBeInTheDocument();

    fireEvent.click(commentToggle);
    expect(screen.queryByTestId("mock-comment-input")).not.toBeInTheDocument();
  });

  it("댓글이 없을 때 '아직 댓글이 없습니다.' 문구를 표시한다", async () => {
    commentServiceState.comments = [];

    render(
      <Answer
        answer={mockAnswer as unknown as Parameters<typeof Answer>[0]["answer"]}
        {...defaultProps}
      />
    );

    fireEvent.click(screen.getByText(mockAnswer.commentCount.toString()));

    await waitFor(() => {
      expect(screen.getByText("아직 댓글이 없습니다.")).toBeInTheDocument();
    });
    expect(commentServiceState.fetchComments).toHaveBeenCalledWith(true);
  });

  it("replyCount가 0보다 큰 댓글에는 답글 펼쳐보기 버튼이 보인다", async () => {
    commentServiceState.comments = [
      { commentId: 1, content: "댓글 1", replyCount: 2 },
    ];

    render(
      <Answer
        answer={mockAnswer as unknown as Parameters<typeof Answer>[0]["answer"]}
        {...defaultProps}
      />
    );

    fireEvent.click(screen.getByText(mockAnswer.commentCount.toString()));

    await waitFor(() => {
      expect(screen.getByText("답글 펼쳐보기 (2개)")).toBeInTheDocument();
    });
  });

  it("댓글 입력 후 제출하면 createComment가 호출되고 입력창이 초기화된다", async () => {
    commentServiceState.comments = [];

    render(
      <Answer
        answer={mockAnswer as unknown as Parameters<typeof Answer>[0]["answer"]}
        {...defaultProps}
      />
    );

    fireEvent.click(screen.getByText(mockAnswer.commentCount.toString()));

    await waitFor(() => {
      expect(screen.getByTestId("mock-comment-input")).toBeInTheDocument();
    });

    const input = screen.getByLabelText("comment input");
    const submitBtn = screen.getByText("등록");

    fireEvent.change(input, { target: { value: "새로운 댓글입니다" } });
    expect(input).toHaveValue("새로운 댓글입니다");

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(commentServiceState.createComment).toHaveBeenCalledWith({
        content: "새로운 댓글입니다",
        parentId: undefined,
      });
    });
    await waitFor(() => {
      expect(input).toHaveValue("");
    });
  });
});
