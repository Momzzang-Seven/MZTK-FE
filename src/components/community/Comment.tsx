import { useState } from "react";
import type { Comment } from "@types";
import { formatTimeAgo } from "@utils";
import { ActionList, ReplySection } from "@components/community";

interface Props {
  comment: Comment;
  isRootComment?: boolean;
  onUpdateReplySuccess?: () => void;
  onReplyClick: (commentId: number, nickname: string) => void;
  targetId: number;
  isAnswer?: boolean;
}

const CommentItem = ({
  comment,
  isRootComment = true,
  onUpdateReplySuccess,
  onReplyClick,
  targetId,
  isAnswer = false,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);
  return (
    <div className="flex flex-col border-b border-gray-100 last:border-none">
      <div className={"flex gap-3 p-2"}>
        {/* 프로필 사진*/}
        {isRootComment && (
          <img
            src={comment.writer?.profileImage || "/icon/defaultUser.svg"}
            alt={comment.writer?.nickname || "알 수 없는 사용자"}
            className={`h-10 w-10 rounded-full mt-1 ${
              comment.writer?.profileImage ? "object-cover" : "bg-main pt-2"
            }`}
          />
        )}

        <div className="flex-1">
          {/* 프로필, 시간 */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <span className="text-sm font-medium">
                {comment.writer?.nickname || "알 수 없는 사용자"}
              </span>
              <span className="text-xs text-gray-400">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
            {comment.writer?.userId && (
              <ActionList
                size="xs"
                type="COMMENT"
                id={comment.commentId}
                authorId={comment.writer?.userId}
                commentContent={comment.content}
                onUpdateReplySuccess={onUpdateReplySuccess}
                targetId={targetId}
                isAnswer={isAnswer}
              />
            )}
          </div>

          {/* 본문 */}
          <p className="mt-1 pr-3 text-sm leading-relaxed">{comment.content}</p>

          {/* 답글 펼치기/숨기기 및 답글 달기 */}
          {isRootComment && (
            <div className="flex gap-4 mt-2 text-xs font-bold text-gray-500">
              {comment.replyCount > 0 && (
                <div className="cursor-pointer" onClick={toggleOpen}>
                  {isOpen
                    ? "답글 숨기기"
                    : `답글 펼쳐보기(${comment.replyCount}개)`}
                </div>
              )}
              {comment.writer && (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    onReplyClick(comment.commentId, comment.writer!.nickname);
                    if (!isOpen) setIsOpen(true);
                  }}
                >
                  답글 달기
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 답글 섹션 */}
      {isOpen && (
        <ReplySection
          isOpen={true}
          parentId={comment.commentId}
          replyCount={comment.replyCount}
          onReplyClick={onReplyClick}
          targetId={targetId}
          isAnswer={isAnswer}
        />
      )}
    </div>
  );
};

export default CommentItem;
