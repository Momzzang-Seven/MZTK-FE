import { useParams } from "react-router-dom";
import { useState } from "react";
import { SimpleHeader } from "@components/layout";
import { CommentItem, CommentInput } from "@components/community";
import { LoadingSpinner } from "@components/common";
import type { Comment } from "@types";
import { useCommentService, useInfiniteScroll } from "@hooks";

const FreePostDetail = () => {
  const { postId } = useParams();
  const postIdNum = Number(postId);

  const [writingComment, setWritingComment] = useState("");
  const [parentCommentId, setParentCommentId] = useState<number | undefined>(
    undefined
  );
  const [parentCommentNickname, setParentCommentNickname] = useState<
    string | null
  >(null);
  const { comments, isLoading, isLast, loadMore, refetch, createComment } =
    useCommentService<Comment>(postIdNum);
  const observerRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: !isLast,
    isLoading,
  });

  const handleStartReply = (commentId: number, nickname: string) => {
    setParentCommentId(commentId);
    setParentCommentNickname(nickname);
  };

  const handleSubmitComment = async () => {
    if (!writingComment.trim()) return;
    await createComment({ content: writingComment, parentId: parentCommentId });
    setWritingComment("");
    setParentCommentId(undefined);
    setParentCommentNickname(null);
  };

  if (isLoading && comments.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" color="text-gray-400" />
      </div>
    );
  }

  return (
    <div className="pt-20 pb-15">
      <SimpleHeader />

      <section>
        {comments.map((comment) => (
          <div key={comment.commentId} className="mb-1">
            <CommentItem
              comment={comment}
              onUpdateReplySuccess={refetch}
              onReplyClick={handleStartReply}
            />
          </div>
        ))}
        {isLoading && (
          <div className="text-center py-4 text-gray-500">불러오는 중...</div>
        )}
        {!isLast && !isLoading && (
          <div ref={observerRef} className="h-1 w-full" />
        )}
      </section>

      <CommentInput
        setParentId={setParentCommentId}
        writingComment={writingComment}
        setWritingComment={setWritingComment}
        parentNickname={parentCommentNickname}
        setParentNickname={setParentCommentNickname}
        handleCommentSubmit={handleSubmitComment}
      />
    </div>
  );
};

export default FreePostDetail;
