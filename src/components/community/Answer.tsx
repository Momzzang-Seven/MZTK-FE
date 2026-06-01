import { useState } from "react";
import {
  MessageCircle,
  CheckCircle2,
  Heart,
  Loader2,
  AlertCircle,
  Clock,
  ArrowDown,
} from "lucide-react";
import type { AnswerPost, Comment } from "@types";
import {
  CommentItem,
  CommentInput,
  ActionList,
  QnaContent,
} from "@components/community";
import { LoadingSpinner } from "@components/common";
import { buildImageUrl, formatTimeAgo, replaceImageSrc } from "@utils";
import { useCommentService, usePostService } from "@hooks";

interface AnswerProps {
  answer: AnswerPost;
  parentId: number;
  isSelectable: boolean;
  isEditable: boolean;
  isWeb3Executable: boolean;
}

const Answer = ({
  answer,
  parentId: parenPostId,
  isSelectable,
  isEditable,
  isWeb3Executable,
}: AnswerProps) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);
  const [writingComment, setWritingComment] = useState("");

  const [parentCommentId, setParentCommentId] = useState<number | undefined>(
    undefined
  );
  const [parentCommentNickname, setParentCommentNickname] = useState<
    string | null
  >(null);

  const {
    comments,
    isLoading,
    refetch,
    fetchComments,
    createComment,
    loadMore,
    isLast,
    error,
  } = useCommentService<Comment>(
    answer.answerId,
    true,
    {
      autoFetch: false,
    },
    5
  );

  const { likePost, unlikePost } = usePostService();
  const [liked, setLiked] = useState(answer.isLiked);
  const [likeCount, setLikeCount] = useState(answer.likeCount);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLiked = !liked;
    if (liked) {
      unlikePost(parenPostId, answer.answerId);
    } else {
      likePost(parenPostId, answer.answerId);
    }

    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : prev - 1));
  };

  const processedContent = answer.content
    ? replaceImageSrc(
        answer.content,
        answer.images.map((image) => ({
          imageUrl: buildImageUrl(image.imageUrl),
        }))
      )
    : "";

  const getStatusConfig = (resStatus: string, intentStatus: string) => {
    if (resStatus === "COMPLETED") return null;
    if (resStatus === "FAILED")
      return {
        label: "처리 실패",
        color: "bg-red-50 text-red-500 border-red-100",
        icon: <AlertCircle size={12} strokeWidth={3} />,
      };
    if (intentStatus === "AWAITING_SIGNATURE")
      return {
        label: "서명 대기",
        color: "bg-blue-50 text-blue-500 border-blue-100",
        icon: <Clock size={12} strokeWidth={3} />,
      };
    if (resStatus === "PENDING_EXECUTION" || resStatus === "PENDING_ONCHAIN")
      return {
        label: "처리 중",
        color: "bg-amber-50 text-amber-500 border-amber-100",
        icon: <Loader2 size={12} strokeWidth={3} className="animate-spin" />,
      };
    return null;
  };

  const statusConfig = answer.web3Execution
    ? getStatusConfig(
        answer.web3Execution.resource.status,
        answer.web3Execution.executionIntent.status
      )
    : null;

  const toggleComment = async () => {
    const nextState = !isCommentsOpen;
    setIsCommentsOpen(nextState);

    if (nextState && !hasLoadedComments) {
      setHasLoadedComments(true);
      const isLoaded = await fetchComments(true);
      if (!isLoaded) setHasLoadedComments(false);
    }
  };

  const handleStartReply = (commentId: number, nickname: string) => {
    setParentCommentId(commentId);
    setParentCommentNickname(nickname);
  };

  const handleCommentSubmit = async () => {
    if (!writingComment.trim()) return;

    await createComment({
      content: writingComment,
      parentId: parentCommentId,
    });

    setWritingComment("");
    setParentCommentId(undefined);
    setParentCommentNickname(null);

    if (!parentCommentId) refetch();
  };

  return (
    <div
      className={`flex flex-col gap-4 p-5 transition-all duration-500 border-b border-gray-50 ${
        answer.isAccepted
          ? "bg-green-50/30 border-l-4 border-green-500 relative overflow-hidden"
          : "bg-white"
      }`}
    >
      {/* Accepted Badge */}
      {answer.isAccepted && (
        <div className="flex items-center gap-1.5 text-green-600 mb-1">
          <CheckCircle2 size={16} strokeWidth={3} />
          <span className="text-[13px] font-black tracking-tight">
            질문자 채택 답변
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={answer.profileImageUrl || "/icon/defaultUser.svg"}
            alt={answer.nickname}
            className={`h-10 w-10 rounded-full ring-2 ring-gray-50 ${
              answer.profileImageUrl ? "object-cover" : "bg-main p-1.5"
            }`}
          />
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-gray-900">
              {answer.nickname}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">
              {formatTimeAgo(answer.createdAt)}
            </span>
          </div>
        </div>

        <ActionList
          size="sm"
          type="ANSWER"
          parentPostId={parenPostId}
          id={answer.answerId}
          authorId={answer.userId}
          answerContent={answer.content}
          answerImages={answer.images}
          isSelectable={isSelectable}
          isEditable={isEditable}
          isWeb3Executable={isWeb3Executable}
          Web3Execution={answer.web3Execution}
        />
      </div>

      {/* Content */}
      <div className="text-[15px] text-gray-800 leading-relaxed py-1">
        {processedContent && <QnaContent content={processedContent} />}
      </div>

      {/* Images */}
      {answer.images && answer.images.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-gray-100">
          <img
            src={buildImageUrl(answer.images[0].imageUrl)}
            alt="answer"
            className="w-full object-cover max-h-[300px]"
          />
        </div>
      )}

      {/* Footer Stats */}
      <div className="flex items-center gap-4 mt-1">
        <div
          onClick={handleLikeClick}
          className="flex items-center gap-2 text-gray-400 group cursor-pointer"
        >
          <div
            className={`p-1 rounded-full transition-colors group-hover/btn:bg-gray-100 hover:bg-red-50`}
          >
            <Heart
              size={20}
              strokeWidth={2.5}
              className={`transition-all ${
                liked ? "fill-red-500 text-red-500 scale-110" : "text-gray-400"
              }`}
            />
          </div>
          <span
            className={`text-[14px] font-black ${liked ? "text-red-500" : "text-gray-500"}`}
          >
            {likeCount}
          </span>
        </div>

        <button
          onClick={toggleComment}
          className="flex items-center gap-2 text-gray-400 hover:text-main transition-colors active:scale-95 group"
        >
          <div
            className={`p-2 rounded-full transition-colors hover:bg-main/10 ${isCommentsOpen ? "text-main" : "group-hover:bg-gray-100"}`}
          >
            <MessageCircle size={20} strokeWidth={2.5} />
          </div>
          <span
            className={`text-[14px] font-black ${isCommentsOpen ? "text-main" : "text-gray-500"}`}
          >
            {answer.commentCount}
          </span>
        </button>

        {statusConfig && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border ml-auto animate-in fade-in slide-in-from-right-2 duration-500 ${statusConfig.color}`}
          >
            {statusConfig.icon}
            {statusConfig.label}
          </div>
        )}
      </div>

      {/* Comments Section */}
      {isCommentsOpen && (
        <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-gray-50/50 rounded-[24px] p-4 border border-gray-100">
            <CommentInput
              isAnswerPost={true}
              setParentId={setParentCommentId}
              writingComment={writingComment}
              setWritingComment={setWritingComment}
              parentNickname={parentCommentNickname}
              setParentNickname={setParentCommentNickname}
              handleCommentSubmit={handleCommentSubmit}
            />

            {isLoading && comments.length === 0 ? (
              <div className="py-8">
                <LoadingSpinner size="md" color="text-main" />
              </div>
            ) : (
              <div className="mt-4 space-y-1">
                {comments.length === 0 && (
                  <p className="text-[13px] text-gray-400 text-center py-4 font-medium">
                    아직 댓글이 없습니다.
                  </p>
                )}

                {comments.map((comment) => (
                  <CommentItem
                    key={comment.commentId}
                    comment={comment}
                    onUpdateReplySuccess={refetch}
                    onReplyClick={handleStartReply}
                    targetId={answer.answerId}
                    isAnswer={true}
                    isRootComment={true}
                  />
                ))}
                {!isLast && !isLoading && (
                  <div
                    onClick={loadMore}
                    className="flex rounded-full items-center justify-center py-1 gap-2 cursor-pointer text-sm text-gray-500 hover:text-main"
                  >
                    <ArrowDown size={20} strokeWidth={2.5} />
                    <span>댓글 더보기</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="text-[12px] text-red-400 mt-2 text-center">
              댓글을 불러오던 중 오류가 발생했습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
export default Answer;
