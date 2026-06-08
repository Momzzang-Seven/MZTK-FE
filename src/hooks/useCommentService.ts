import { useState, useCallback, useEffect, useRef } from "react";
import type { Comment, CommentPayload } from "@types";
import { commentService } from "@services";
import { useUserStore } from "@store";
import { containsUnsafeMarkup, TEXT_LIMITS } from "@utils";
import { getKoreanErrorMessageFromError } from "@constant";

const PAGE_SIZE = 10;

interface UseCommentServiceOptions {
  autoFetch?: boolean;
}

export const useCommentService = <T extends Comment>(
  targetId: number,
  isAnswer: boolean = false,
  options: UseCommentServiceOptions = {},
  size?: number
) => {
  const { autoFetch = true } = options;
  const { user } = useUserStore();
  const [comments, setComments] = useState<T[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLast, setIsLast] = useState(true); // 초기에는 더 불러올 데이터가 없다고 가정 (첫 로드 전 차단)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeFetchKeyRef = useRef<string | null>(null);

  const createComment = useCallback(
    async (payload: CommentPayload) => {
      const content = payload.content.trim();
      if (!content || content.length > TEXT_LIMITS.comment) {
        setError(`댓글은 ${TEXT_LIMITS.comment}자 이하로 작성해 주세요.`);
        return;
      }
      if (containsUnsafeMarkup(content)) {
        setError("스크립트 형태의 댓글은 작성할 수 없습니다.");
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const newComment = await commentService.createComment(
          targetId,
          { ...payload, content },
          isAnswer
        );
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
        } else {
          // 답글이 달린 부모 댓글의 replyCount를 낙관적으로 증가시킨다.
          // ReplySection이 이 변화를 감지해 새 답글을 목록에 반영한다.
          setComments((prev) =>
            prev.map((c) =>
              c.commentId === payload.parentId
                ? { ...c, replyCount: c.replyCount + 1 }
                : c
            )
          );
        }
        return newComment;
      } catch (error) {
        setError(
          getKoreanErrorMessageFromError(error, "댓글 작성에 실패했습니다.")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [targetId, isAnswer, user, setComments]
  );

  const fetchComments = useCallback(
    async (isRefresh: boolean) => {
      const cursor = isRefresh ? null : nextCursor;
      const fetchKey = `${targetId}:${isAnswer}:${isRefresh ? "refresh" : (cursor ?? "first")}`;

      if (activeFetchKeyRef.current === fetchKey) return true;

      activeFetchKeyRef.current = fetchKey;
      setIsLoading(true);
      setError(null);
      try {
        const data = await commentService.getComments(
          targetId,
          cursor,
          size ?? PAGE_SIZE,
          isAnswer
        );
        const newComments = data.comments as T[];

        setComments((prev) => {
          if (isRefresh) return newComments;

          // ID 중복 제거 로직 추가
          const existingIds = new Set(prev.map((c) => c.commentId));
          const filteredNew = newComments.filter(
            (c) => !existingIds.has(c.commentId)
          );
          return [...prev, ...filteredNew];
        });
        setIsLast(!data.hasNext);
        setNextCursor(data.nextCursor);
        return true;
      } catch (error) {
        setError(
          getKoreanErrorMessageFromError(error, "댓글 조회에 실패했습니다.")
        );
        return false;
      } finally {
        if (activeFetchKeyRef.current === fetchKey) {
          activeFetchKeyRef.current = null;
        }
        setIsLoading(false);
      }
    },
    [targetId, isAnswer, nextCursor]
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
      const nextContent = content.trim();
      if (!nextContent || nextContent.length > TEXT_LIMITS.comment) {
        setError(`댓글은 ${TEXT_LIMITS.comment}자 이하로 작성해 주세요.`);
        return;
      }
      if (containsUnsafeMarkup(nextContent)) {
        setError("스크립트 형태의 댓글은 작성할 수 없습니다.");
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        await commentService.updateComment(
          commentId,
          nextContent,
          targetId,
          isAnswer
        );
      } catch (error) {
        setError(
          getKoreanErrorMessageFromError(error, "댓글 수정에 실패했습니다.")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [targetId, isAnswer]
  );

  const deleteComment = useCallback(
    async (commentId: number) => {
      setIsLoading(true);
      setError(null);
      try {
        await commentService.deleteComment(commentId, targetId, isAnswer);
      } catch (error) {
        setError(
          getKoreanErrorMessageFromError(error, "댓글 삭제에 실패했습니다.")
        );
      } finally {
        setIsLoading(false);
      }
    },
    [targetId, isAnswer]
  );

  // 초기 데이터 로드
  useEffect(() => {
    if (autoFetch && targetId) {
      fetchComments(true);
    }
  }, [autoFetch, targetId, isAnswer]);

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
