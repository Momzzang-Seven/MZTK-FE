import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { SimpleHeader } from "@components/layout";
import { CommentItem, CommentInput, FreePostCard } from "@components/community";
import { LoadingSpinner } from "@components/common";
import type { Comment, FreePost } from "@types";
import { useCommentService, useInfiniteScroll, usePostService } from "@hooks";

const FreePostDetail = () => {
  const { postId } = useParams();
  const postIdNum = Number(postId);

  const [post, setPost] = useState<FreePost | null>(null);
  const [writingComment, setWritingComment] = useState("");
  const [parentCommentId, setParentCommentId] = useState<number | undefined>(
    undefined
  );
  const [parentCommentNickname, setParentCommentNickname] = useState<
    string | null
  >(null);

  const { getPost, isPostLoading } = usePostService();
  const { comments, isLoading, isLast, loadMore, refetch, createComment } =
    useCommentService<Comment>(postIdNum);

  const observerRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore: !isLast,
    isLoading,
  });

  useEffect(() => {
    const fetchPost = async () => {
      const data = await getPost(postIdNum);
      if (data) setPost(data as FreePost);
    };
    fetchPost();
  }, [getPost, postIdNum]);

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

  if (isPostLoading && !post) {
    return (
      <div className="flex items-center justify-center h-dvh bg-white">
        <LoadingSpinner size="lg" color="text-main" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gray-50/50 pb-28">
      <SimpleHeader title="게시글 상세" />

      <div className="pt-[88px]">
        {post && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 mb-6">
            <FreePostCard post={post} />
          </div>
        )}

        <section className="px-4">
          <div className="flex items-center gap-2 mb-4 px-2">
            <h2 className="text-[17px] font-black text-gray-900">댓글</h2>
            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md text-[12px] font-bold">
              {post?.commentCount}
            </span>
          </div>

          <div className="bg-white rounded-[32px] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-gray-100">
            {comments.map((comment) => (
              <div key={comment.commentId} className="mb-1">
                <CommentItem
                  comment={comment}
                  onUpdateReplySuccess={refetch}
                  onReplyClick={handleStartReply}
                  targetId={postIdNum}
                />
              </div>
            ))}

            {isLoading && comments.length === 0 && (
              <div className="text-center py-6">
                <LoadingSpinner size="sm" color="text-main" />
              </div>
            )}

            {comments.length === 0 && !isLoading && (
              <div className="py-12 text-center">
                <p className="text-gray-400 font-medium text-[14px]">
                  첫 댓글을 남겨보세요.
                </p>
              </div>
            )}

            {!isLast && (
              <div
                ref={observerRef}
                className="flex min-h-20 w-full items-center justify-center"
              >
                {isLoading && <LoadingSpinner size="sm" color="text-main" />}
              </div>
            )}
          </div>
        </section>
      </div>

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
