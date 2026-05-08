import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CommentItem from "../Comment";
import type { Comment } from "@types";

vi.mock("@utils", () => ({
  formatTimeAgo: vi.fn(() => "5분 전"),
}));

vi.mock("@components/community", () => ({
  ActionList: ({ type, id }: { type: string; id: number }) => (
    <div data-testid={`action-list-${type}-${id}`}>ActionList</div>
  ),
}));

describe("Comment", () => {
  const mockOnReplyClick = vi.fn();

  const mockComment: Comment = {
    commentId: 1,
    content: "이것은 테스트 댓글입니다.",
    writer: {
      userId: 123,
      nickname: "테스트유저",
      profileImage: "https://example.com/profile.jpg",
    },
    createdAt: "2024-01-01T12:00:00",
    updatedAt: "2024-01-01T12:00:00",
    isDeleted: false,
    replyCount: 0,
  };

  it("댓글 내용이 렌더링된다", () => {
    render(
      <CommentItem comment={mockComment} onReplyClick={mockOnReplyClick} />
    );

    expect(screen.getByText("이것은 테스트 댓글입니다.")).toBeInTheDocument();
  });

  it("작성자 닉네임이 표시된다", () => {
    render(
      <CommentItem comment={mockComment} onReplyClick={mockOnReplyClick} />
    );

    expect(screen.getByText("테스트유저")).toBeInTheDocument();
  });

  it("프로필 이미지가 표시된다", () => {
    render(
      <CommentItem comment={mockComment} onReplyClick={mockOnReplyClick} />
    );

    const profileImage = screen.getByAltText("테스트유저");
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute(
      "src",
      "https://example.com/profile.jpg"
    );
  });

  it("프로필 이미지가 없을 때 기본 아바타가 표시된다", () => {
    const commentWithoutImage: Comment = {
      ...mockComment,
      writer: {
        ...mockComment.writer,
        profileImage: "",
      },
    };

    const { container } = render(
      <CommentItem
        comment={commentWithoutImage}
        onReplyClick={mockOnReplyClick}
      />
    );

    const defaultAvatar = container.querySelector(
      ".h-10.w-10.rounded-full.bg-main"
    );
    expect(defaultAvatar).toBeInTheDocument();
  });

  it("showProfileImage=false일 때 프로필이 숨겨진다", () => {
    const { container } = render(
      <CommentItem
        comment={mockComment}
        isRootComment={false}
        onReplyClick={mockOnReplyClick}
      />
    );

    const profileImage = screen.queryByAltText("테스트유저");
    expect(profileImage).not.toBeInTheDocument();

    const defaultAvatar = container.querySelector(
      ".h-10.w-10.rounded-full.bg-main"
    );
    expect(defaultAvatar).not.toBeInTheDocument();
  });

  it("formatTimeAgo 함수가 호출되어 시간이 표시된다", () => {
    render(
      <CommentItem comment={mockComment} onReplyClick={mockOnReplyClick} />
    );

    expect(screen.getByText("5분 전")).toBeInTheDocument();
  });

  it("ActionList 컴포넌트가 렌더링된다", () => {
    render(
      <CommentItem comment={mockComment} onReplyClick={mockOnReplyClick} />
    );

    expect(screen.getByTestId("action-list-COMMENT-1")).toBeInTheDocument();
  });

  it("댓글 레이아웃이 올바르게 구성된다", () => {
    const { container } = render(
      <CommentItem comment={mockComment} onReplyClick={mockOnReplyClick} />
    );

    const commentContainer = container.querySelector(".flex.gap-3.p-2");
    expect(commentContainer).toBeInTheDocument();
  });
});
