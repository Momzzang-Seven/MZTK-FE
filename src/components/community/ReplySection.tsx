import { useEffect, useRef } from "react";
import { useReplyService } from "@hooks";
import { CommentItem } from "@components/community";
import { LoadingSpinner } from "@components/common";
import type { Comment } from "@types";

interface ReplySectionProps {
  isOpen: boolean;
  parentId: number;
  replyCount: number;
  onReplyClick: (commentId: number, nickname: string) => void;
  targetId: number;
  isAnswer?: boolean;
}

const ReplySection = ({
  isOpen,
  parentId,
  replyCount,
  onReplyClick,
  targetId,
  isAnswer = false,
}: ReplySectionProps) => {
  const { replies, isLoading, isLast, refetch, getReplies, loadMore } =
    useReplyService<Comment>(parentId);

  const prevReplyCountRef = useRef<number>(replyCount);

  useEffect(() => {
    if (isOpen && replies.length === 0) {
      getReplies(true);
    }
  }, [isOpen, replies.length, getReplies]);

  // replyCount가 증가하면 새 답글이 달린 것으로 보고 목록을 갱신한다.
  useEffect(() => {
    if (!isOpen) {
      prevReplyCountRef.current = replyCount;
      return;
    }
    if (replyCount > prevReplyCountRef.current && replies.length > 0) {
      refetch();
    }
    prevReplyCountRef.current = replyCount;
  }, [replyCount, isOpen, replies.length, refetch]);

  if (replyCount === 0) return null;

  if (!isOpen) return null;

  if (isLoading && replies.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 ml-10">
        <LoadingSpinner size="md" color="text-gray-400" />
      </div>
    );
  }

  return (
    <div className="ml-15">
      {replies.map((reply) => (
        <CommentItem
          key={reply.commentId}
          comment={reply}
          isRootComment={false}
          onUpdateReplySuccess={refetch}
          onReplyClick={onReplyClick}
          targetId={targetId}
          isAnswer={isAnswer}
        />
      ))}
      {!isLast && !isLoading && (
        <div
          onClick={loadMore}
          className="cursor-pointer text-sm text-gray-500"
        >
          답글 더보기
        </div>
      )}
      {isLoading && (
        <div className="text-xs text-gray-500 mt-2">로딩 중...</div>
      )}
    </div>
  );
};

export default ReplySection;
