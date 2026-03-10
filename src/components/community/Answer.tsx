import { useState } from "react";
import type { AnswerPost, Comment } from "@types";
import { CommentItem, CommentInput, ActionList } from "@components/community";
import { formatTimeAgo } from "@utils";

interface AnswerProps {
  answer: AnswerPost;
  isSelectable: boolean;
}

const Answer = ({ answer, isSelectable }: AnswerProps) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [repliesMap, setRepliesMap] = useState<Record<number, Comment[]>>({});
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});

  const [writingComment, setWritingComment] = useState("");

  const handleToggleComments = async () => {
    if (isCommentsOpen) {
      setIsCommentsOpen(false);
      return;
    }

    try {
      const res = await fetch("/data/comments.json");
      const data: Comment[] = await res.json();

      setComments(data);
      setIsCommentsOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReplyClick = (commentId: number) => {
    if (openMap[commentId]) {
      setOpenMap((prev) => ({
        ...prev,
        [commentId]: false,
      }));
      return;
    }

    fetch("/data/replies.json")
      .then((res) => res.json())
      .then((data) => setRepliesMap((prev) => ({ ...prev, [commentId]: data })))
      .then(() => setOpenMap((prev) => ({ ...prev, [commentId]: true })))
      .catch(console.error);
  };

  const handleCommentSubmit = () => {
    if (!writingComment.trim()) return;

    // 전송 api 추가
    console.log(answer.answerId, writingComment);
    setWritingComment("");
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
            src={answer.writer.profileImage || "/icon/defaultUser.svg"}
            alt={answer.writer.nickname}
            className={`h-10 w-10 rounded-full ${
              answer.writer.profileImage ? "object-cover" : "bg-main pt-2"
            }`}
          />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">
              {answer.writer.nickname}
            </span>
            <span className="text-xs text-gray-400">
              {formatTimeAgo(answer.createdAt)}
            </span>
          </div>
        </div>
        <ActionList
          size="sm"
          type="answer"
          id={answer.answerId}
          authorId={answer.writer.userId}
          isSelectable={isSelectable}
        />
      </div>

      {/* 본문 */}
      <p className="text-base text-gray-700 whitespace-pre-line">
        {answer.content}
      </p>

      {/* 이미지 */}
      {answer.imageUrls && (
        <img
          src={answer.imageUrls}
          alt="answer"
          className="w-full rounded-lg object-cover"
        />
      )}

      {/* 댓글 버튼 */}
      <div
        onClick={handleToggleComments}
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
            postId={answer.answerId}
            comment={writingComment}
            setComment={setWritingComment}
            handleCommentSubmit={handleCommentSubmit}
          />

          {comments.length === 0 && (
            <p className="text-xs text-gray-400">댓글이 없습니다.</p>
          )}

          {comments.map((comment) => (
            <div key={comment.commentId} className="mb-1">
              <CommentItem comment={comment} showProfileImage={false} />

              <div className="flex gap-4 ml-2 font-semibold text-xs text-gray-500">
                {comment.replyCount > 0 && (
                  <div
                    className="cursor-pointer"
                    onClick={() => handleReplyClick(comment.commentId)}
                  >
                    답글 펼쳐보기 ({comment.replyCount}개)
                  </div>
                )}

                <div className="cursor-pointer">답글 달기</div>
              </div>

              {openMap[comment.commentId] && (
                <div>
                  {repliesMap[comment.commentId]?.map((reply) => (
                    <div key={reply.commentId} className="ml-4">
                      <CommentItem comment={reply} showProfileImage={false} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Answer;
