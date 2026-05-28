import { useState, useCallback, useRef } from "react";
import type { Comment } from "@types";
import { commentService } from "@services";

const PAGE_SIZE = 5;

export const useReplyService = <T extends Comment>(parentId: number) => {
  const [replies, setReplies] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLast, setIsLast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeFetchKeyRef = useRef<string | null>(null);

  const getReplies = useCallback(
    async (isRefresh: boolean) => {
      const cursor = isRefresh ? null : nextCursor;
      const fetchKey = `${parentId}:${isRefresh ? "refresh" : (cursor ?? "first")}`;

      if (activeFetchKeyRef.current === fetchKey) return true;

      activeFetchKeyRef.current = fetchKey;
      setIsLoading(true);
      setError(null);
      try {
        const data = await commentService.getReplies(
          parentId,
          cursor,
          PAGE_SIZE
        );
        const newReplies = data.comments as T[];

        setReplies((prev) =>
          isRefresh ? newReplies : [...prev, ...newReplies]
        );
        setIsLast(!data.hasNext);
        setNextCursor(data.nextCursor);
        return true;
      } catch (error) {
        const errorResponse = error as {
          response?: { data?: { message?: string } };
        };
        const message =
          errorResponse.response?.data?.message || "댓글 조회에 실패했습니다.";
        setError(message);
        return false;
      } finally {
        if (activeFetchKeyRef.current === fetchKey) {
          activeFetchKeyRef.current = null;
        }
        setIsLoading(false);
      }
    },
    [parentId, nextCursor]
  );

  const loadMore = useCallback(() => {
    if (isLoading || isLast) return;
    getReplies(false);
  }, [isLoading, isLast, getReplies]);

  const refetch = useCallback(async () => {
    await getReplies(true);
  }, [getReplies]);

  return { replies, isLoading, isLast, error, getReplies, loadMore, refetch };
};
