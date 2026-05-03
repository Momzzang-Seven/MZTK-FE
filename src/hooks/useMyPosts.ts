import { useState, useCallback } from "react";
import type { MyPost, PostType } from "@types";
import { postService } from "@services";

export type MyPostTab = "written" | "liked" | "commented";

const FETCH_SIZE = 10;
const DEFAULT_TYPE: PostType = "FREE";

export const useMyPosts = () => {
  const [activeTab, setActiveTab] = useState<MyPostTab>("written");
  const [activeType, setActiveType] = useState<PostType>(DEFAULT_TYPE);
  const [posts, setPosts] = useState<MyPost[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(
    async (tab: MyPostTab, type: PostType, nextCursor?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        let data;
        if (tab === "written") {
          data = await postService.getMyPosts(type, nextCursor, FETCH_SIZE);
        } else if (tab === "liked") {
          data = await postService.getMyLikedPosts(type, nextCursor, FETCH_SIZE);
        } else {
          data = await postService.getMyCommentedPosts(type, nextCursor, FETCH_SIZE);
        }

        const fetchedPosts = data?.posts ?? [];
        const fetchedHasNext = data?.hasNext ?? false;
        const fetchedCursor = data?.nextCursor ?? null;

        setPosts((prev) =>
          nextCursor ? [...prev, ...fetchedPosts] : fetchedPosts
        );
        setHasMore(fetchedHasNext);
        setCursor(fetchedCursor ?? undefined);
      } catch {
        setError("게시글을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const switchTab = useCallback(
    (tab: MyPostTab) => {
      setActiveTab(tab);
      setPosts([]);
      setCursor(undefined);
      setHasMore(false);
      void fetchPosts(tab, activeType, undefined);
    },
    [fetchPosts, activeType]
  );

  const switchType = useCallback(
    (type: PostType) => {
      setActiveType(type);
      setPosts([]);
      setCursor(undefined);
      setHasMore(false);
      void fetchPosts(activeTab, type, undefined);
    },
    [fetchPosts, activeTab]
  );

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    void fetchPosts(activeTab, activeType, cursor);
  }, [isLoading, hasMore, activeTab, activeType, cursor, fetchPosts]);

  return {
    activeTab,
    activeType,
    posts,
    isLoading,
    hasMore,
    error,
    switchTab,
    switchType,
    loadMore,
    refetch: () => fetchPosts(activeTab, activeType, undefined),
    initialFetch: () => fetchPosts("written", DEFAULT_TYPE, undefined),
  };
};
