import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@services/client";
import { useAdminStore } from "@store/adminStore";

const apiResponse = <T>(data: T) => ({ data: { data } });

const emptyPage = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
  numberOfElements: 0,
  empty: true,
};

describe("admin store QA", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(api, "get").mockImplementation(vi.fn());
    vi.spyOn(api, "post").mockImplementation(vi.fn());
    useAdminStore.setState({
      posts: [],
      filteredPosts: [],
      searchPostQuery: "",
      postStatusFilter: "ALL",
      page: 1,
      hasMore: true,
      isFetchingPosts: false,
    });
  });

  it("queries banned admin board posts by moderationStatus instead of an unsupported status value", async () => {
    vi.mocked(api.get).mockResolvedValueOnce(apiResponse(emptyPage));
    useAdminStore.setState({ postStatusFilter: "BANNED" });

    await useAdminStore.getState().fetchPosts(true);

    expect(api.get).toHaveBeenCalledWith("/admin/boards/posts", {
      params: {
        size: 10,
        page: 0,
        moderationStatus: "BLOCKED",
      },
    });
  });

  it("queries publicly visible admin board posts by publication and moderation state", async () => {
    vi.mocked(api.get).mockResolvedValueOnce(apiResponse(emptyPage));
    useAdminStore.setState({ postStatusFilter: "ACTIVE" });

    await useAdminStore.getState().fetchPosts(true);

    expect(api.get).toHaveBeenCalledWith("/admin/boards/posts", {
      params: {
        size: 10,
        page: 0,
        publicationStatus: "VISIBLE",
        moderationStatus: "NORMAL",
      },
    });
  });

  it("restores an admin board post through the BE unblock contract and stores public visibility", async () => {
    vi.mocked(api.post).mockResolvedValueOnce(
      apiResponse({
        targetId: 21,
        targetType: "POST",
        reasonCode: "OTHER",
        moderated: true,
        publicationStatus: "VISIBLE",
        moderationStatus: "NORMAL",
        publiclyVisible: true,
      })
    );
    useAdminStore.setState({
      posts: [
        {
          id: 21,
          author: "admin",
          date: "2026-05-29 15:30",
          category: "FREE",
          title: "restored post",
          content: "content",
          comments: [],
          profileColor: "#000000",
          isBanned: true,
          publicationStatus: "VISIBLE",
          moderationStatus: "BLOCKED",
          publiclyVisible: false,
          likeCount: 0,
          commentCount: 0,
        },
      ],
      filteredPosts: [],
    });

    await useAdminStore.getState().unbanPost(21);

    expect(api.post).toHaveBeenCalledWith("/admin/boards/posts/21/unblock", {
      reasonCode: "OTHER",
      reasonDetail: "Admin restored post",
    });
    expect(useAdminStore.getState().posts[0]).toMatchObject({
      isBanned: false,
      publicationStatus: "VISIBLE",
      moderationStatus: "NORMAL",
      publiclyVisible: true,
    });
  });
});
