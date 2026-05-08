import { useState, useEffect } from "react";
import type { AnswerPost, Comment } from "@types";
import {
  CommentItem,
  CommentInput,
  ActionList,
  QnaContent,
} from "@components/community";
import { LoadingSpinner } from "@components/common";
import { formatTimeAgo, replaceImageSrc } from "@utils";
import { useCommentService } from "@hooks";

interface AnswerProps {
  answer: AnswerPost;
  parentId: number;
  // userId: number | null;
  isSelectable: boolean; // 질문 작성자의 답변 선택 가능 여부
  isEditable: boolean; // 답변 작성자의 수정 가능 여부
  isWeb3Executable: boolean; // 답변 작성자의 web3 실행 가능 여부
}

const Answer = ({
  answer,
  parentId: parenPostId,
  isSelectable,
  isEditable,
  isWeb3Executable,
}: AnswerProps) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [writingComment, setWritingComment] = useState("");

  const [parentCommentId, setParentCommentId] = useState<number | undefined>(
    undefined
  );
  const [parentCommentNickname, setParentCommentNickname] = useState<
    string | null
  >(null);
  const { comments, isLoading, refetch, fetchComments, createComment, error } =
    useCommentService<Comment>(answer.answerId);

  // const isMine = userId !== null && answer.userId === userId;
  // const isWeb3Done = answer.publicationStatus === "VISIBLE" || answer.publicationStatus === "FAILED";

  // const isEditable = isMine && isWeb3Done && !answer.isAccepted;
  // const isWeb3Executable = isMine && !isWeb3Done;
  // const isSelectable = isQuestionMine && isWeb3Done && !isQuestionSolved

  const processedContent = answer.content
    ? replaceImageSrc(answer.content, answer.images)
    : "";

  useEffect(() => {
    if (isCommentsOpen && comments.length === 0) {
      fetchComments(true);
    }
  }, [isCommentsOpen, comments.length, fetchComments]);

  const toggleComment = () => {
    const nextState = !isCommentsOpen;
    setIsCommentsOpen(nextState);
    if (nextState && comments.length === 0) {
      fetchComments(true);
    }
  };

  const handleStartReply = (commentId: number, nickname: string) => {
    setParentCommentId(commentId);
    setParentCommentNickname(nickname);
  };

  const handleCommentSubmit = async () => {
    if (!writingComment.trim()) return;

    // 대댓글인 경우 commentParentId를 사용
    await createComment({
      content: writingComment,
      parentId: parentCommentId,
    });

    setWritingComment("");
    setParentCommentId(undefined);
    setParentCommentNickname(null);

    // 댓글 목록 갱신 (대댓글인 경우 각 ReplySection에서 갱신이 일어날 수 있도록 설계됨)
    if (!parentCommentId) refetch();
  };

  return (
    <div
      className={`flex flex-col gap-3 px-4 py-5 bg-white ${
        answer.isAccepted ? "border-l-4 border-[#22C55E]" : ""
      }`}
    >
      {/* 채택된 답변 딱지 */}
      {answer.isAccepted && (
        <div className="flex">
          <div className="text-sm font-semibold text-[#15803D] bg-[#F0FDF4] px-4 py-2 rounded-lg">
            ✓ 채택된 답변
          </div>
        </div>
      )}

      {/* 작성자 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={answer.profileImageUrl || "/icon/defaultUser.svg"}
            alt={answer.nickname}
            className={`h-10 w-10 rounded-full ${
              answer.profileImageUrl ? "object-cover" : "bg-main pt-2"
            }`}
          />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{answer.nickname}</span>
            <span className="text-xs text-gray-400">
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
          isSelectable={isSelectable}
          isEditable={isEditable}
          isWeb3Executable={isWeb3Executable}
          Web3Execution={answer.web3Execution}
        />
      </div>

      {/* 본문 */}
      {processedContent && <QnaContent content={processedContent} />}

      {/* 이미지 */}
      {answer.images && answer.images.length > 0 && (
        <img
          src={answer.images[0].imageUrl}
          alt="answer"
          className="w-full rounded-lg object-cover"
        />
      )}

      {/* 댓글 버튼 */}
      <div
        onClick={toggleComment}
        className="flex items-center gap-2 pl-2 text-sm font-semibold text-gray-500 cursor-pointer"
      >
        <img src="/icon/comment.svg" alt="comment" className="w-5 h-5" />
        {answer.commentCount}
      </div>

      {/* 댓글 영역 */}
      {isCommentsOpen && (
        <div className="flex flex-col">
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
            <div className="py-10">
              <LoadingSpinner size="md" color="text-gray-400" />
            </div>
          ) : (
            <div className="mt-4">
              {comments.length === 0 && (
                <p className="text-xs text-gray-400 px-2">댓글이 없습니다.</p>
              )}

              {comments.map((comment) => (
                <CommentItem
                  key={comment.commentId}
                  comment={comment}
                  onUpdateReplySuccess={refetch}
                  onReplyClick={handleStartReply}
                />
              ))}
            </div>
          )}

          {error && (
            <p className="text-xs px-2">
              댓글을 불러오던 중 오류가 발생했습니다.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
export default Answer;
