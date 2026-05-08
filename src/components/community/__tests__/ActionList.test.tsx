import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  beforeAll,
  afterAll,
} from "vitest";
import ActionList from "../postActions/ActionList";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  ...vi.importActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

vi.mock("@components/common", () => ({
  CommonModal: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="common-modal">{children}</div>
  ),
}));

vi.mock("@hooks", () => ({
  usePostService: () => ({
    deletePost: vi.fn().mockResolvedValue(undefined),
    updatePost: vi.fn().mockResolvedValue(undefined),
    createPost: vi.fn().mockResolvedValue(undefined),
    getPost: vi.fn().mockResolvedValue(undefined),
    isSubmitActive: true,
    isLoading: false,
    error: null,
  }),
  useCommentService: () => ({
    updateComment: vi.fn().mockResolvedValue(undefined),
    deleteComment: vi.fn().mockResolvedValue(undefined),
    createComment: vi.fn().mockResolvedValue(undefined),
    fetchComments: vi.fn().mockResolvedValue(undefined),
    comments: [],
    isLoading: false,
    isLast: false,
    error: null,
    loadMore: vi.fn(),
    refetch: vi.fn(),
  }),
}));

vi.mock("@components/community", () => ({
  MyPostActions: ({
    handleEditClick,
    handleDeleteClick,
    handleCancelClick,
  }: Record<string, () => void>) => (
    <div data-testid="my-post-actions">
      <button onClick={handleEditClick}>수정</button>
      <button onClick={handleDeleteClick}>삭제</button>
      <button onClick={handleCancelClick}>취소</button>
    </div>
  ),
  OtherPostActions: ({
    handleSelectClick,
    handleReportClick,
    handleCancelClick,
  }: Record<string, () => void>) => (
    <div data-testid="other-post-actions">
      <button onClick={handleSelectClick}>채택</button>
      <button onClick={handleReportClick}>신고</button>
      <button onClick={handleCancelClick}>취소</button>
    </div>
  ),
  ConfirmSelect: ({
    handleSelectClick,
    handleCancelClick,
  }: Record<string, () => void>) => (
    <div data-testid="confirm-select">
      <button onClick={handleSelectClick}>채택 확인</button>
      <button onClick={handleCancelClick}>취소</button>
    </div>
  ),
  ConfirmDelete: ({
    handleConfirmClick,
    handleCancelClick,
  }: Record<string, () => void>) => (
    <div data-testid="confirm-delete">
      <button onClick={handleConfirmClick}>삭제 확인</button>
      <button onClick={handleCancelClick}>취소</button>
    </div>
  ),
  ConfirmReport: ({
    handleReportClick,
    handleCancelClick,
  }: Record<string, () => void>) => (
    <div data-testid="confirm-report">
      <button onClick={handleReportClick}>신고 확인</button>
      <button onClick={handleCancelClick}>취소</button>
    </div>
  ),
  EditComment: ({
    handleEditClick,
    handleCancelClick,
  }: Record<string, () => void>) => (
    <div data-testid="edit-comment">
      <button onClick={handleEditClick}>수정 완료</button>
      <button onClick={handleCancelClick}>취소</button>
    </div>
  ),
}));

describe("ActionList 컴포넌트", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockGetItem: any;

  beforeAll(() => {
    mockGetItem = vi.spyOn(Storage.prototype, "getItem");
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    mockGetItem.mockRestore();
  });

  const setup = (props: Record<string, unknown> = {}) => {
    return render(<ActionList type="FREE" id={1} authorId={100} {...props} />);
  };

  const setLocalStorageUser = (userId: number | null) => {
    if (userId === null) {
      mockGetItem.mockReturnValue(null);
    } else {
      mockGetItem.mockReturnValue(
        JSON.stringify({ state: { user: { userId } } })
      );
    }
  };

  describe("기본 렌더링", () => {
    it("더보기 버튼(img alt='더보기') 정상적으로 렌더링된다", () => {
      setLocalStorageUser(null);
      setup();

      const moreBtn = screen.getByAltText("더보기");
      expect(moreBtn).toBeInTheDocument();
    });
  });

  describe("내 글인 경우", () => {
    it("더보기 클릭 시 MyPostActions가 렌더링된다", () => {
      setLocalStorageUser(100); // authorId와 일치하는 userId
      setup({ authorId: 100 });

      fireEvent.click(screen.getByAltText("더보기"));

      expect(screen.getByTestId("my-post-actions")).toBeInTheDocument();
      expect(
        screen.queryByTestId("other-post-actions")
      ).not.toBeInTheDocument();
    });
  });

  describe("남의 글인 경우", () => {
    it("더보기 클릭 시 OtherPostActions가 렌더링된다", () => {
      setLocalStorageUser(200); // authorId와 다른 userId
      setup({ authorId: 100 });

      fireEvent.click(screen.getByAltText("더보기"));

      expect(screen.getByTestId("other-post-actions")).toBeInTheDocument();
      expect(screen.queryByTestId("my-post-actions")).not.toBeInTheDocument();
    });
  });

  describe("수정 버튼 동작", () => {
    beforeEach(() => {
      setLocalStorageUser(100); // 내 단일 권한
    });

    it('type이 "free"일 때 수정 클릭 시 navigate("/community/free/edit/{id}/select-image")가 호출된다', () => {
      setup({ type: "FREE", id: 10 });
      fireEvent.click(screen.getByAltText("더보기"));
      fireEvent.click(screen.getByText("수정"));

      expect(mockNavigate).toHaveBeenCalledWith(
        "/community/free/edit/10/select-image"
      );
    });

    it('type이 "question"일 때 수정 클릭 시 navigate("/community/question/edit/{id}")가 호출된다', () => {
      setup({ type: "QUESTION", id: 20, isEditable: true });
      fireEvent.click(screen.getByAltText("더보기"));
      fireEvent.click(screen.getByText("수정"));

      expect(mockNavigate).toHaveBeenCalledWith("/community/question/edit/20");
    });

    it('type이 "answer"일 때 수정 클릭 시 navigate("/community/answer/edit/{id}/{parentPostId}")가 호출된다', () => {
      const answerContent = "답변 본문";
      const answerImages: never[] = [];
      setup({
        type: "ANSWER",
        id: 30,
        parentPostId: 7,
        isEditable: true,
        answerContent,
        answerImages,
      });
      fireEvent.click(screen.getByAltText("더보기"));
      fireEvent.click(screen.getByText("수정"));

      expect(mockNavigate).toHaveBeenCalledWith("/community/answer/edit/30/7", {
        state: { content: answerContent, images: answerImages },
      });
    });
  });

  describe("댓글 수정 케이스", () => {
    it('type이 "comment"일 때 수정 클릭 시 EditComment 모달이 렌더링된다', () => {
      setLocalStorageUser(100);
      setup({ type: "COMMENT", authorId: 100 });

      fireEvent.click(screen.getByAltText("더보기"));
      fireEvent.click(screen.getByText("수정"));

      expect(screen.getByTestId("edit-comment")).toBeInTheDocument();
      expect(screen.queryByTestId("my-post-actions")).not.toBeInTheDocument();
    });
  });

  describe("삭제 플로우", () => {
    it("삭제 클릭 시 ConfirmDelete 렌더링되고, 확인 클릭 시 모달이 닫힌다", async () => {
      setLocalStorageUser(100);
      setup({ authorId: 100 });

      // 더보기 -> 삭제
      fireEvent.click(screen.getByAltText("더보기"));
      fireEvent.click(screen.getByText("삭제"));

      expect(screen.getByTestId("confirm-delete")).toBeInTheDocument();

      // 삭제 확인
      fireEvent.click(screen.getByText("삭제 확인"));

      await waitFor(() => {
        expect(screen.queryByTestId("common-modal")).not.toBeInTheDocument();
      });
    });
  });

  describe("신고 플로우", () => {
    it("신고 클릭 시 ConfirmReport 렌더링되고, 확인 클릭 시 모달이 닫힌다", () => {
      setLocalStorageUser(200); // 남의 글
      setup({ authorId: 100 });

      // 더보기 -> 신고
      fireEvent.click(screen.getByAltText("더보기"));
      fireEvent.click(screen.getByText("신고"));

      expect(screen.getByTestId("confirm-report")).toBeInTheDocument();

      // 신고 확인
      fireEvent.click(screen.getByText("신고 확인"));

      expect(screen.queryByTestId("common-modal")).not.toBeInTheDocument();
    });
  });

  describe("채택 플로우", () => {
    it("채택 버튼 클릭 시 ConfirmSelect 렌더링되고, 확인 클릭 시 모달이 닫힌다", () => {
      setLocalStorageUser(200); // 남의 글
      setup({ authorId: 100 });

      // 더보기 -> 채택
      fireEvent.click(screen.getByAltText("더보기"));
      fireEvent.click(screen.getByText("채택"));

      expect(screen.getByTestId("confirm-select")).toBeInTheDocument();

      // 채택 확인
      fireEvent.click(screen.getByText("채택 확인"));

      expect(screen.queryByTestId("common-modal")).not.toBeInTheDocument();
    });
  });
});
