import { useState, useCallback } from "react";
import type { Comment, CommentPayload } from "@types";
import { commentService } from "@services";
import { useUserStore } from "@store";

const PAGE_SIZE = 10;

export const useCommentService = <T extends Comment>(postId: number) => {
  const { user } = useUserStore();
  const [comments, setComments] = useState<T[]>([]);
  const [page, setPage] = useState(0);
  const [isLast, setIsLast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createComment = useCallback(
    async (payload: CommentPayload) => {
      setIsLoading(true);
      setError(null);
      try {
        const newComment = await commentService.createComment(postId, payload);
        if (!payload.parentId) {
          const commentWithWriter = {
            ...newComment,
            writer: {
              ...newComment.writer,
              userId: user?.userId,
              nickname: user?.nickname,
              profileImage: user?.profileImage,
            },
          };
          setComments((prev) => [...prev, commentWithWriter as T]);
        }
        return newComment;
      } catch (error) {
        const errorResponse = error as {
          response?: { data?: { message?: string } };
        };
        const message =
          errorResponse.response?.data?.message || "댓글 작성에 실패했습니다.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [postId, user, setComments]
  );

  const fetchComments = useCallback(
    async (isRefresh: boolean) => {
      setIsLoading(true);
      setError(null);
      try {
        const targetPage = isRefresh ? 0 : page;
        const data = await commentService.getComments(
          postId,
          targetPage,
          PAGE_SIZE
        );
        const newComments = data.content as T[];

        setComments((prev) =>
          isRefresh ? newComments : [...prev, ...newComments]
        );
        setIsLast(data.last);
        setPage(isRefresh ? 1 : targetPage + 1);
      } catch (error) {
        const errorResponse = error as {
          response?: { data?: { message?: string } };
        };
        const message =
          errorResponse.response?.data?.message || "댓글 조회에 실패했습니다.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [postId, page]
  );

  const loadMore = useCallback(() => {
    if (isLoading || isLast) return;
    fetchComments(false);
  }, [isLoading, isLast, fetchComments]);

  const refetch = useCallback(async () => {
    await fetchComments(true);
  }, [fetchComments]);

  const updateComment = useCallback(
    async (commentId: number, content: string) => {
      setIsLoading(true);
      setError(null);
      try {
        await commentService.updateComment(commentId, content);
      } catch (error) {
        const errorResponse = error as {
          response?: { data?: { message?: string } };
        };
        const message =
          errorResponse.response?.data?.message || "댓글 수정에 실패했습니다.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteComment = useCallback(async (commentId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await commentService.deleteComment(commentId);
    } catch (error) {
      const errorResponse = error as {
        response?: { data?: { message?: string } };
      };
      const message =
        errorResponse.response?.data?.message || "댓글 삭제에 실패했습니다.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    comments,
    isLoading,
    isLast,
    error,
    createComment,
    fetchComments,
    loadMore,
    refetch,
    updateComment,
    deleteComment,
  };
};
