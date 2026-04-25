import type { Comment } from "@types";
import { formatTimeAgo } from "@utils";
import { ActionList } from "@components/community";

interface Props {
  comment: Comment;
  showProfileImage?: boolean;
  onUpdateReplySuccess?: () => void;
}

const CommentItem = ({ comment, showProfileImage = true, onUpdateReplySuccess }: Props) => {
  return (
    <div className={"flex gap-3 p-2"}>
      {/* 프로필 사진*/}
      {showProfileImage && (
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
          <ActionList
            size="xs"
            type="COMMENT"
            id={comment.commentId}
            authorId={comment.writer?.userId}
            commentContent={comment.content}
            onUpdateReplySuccess={onUpdateReplySuccess}
          />
        </div>

        {/* 본문 */}
        <p className="mt-1 pr-3 text-sm leading-relaxed">{comment.content}</p>
      </div>
    </div>
  );
};

export default CommentItem;
