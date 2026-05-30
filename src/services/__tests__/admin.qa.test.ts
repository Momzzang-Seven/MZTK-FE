import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@services/client";
import { fetchPostsList, unblockAdminPost } from "@services/admin";

const apiResponse = <T>(data: T) => ({ data: { data } });

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(api, "get").mockImplementation(vi.fn());
  vi.spyOn(api, "post").mockImplementation(vi.fn());
});

describe("admin board service QA", () => {
  it("passes admin board visibility filters with BE-supported query params", async () => {
    const response = {
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
    vi.mocked(api.get).mockResolvedValueOnce(apiResponse(response));

    await expect(
      fetchPostsList({
        page: 0,
        size: 10,
        publicationStatus: "VISIBLE",
        moderationStatus: "NORMAL",
      })
    ).resolves.toEqual(response);

    expect(api.get).toHaveBeenCalledWith("/admin/boards/posts", {
      params: {
        page: 0,
        size: 10,
        publicationStatus: "VISIBLE",
        moderationStatus: "NORMAL",
      },
    });
  });

  it("restores an admin board post through the BE unblock endpoint and preserves public visibility", async () => {
    const response = {
      targetId: 21,
      targetType: "POST" as const,
      reasonCode: "OTHER",
      moderated: true,
      publicationStatus: "VISIBLE" as const,
      moderationStatus: "NORMAL" as const,
      publiclyVisible: true,
    };
    const request = {
      reasonCode: "OTHER" as const,
      reasonDetail: "Admin restored post",
    };
    vi.mocked(api.post).mockResolvedValueOnce(apiResponse(response));

    await expect(unblockAdminPost(21, request)).resolves.toEqual(response);

    expect(api.post).toHaveBeenCalledWith(
      "/admin/boards/posts/21/unblock",
      request
    );
  });
});
