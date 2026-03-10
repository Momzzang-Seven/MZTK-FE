import type { Comment } from "@types";
import { formatTimeAgo } from "@utils";
import { ActionList } from "@components/community";

interface Props {
  comment: Comment;
  showProfileImage?: boolean;
}

const CommentItem = ({ comment, showProfileImage = true }: Props) => {
  return (
    <div className={"flex gap-3 p-2"}>
      {/* 프로필 사진*/}
      {showProfileImage && (
        <img
          src={comment.writer.profileImage || "/icon/defaultUser.svg"}
          alt={comment.writer.nickname}
          className={`h-10 w-10 rounded-full ${
            comment.writer.profileImage ? "object-cover" : "bg-main pt-2"
          }`}
        />
      )}

      <div className="flex-1">
        {/* 프로필, 시간 */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">
              {comment.writer.nickname}
            </span>
            <span className="text-xs text-gray-400">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>
          <ActionList
            size="xs"
            type="comment"
            id={comment.commentId}
            authorId={comment.writer.userId}
            commentContent={comment.content}
          />
        </div>

        {/* 본문 */}
        <p className="mt-1 text-sm leading-relaxed">{comment.content}</p>
      </div>
    </div>
  );
};

export default CommentItem;
