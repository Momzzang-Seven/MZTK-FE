import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ADMIN_TEXT } from "@constant/admin";
import PostManagement from "../PostManagement";

const mocks = vi.hoisted(() => ({
  fetchPosts: vi.fn(),
  searchPosts: vi.fn(),
  banPost: vi.fn(),
  unbanPost: vi.fn(),
  deleteComment: vi.fn(),
  restoreComment: vi.fn(),
  setPostStatusFilter: vi.fn(),
  showSnackbar: vi.fn(),
}));

vi.mock("@store/adminStore", () => ({
  useAdminStore: () => ({
    filteredPosts: [
      {
        id: 21,
        title: "Restored post",
        content: "Content",
        author: "writer",
        profileColor: "#000000",
        date: "2026-05-29 15:30",
        category: ADMIN_TEXT.POST.BOARD_TYPE.QUESTION,
        isBanned: true,
        publicationStatus: "VISIBLE",
        moderationStatus: "BLOCKED",
        publiclyVisible: false,
        likeCount: 0,
        commentCount: 0,
        answerCount: 3,
        comments: [],
      },
    ],
    fetchPosts: mocks.fetchPosts,
    searchPosts: mocks.searchPosts,
    banPost: mocks.banPost,
    unbanPost: mocks.unbanPost,
    deleteComment: mocks.deleteComment,
    restoreComment: mocks.restoreComment,
    hasMore: false,
    isFetchingPosts: false,
    postStatusFilter: "BANNED",
    setPostStatusFilter: mocks.setPostStatusFilter,
  }),
}));

vi.mock("@store/userStore", () => ({
  useUserStore: () => ({
    showSnackbar: mocks.showSnackbar,
  }),
}));

vi.mock("@hooks/useInfiniteScroll", () => ({
  useInfiniteScroll: vi.fn(() => ({ current: null })),
}));

describe("PostManagement QA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.unbanPost.mockResolvedValue(undefined);
  });

  it("routes post restore clicks through the admin unblock store action", async () => {
    render(
      <BrowserRouter>
        <PostManagement />
      </BrowserRouter>
    );

    fireEvent.click(
      screen.getByRole("button", { name: ADMIN_TEXT.POST.BTN_RESTORE_POST })
    );

    await waitFor(() => {
      expect(mocks.unbanPost).toHaveBeenCalledWith(21);
    });
    expect(mocks.showSnackbar).toHaveBeenCalled();
  });

  it("shows answerCount for QUESTION posts instead of local comments length", () => {
    render(
      <BrowserRouter>
        <PostManagement />
      </BrowserRouter>
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
