import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MyActivity from "@pages/MyActivity";

type MockTab = "written" | "liked" | "commented";

vi.mock("@components/my", () => ({
  MyPostCard: () => <article data-testid="my-post-card" />,
}));

vi.mock("@hooks", async () => {
  const React = await vi.importActual<typeof import("react")>("react");

  return {
    useMyPosts: () => {
      const [activeTab, setActiveTab] = React.useState<MockTab>("written");

      return {
        activeTab,
        activeType: "FREE",
        posts: [],
        isLoading: false,
        hasMore: false,
        error: null,
        switchTab: setActiveTab,
        switchType: vi.fn(),
        loadMore: vi.fn(),
      };
    },
  };
});

class MockIntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

const renderActivity = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/my/activity/:tab" element={<MyActivity />} />
      </Routes>
    </MemoryRouter>
  );

describe("MyActivity deep links", () => {
  beforeEach(() => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ["/my/activity/liked", "좋아요한 글"],
    ["/my/activity/commented", "댓글 단 글"],
    ["/my/activity/likes", "좋아요한 글"],
    ["/my/activity/comments", "댓글 단 글"],
  ])("syncs %s to the initial active tab", async (path, heading) => {
    renderActivity(path);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: heading })
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("heading", { name: "내가 쓴 글" })
    ).not.toBeInTheDocument();
  });
});
