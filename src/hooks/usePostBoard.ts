import { useState, useCallback, useEffect } from "react";
import type { PostType, FreePost, QuestionPost } from "@types";
import { postService } from "@services";
import { getKoreanErrorMessageFromError } from "@constant";

const PAGE_SIZE = 5;

export const usePostBoard = <T extends FreePost | QuestionPost>(
  type: PostType,
  tag?: string,
  search?: string
) => {
  const [posts, setPosts] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(
    async (isRefresh: boolean) => {
      setIsLoading(true);
      setError(null);
      try {
        const cursor = isRefresh ? null : nextCursor;
        const data = await postService.getPosts(
          type,
          tag,
          search,
          cursor,
          PAGE_SIZE
        );
        const newPosts = data.posts as T[];

        setPosts((prev) => (isRefresh ? newPosts : [...prev, ...newPosts]));
        setHasMore(data.hasNext);
        setNextCursor(data.nextCursor);
      } catch (error) {
        setError(
          getKoreanErrorMessageFromError(error, "게시물 조회에 실패했습니다.")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [type, tag, search, nextCursor]
  );

  useEffect(() => {
    setPosts([]);
    setNextCursor(null);
    setHasMore(true);
  }, [tag, search]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    fetchPosts(false);
  }, [isLoading, hasMore, fetchPosts]);

  const refetch = useCallback(async () => {
    await fetchPosts(true);
  }, [fetchPosts]);

  return { posts, isLoading, hasMore, error, fetchPosts, loadMore, refetch };
};
