import { useState, useCallback, useEffect } from "react";
import type { PostType, FreePost, QuestionPost } from "@types";
import { postService } from "@services";

const PAGE_SIZE = 5;

export const usePostBoard = <T extends FreePost | QuestionPost>(type: PostType, tag?: string, search?: string) => {
  const [posts, setPosts] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (targetPage: number, isRefresh: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await postService.getPosts(type, tag, search, targetPage, PAGE_SIZE);
      const newPosts = data.posts as T[];
      
      setPosts((prev) => isRefresh ? newPosts : [...prev, ...newPosts]);
      setHasMore(data.hasNext);
      setPage(targetPage + 1);
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "게시물 수정에 실패했습니다.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [type, tag, search]);

  // tag 변경 시 목록 초기화
  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
  }, [tag, search]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasMore) return;
    fetchPosts(page, false);
  }, [isLoading, hasMore, page, fetchPosts]);

  const refetch = useCallback(async () => {
    await fetchPosts(0, true);
  }, [fetchPosts]);

  return { posts, isLoading, hasMore, error, fetchPosts, loadMore, refetch };
};
