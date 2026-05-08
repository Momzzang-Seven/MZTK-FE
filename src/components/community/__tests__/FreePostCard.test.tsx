import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FreePostCard from "../FreePostCard";
import { useNavigate } from "react-router-dom";
import { formatTimeAgo } from "@utils";

vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
}));

vi.mock("@utils", () => ({
  formatTimeAgo: vi.fn(),
}));

vi.mock("@components/community", () => ({
  ActionList: () => <div data-testid="mock-action-list" />,
  SharePost: () => <div data-testid="mock-share-post" />,
}));

vi.mock("@hooks", () => ({
  usePostService: () => ({
    likePost: vi.fn().mockResolvedValue(undefined),
    unlikePost: vi.fn().mockResolvedValue(undefined),
  }),
}));

const mockNavigate = vi.fn();

const defaultPost = {
  postId: 1,
  writer: {
    userId: 100,
    nickname: "테스트유저",
    profileImage: "https://example.com/profile.png",
  },
  updatedAt: "2023-10-01T10:00:00Z",
  createdAt: "2023-10-01T10:00:00Z",
  content: "테스트 게시글 내용입니다.",
  images: [
    {
      imageId: 1,
      imageUrl: "https://example.com/post.png",
    },
  ],
  tags: ["react", "frontend"],
  isLiked: false,
  likeCount: 10,
  commentCount: 5,
};

describe("FreePostCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
    (formatTimeAgo as ReturnType<typeof vi.fn>).mockReturnValue("방금 전");
  });

  describe("기본 렌더링", () => {
    it("작성자 닉네임, 게시글 내용, 댓글 수, 작성 시간이 정상적으로 렌더링된다", () => {
      render(<FreePostCard post={defaultPost} />);

      expect(screen.getByText("테스트유저")).toBeInTheDocument();
      expect(screen.getByText("테스트 게시글 내용입니다.")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument(); // commentCount
      expect(screen.getByText("방금 전")).toBeInTheDocument(); // formatTimeAgo 결과
    });
  });

  describe("프로필 이미지 분기", () => {
    it("profileImage가 있을 때 해당 이미지를 렌더링한다", () => {
      render(<FreePostCard post={defaultPost} />);
      const profileImage = screen.getByAltText("테스트유저");

      expect(profileImage).toHaveAttribute(
        "src",
        "https://example.com/profile.png"
      );
    });

    it("profileImage가 없을 때 기본 이미지를 렌더링한다", () => {
      const postWithoutProfile = {
        ...defaultPost,
        writer: { ...defaultPost.writer, profileImage: null },
      };
      render(
        <FreePostCard
          post={
            postWithoutProfile as unknown as Parameters<
              typeof FreePostCard
            >[0]["post"]
          }
        />
      );
      const profileImage = screen.getByAltText("테스트유저");

      expect(profileImage).toHaveAttribute("src", "/icon/defaultUser.svg");
    });
  });

  describe("게시물 이미지 분기", () => {
    it("images가 있을 때 이미지를 렌더링한다", () => {
      render(<FreePostCard post={defaultPost} />);
      const postImage = screen.getByAltText(defaultPost.images[0].imageUrl);

      expect(postImage).toBeInTheDocument();
      expect(postImage).toHaveAttribute("src", "https://example.com/post.png");
    });

    it("images가 없을 때 이미지를 렌더링하지 않는다", () => {
      const postWithoutImage = { ...defaultPost, images: [] };
      render(
        <FreePostCard
          post={
            postWithoutImage as unknown as Parameters<
              typeof FreePostCard
            >[0]["post"]
          }
        />
      );

      expect(
        screen.queryByAltText(defaultPost.images[0].imageUrl)
      ).not.toBeInTheDocument();
    });
  });

  describe("좋아요 동작", () => {
    it("기본적으로 isLiked 상태에 따라 빈 하트 아이콘이 렌더링된다", () => {
      render(<FreePostCard post={defaultPost} />);
      const likeIcon = screen.getByAltText("like");

      expect(likeIcon).toHaveAttribute("src", "/icon/like.svg");
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("isLiked가 true인 경우 채워진 하트 아이콘이 렌더링된다", () => {
      const likedPost = { ...defaultPost, isLiked: true };
      render(
        <FreePostCard
          post={
            likedPost as unknown as Parameters<typeof FreePostCard>[0]["post"]
          }
        />
      );
      const likeIcon = screen.getByAltText("like");

      expect(likeIcon).toHaveAttribute("src", "/icon/likeActive.svg");
    });

    it("좋아요를 클릭하면 아이콘이 변경되고 likeCount가 증가/감소한다", () => {
      render(<FreePostCard post={defaultPost} />);

      const likeIcon = screen.getByAltText("like");

      expect(screen.getByText("10")).toBeInTheDocument();

      fireEvent.click(likeIcon);

      expect(likeIcon).toHaveAttribute("src", "/icon/likeActive.svg");
      expect(screen.getByText("11")).toBeInTheDocument();

      fireEvent.click(likeIcon);

      expect(likeIcon).toHaveAttribute("src", "/icon/like.svg");
      expect(screen.getByText("10")).toBeInTheDocument();
    });
  });

  describe("댓글 클릭", () => {
    it("댓글 영역 클릭 시 상세 페이지로 이동한다", () => {
      render(<FreePostCard post={defaultPost} />);

      const commentIcon = screen.getByAltText("comment");
      fireEvent.click(commentIcon);

      expect(mockNavigate).toHaveBeenCalledWith("/community/free/1");
    });
  });

  describe("태그 클릭", () => {
    it("태그가 정상적으로 렌더링된다", () => {
      render(<FreePostCard post={defaultPost} />);

      expect(screen.getByText("#react")).toBeInTheDocument();
      expect(screen.getByText("#frontend")).toBeInTheDocument();
    });

    it("태그 클릭 시 해당 태그 검색 결과 페이지로 이동한다", () => {
      render(<FreePostCard post={defaultPost} />);

      const reactTag = screen.getByText("#react");
      fireEvent.click(reactTag);

      expect(mockNavigate).toHaveBeenCalledWith("/community/free?tag=react");
    });
  });
});
