import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ActionList from "../postActions/ActionList";
import { useUserStore } from "@store";
import type { Web3Execution } from "@types";

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
    handleSignClick,
    isWeb3Executable,
  }: Record<string, (() => void) | boolean | undefined>) => (
    <div data-testid="my-post-actions">
      <button onClick={handleEditClick as () => void}>수정</button>
      <button onClick={handleDeleteClick as () => void}>삭제</button>
      {isWeb3Executable && (
        <button onClick={handleSignClick as () => void}>서명</button>
      )}
      <button onClick={handleCancelClick as () => void}>취소</button>
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

vi.mock("@store", () => ({
  useUserStore: vi.fn(),
}));

describe("ActionList 컴포넌트", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const setup = (props: Record<string, unknown> = {}) => {
    return render(<ActionList type="FREE" id={1} authorId={100} {...props} />);
  };

  const setUserInStore = (userId: number | null) => {
    const user = userId
      ? {
          userId,
          email: "test@test.com",
          nickname: "tester",
          profileImage: "",
          role: "USER",
          walletAddress: "0x123",
        }
      : null;
    vi.mocked(useUserStore).mockImplementation((selector) =>
      selector({ user } as unknown as Parameters<typeof selector>[0])
    );
  };

  describe("기본 렌더링", () => {
    it("더보기 버튼(img alt='더보기') 정상적으로 렌더링된다", () => {
      setUserInStore(null);
      setup();

      const moreBtn = screen.getByAltText("더보기");
      expect(moreBtn).toBeInTheDocument();
    });
  });

  describe("내 글인 경우", () => {
    it("더보기 클릭 시 MyPostActions가 렌더링된다", () => {
      setUserInStore(100); // authorId와 일치하는 userId
      setup({ authorId: 100 });

      fireEvent.click(screen.getByAltText("더보기"));

      expect(screen.getByTestId("my-post-actions")).toBeInTheDocument();
      expect(
        screen.queryByTestId("other-post-actions")
      ).not.toBeInTheDocument();
    });

    it("QnA 답변 Web3 intent는 실제 서명 전 VerifyWallet로만 이동한다", () => {
      setUserInStore(100);
      const execution = {
        resource: {
          type: "ANSWER",
          id: "30",
          status: "PENDING_EXECUTION",
        },
        actionType: "QNA_ANSWER_CREATE",
        executionIntent: {
          id: "intent-30",
          status: "AWAITING_SIGNATURE",
          expiresAt: "2026-05-30T10:00:00",
        },
        execution: {
          mode: "EIP7702",
          signCount: 2,
        },
        signRequest: null,
      };

      setup({
        type: "ANSWER",
        id: 30,
        parentPostId: 7,
        authorId: 100,
        isWeb3Executable: true,
        Web3Execution: execution,
      });
      fireEvent.click(screen.getByAltText("더보기"));
      fireEvent.click(screen.getByText("서명"));

      expect(mockNavigate).toHaveBeenCalledWith("/verify-wallet/answer/30/7", {
        state: { intent: execution },
      });
    });

    it("복구가 막힌 QnA Web3 상태는 서명 버튼 대신 지연 안내를 보여준다", () => {
      setUserInStore(100);

      setup({
        type: "ANSWER",
        id: 30,
        parentPostId: 7,
        authorId: 100,
        isWeb3Executable: true,
        Web3Execution: {
          resource: {
            type: "ANSWER",
            id: "30",
            status: "PENDING_EXECUTION",
          },
          actionType: "QNA_ANSWER_CREATE",
          executionIntent: {
            id: "intent-30",
            status: "PENDING_ONCHAIN",
            expiresAt: "2026-05-30T10:00:00",
          },
          execution: {
            mode: "EIP7702",
            signCount: 2,
          },
          signRequest: null,
          transaction: {
            id: 1,
            status: "UNCONFIRMED",
            txHash: null,
          },
          recoveryStatus: "ONCHAIN_UNCERTAIN",
          retryAllowed: false,
        },
      });
      fireEvent.click(screen.getByAltText("더보기"));

      expect(
        screen.getByText("블록체인 확인이 지연되고 있습니다.")
      ).toBeInTheDocument();
      expect(screen.queryByText("서명")).not.toBeInTheDocument();
    });
  });

  describe("남의 글인 경우", () => {
    it("더보기 클릭 시 OtherPostActions가 렌더링된다", () => {
      setUserInStore(200); // authorId와 다른 userId
      setup({ authorId: 100 });

      fireEvent.click(screen.getByAltText("더보기"));

      expect(screen.getByTestId("other-post-actions")).toBeInTheDocument();
      expect(screen.queryByTestId("my-post-actions")).not.toBeInTheDocument();
    });
  });

  describe("수정 버튼 동작", () => {
    beforeEach(() => {
      setUserInStore(100); // 내 단일 권한
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
      setUserInStore(100);
      setup({ type: "COMMENT", authorId: 100 });

      fireEvent.click(screen.getByAltText("더보기"));
      fireEvent.click(screen.getByText("수정"));

      expect(screen.getByTestId("edit-comment")).toBeInTheDocument();
      expect(screen.queryByTestId("my-post-actions")).not.toBeInTheDocument();
    });
  });

  describe("삭제 플로우", () => {
    it("삭제 클릭 시 ConfirmDelete 렌더링되고, 확인 클릭 시 모달이 닫힌다", async () => {
      setUserInStore(100);
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
      setUserInStore(200); // 남의 글
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
      setUserInStore(200); // 남의 글
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

  describe("답변 채택 서명 플로우", () => {
    it("서명 정보가 만료되어도 VerifyWallet 이동을 위한 서명 버튼을 노출한다", () => {
      setUserInStore(100);
      const web3Execution: Web3Execution = {
        resource: {
          type: "QUESTION",
          id: "321",
          status: "PENDING_EXECUTION",
        },
        actionType: "QNA_ANSWER_ACCEPT",
        executionIntent: {
          id: "intent-1",
          status: "AWAITING_SIGNATURE",
          expiresAt: "2026-05-30T10:00:00",
        },
        execution: {
          mode: "EIP7702",
          signCount: 2,
        },
        signRequest: null,
        signRequestUnavailableReason: "AUTH_EXPIRED",
      };

      setup({
        type: "QUESTION",
        id: 321,
        authorId: 100,
        isWeb3Executable: true,
        Web3Execution: web3Execution,
      });
      fireEvent.click(screen.getByAltText("더보기"));

      expect(screen.getByText("서명")).toBeInTheDocument();
    });

    it("서명 정보가 유효하면 서명 버튼을 노출한다", () => {
      setUserInStore(100);
      const web3Execution: Web3Execution = {
        resource: {
          type: "QUESTION",
          id: "321",
          status: "PENDING_EXECUTION",
        },
        actionType: "QNA_ANSWER_ACCEPT",
        executionIntent: {
          id: "intent-1",
          status: "AWAITING_SIGNATURE",
          expiresAt: "2026-05-30T10:00:00",
        },
        execution: {
          mode: "EIP7702",
          signCount: 2,
        },
        signRequest: {
          authorization: {
            chainId: 84532,
            delegateTarget: "0x1111111111111111111111111111111111111111",
            authorityNonce: 1,
            payloadHashToSign: "0xauth",
          },
          submit: {
            executionDigest: "0xsubmit",
            deadlineEpochSeconds: 1,
          },
          transaction: null,
        },
      };

      setup({
        type: "QUESTION",
        id: 321,
        authorId: 100,
        isWeb3Executable: true,
        Web3Execution: web3Execution,
      });
      fireEvent.click(screen.getByAltText("더보기"));

      expect(screen.getByText("서명")).toBeInTheDocument();
    });
  });
});
