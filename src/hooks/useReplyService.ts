import { useState, useCallback } from "react";
import type { Comment } from "@types"; 
import { commentService } from "@services";

const PAGE_SIZE = 5;

export const useReplyService = <T extends Comment>(parentId: number) => {
  const [replies, setReplies] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReplies = useCallback(async (isRefresh: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const targetPage = isRefresh ? 0 : page;
      const data = await commentService.getReplies(parentId, targetPage, PAGE_SIZE);
      const newReplies = data.content as T[];

      setReplies((prev) => isRefresh ? newReplies : [...prev, ...newReplies]);
      setIsLast(data.last);
      setPage(isRefresh ? 1 : targetPage + 1);
    } catch (error) {
      const errorResponse = error as { response?: { data?: { message?: string } } };
      const message = errorResponse.response?.data?.message || "댓글 조회에 실패했습니다.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  const loadMore = useCallback(() => {
    if (isLoading || isLast) return;
    getReplies(false);
  }, [isLoading, isLast, page, getReplies]);
    
  const refetch = useCallback(async () => {
    await getReplies(true);
  }, [getReplies]);

  return { replies, isLoading, isLast, error, getReplies, loadMore, refetch };
}
