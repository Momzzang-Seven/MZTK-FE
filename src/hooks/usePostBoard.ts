import { useState, useCallback, useEffect } from "react";
import type { PostType, FreePost, QuestionPost } from "@types";
import { postService } from "@services/community";

const PAGE_SIZE = 5;

export const usePostBoard = (type: PostType, tag?: string) => {
  const [posts, setPosts] = useState<FreePost[] | QuestionPost[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // tag 변경 시 목록 초기화
  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
  }, [tag]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const data = await postService.getPosts(type, tag, undefined, page, PAGE_SIZE);
      setPosts((prev) => [
        ...prev,
        ...data.posts,
      ] as FreePost[] | QuestionPost[]);
      setHasMore(data.hasNext);
      setPage((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, page, type, tag]);

  return { posts, isLoading, hasMore, loadMore };
};
