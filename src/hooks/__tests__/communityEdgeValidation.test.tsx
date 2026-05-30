import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCommentService } from "../useCommentService";
import { usePostService } from "../usePostService";
import { usePostStore } from "@store";
import { TEXT_LIMITS } from "@utils";

const {
  mockConfirmImageUpload,
  mockCreateAnswer,
  mockCreateComment,
  mockCreateFreePost,
  mockCreateQuestion,
  mockGetComments,
} = vi.hoisted(() => ({
  mockConfirmImageUpload: vi.fn(),
  mockCreateAnswer: vi.fn(),
  mockCreateComment: vi.fn(),
  mockCreateFreePost: vi.fn(),
  mockCreateQuestion: vi.fn(),
  mockGetComments: vi.fn(),
}));

const mockUseUserStore = vi.hoisted(() => {
  const fn = vi.fn((selector?: (state: unknown) => unknown) => {
    const state = {
      user: {
        userId: 1,
        nickname: "qa-user",
        profileImage: null,
        walletAddress: "0x2222222222222222222222222222222222222222",
      },
    };
    return selector ? selector(state) : state;
  });
  Object.assign(fn, {
    getState: vi.fn(() => ({
      user: {
        walletAddress: "0x2222222222222222222222222222222222222222",
      },
    })),
  });
  return fn;
});

vi.mock("@store", async () => {
  const actual = await vi.importActual<typeof import("@store")>("@store");
  return {
    ...actual,
    useUserStore: mockUseUserStore,
  };
});

vi.mock("@hooks/useWalletService", () => ({
  useWalletService: () => ({
    getAllowance: vi.fn(),
  }),
}));

vi.mock("@services", () => ({
  commentService: {
    createComment: mockCreateComment,
    deleteComment: vi.fn(),
    getComments: mockGetComments,
    updateComment: vi.fn(),
  },
  imageService: {
    confirmImageUpload: mockConfirmImageUpload,
  },
  postService: {
    createAnswer: mockCreateAnswer,
    createFreePost: mockCreateFreePost,
    createQuestion: mockCreateQuestion,
    getPost: vi.fn(),
    updateFreePost: vi.fn(),
    updateQuestion: vi.fn(),
  },
  web3Service: {},
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>{children}</MemoryRouter>
);

describe("community edge validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePostStore.getState().reset();
  });

  it("blocks over-limit comments before the comment service call", async () => {
    const { result } = renderHook(
      () => useCommentService(1, false, { autoFetch: false }),
      { wrapper }
    );

    await act(async () => {
      await result.current.createComment({
        content: "x".repeat(TEXT_LIMITS.comment + 1),
      });
    });

    expect(result.current.error).toBe(
      `Comments must be ${TEXT_LIMITS.comment} characters or fewer.`
    );
    expect(mockCreateComment).not.toHaveBeenCalled();
  });

  it("blocks over-limit free post content before payload creation", async () => {
    act(() => {
      const store = usePostStore.getState();
      store.setPostType("FREE");
      store.setContent("x".repeat(TEXT_LIMITS.freePost + 1));
    });
    const { result } = renderHook(() => usePostService(), { wrapper });

    await act(async () => {
      await result.current.createPost();
    });

    expect(result.current.error).toBe(
      `Content must be ${TEXT_LIMITS.freePost} characters or fewer.`
    );
    expect(mockConfirmImageUpload).not.toHaveBeenCalled();
    expect(mockCreateFreePost).not.toHaveBeenCalled();
  });

  it("blocks over-limit answer content before the answer service call", async () => {
    act(() => {
      const store = usePostStore.getState();
      store.setPostType("ANSWER");
      store.setParentPostId(1);
      store.setContent("x".repeat(TEXT_LIMITS.answer + 1));
    });
    const { result } = renderHook(() => usePostService(), { wrapper });

    await act(async () => {
      await result.current.createPost();
    });

    expect(result.current.error).toBe(
      `Content must be ${TEXT_LIMITS.answer} characters or fewer.`
    );
    expect(mockConfirmImageUpload).not.toHaveBeenCalled();
    expect(mockCreateAnswer).not.toHaveBeenCalled();
  });

  it("blocks over-limit tags before the post service call", async () => {
    act(() => {
      const store = usePostStore.getState();
      store.setPostType("FREE");
      store.setContent("valid content");
      store.setTags(["x".repeat(TEXT_LIMITS.tag + 1)]);
    });
    const { result } = renderHook(() => usePostService(), { wrapper });

    await act(async () => {
      await result.current.createPost();
    });

    expect(result.current.error).toBe(
      `Tags must be ${TEXT_LIMITS.tag} characters or fewer.`
    );
    expect(mockConfirmImageUpload).not.toHaveBeenCalled();
    expect(mockCreateFreePost).not.toHaveBeenCalled();
  });
});
