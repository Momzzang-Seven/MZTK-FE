import { useParams } from "react-router-dom";
import { useState } from "react";
import { SimpleHeader } from "@components/layout";
import { CommentItem, CommentInput, ReplySection } from "@components/community";
import type { Comment } from "@types";
import { useCommentService, useInfiniteScroll } from "@hooks";

const FreePostDetail = () => {
  const { postId } = useParams();
  const postIdNum = Number(postId);

  const [writingComment, setWritingComment] = useState("");
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const [parentNickname, setParentNickname] = useState<string | null>(null);
  const [openReply, setOpenReply] = useState<number[]>([]);
  const { comments, isLoading, isLast, loadMore, refetch, createComment } = useCommentService<Comment>(postIdNum);
  const observerRef = useInfiniteScroll({ onLoadMore: loadMore, hasMore: !isLast, isLoading });

  const handleStartReply = (commentId: number, nickname: string) => {
    setParentId(commentId);
    setParentNickname(nickname);
    setOpenReply((prev) => [...prev, commentId]);
  };

  const handleSubmitComment = async () => {
    if (!writingComment.trim()) return;
    await createComment({ content: writingComment, parentId });
    setWritingComment("");
    setParentId(undefined);
    setParentNickname(null);
  };

  const toggleOpen = (commentId: number) => {
    setOpenReply((prev) => {
      if (prev.includes(commentId)) {
        return prev.filter((id) => id !== commentId);
      } else {
        return [...prev, commentId];
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-sm text-gray-400">불러오는 중...</span>
      </div>
    );
  }

  return (
    <div className="pb-15">
      <SimpleHeader />

      <section>
        {comments.map((comment) => (
          <div key={comment.commentId} className="mb-1">
            <CommentItem comment={comment} onUpdateReplySuccess={refetch}/>

            <div className="flex gap-4 ml-15 font-semibold text-xs text-gray-500">
              {comment.replyCount > 0 && (
                <div
                  className="cursor-pointer font-semibold text-xs text-gray-500"
                  onClick={() => toggleOpen(comment.commentId)}
                >
                  {openReply.includes(comment.commentId)
                    ? "답글 숨기기"
                    : `답글 펼쳐보기(${comment.replyCount}개)`}
                </div>
              )}
              {comment.writer && 
                <div
                  className="cursor-pointer"
                  onClick={() =>
                    handleStartReply(
                      comment.commentId,
                      comment.writer.nickname
                    )
                  }
                >
                  답글 달기
                </div>
              }
            </div>
            
            <ReplySection 
              isOpen={openReply.includes(comment.commentId)}
              parentId={comment.commentId} 
              replyCount={comment.replyCount}
            />
          </div>
        ))}
        {isLoading && <div className="text-center py-4 text-gray-500">불러오는 중...</div>}
        {!isLast && !isLoading && <div ref={observerRef} className="h-1 w-full" />}
      </section>

      <div>
        <CommentInput
          setParentId={setParentId}
          writingComment={writingComment}
          setWritingComment={setWritingComment}
          parentNickname={parentNickname}
          setParentNickname={setParentNickname}
          handleCommentSubmit={handleSubmitComment}
        />
      </div>
    </div>
  );
};

export default FreePostDetail;
