import { useEffect } from "react";
import { useReplyService } from "@hooks";
import { CommentItem } from "@components/community";
import type { Comment } from "@types";

interface ReplySectionProps {
  isOpen: boolean;
  parentId: number;
  replyCount: number;
}

const ReplySection = ({ isOpen, parentId, replyCount }: ReplySectionProps) => {
  const { replies, isLoading, isLast, refetch, getReplies, loadMore } = useReplyService<Comment>(parentId);

  useEffect(() => {
    if (isOpen && replies.length === 0) {
      getReplies(true);
    }
  }, [isOpen, replies.length]);

  if (replyCount === 0) return null;
  
  if (!isOpen) return null;

  return (
    <div className="ml-15">
      {replies.map((reply) => (
        <CommentItem
          key={reply.commentId}
          comment={reply}
          showProfileImage={false}
          onUpdateReplySuccess={refetch}
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
      {isLoading && <div className="text-xs text-gray-500 mt-2">로딩 중...</div>}
    </div>
  );
};

export default ReplySection;