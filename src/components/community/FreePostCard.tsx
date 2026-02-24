import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { FreePost } from "@types";
import { formatTimeAgo } from "@utils";
import { SharePost, ActionList } from "@components/community";

interface Props {
  post: FreePost;
}

const FreePostCard = ({ post }: Props) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);

  const handleLikeClick = () => {
    setLiked((prevLiked) => {
      setLikeCount((prevCount) => (prevLiked ? prevCount - 1 : prevCount + 1));
      return !prevLiked;
    });
  };

  const handleCommentClick = () => {
    navigate("/community/free/" + post.postId);
  };

  return (
    <div className="flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img
            src={post.writer.profileImage || "/icon/defaultUser.svg"}
            alt={post.writer.nickname}
            className={`h-10 w-10 rounded-full ${
              post.writer.profileImage ? "object-cover" : "bg-main pt-2"
            }`}
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold fontSize-16">
              {post.writer.nickname}
            </span>
            <span className="text-xs text-gray-500 fontSize-14">
              {formatTimeAgo(post.createdAt)}
            </span>
          </div>
        </div>
        <ActionList
          id={post.postId}
          type="free"
          authorId={post.writer.userId}
          size="sm"
        />
      </div>

      {/* 게시물 이미지 */}
      {post.imageUrls && (
        <div className="mt-3 w-full">
          <img
            src={post.imageUrls}
            alt="post"
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* 액션 영역 */}
      <div className="flex items-center gap-4 px-4 py-1">
        {/* 좋아요 */}
        <div
          onClick={handleLikeClick}
          className="flex items-center gap-1 active:scale-95 transition cursor-pointer"
        >
          <img
            src={liked ? "/icon/likeActive.svg" : "/icon/like.svg"}
            alt="like"
            className="w-5 h-5"
          />
          <span className="text-sm font-medium text-gray-700">{likeCount}</span>
        </div>

        {/* 댓글 */}
        <div
          onClick={handleCommentClick}
          className="flex items-center gap-1 active:scale-95 transition cursor-pointer"
        >
          <img src="/icon/comment.svg" alt="comment" className="w-5 h-5" />
          <span className="text-sm font-medium text-gray-700">
            {post.commentCount}
          </span>
        </div>

        {/* 공유 */}
        <SharePost type="free" postId={post.postId} />
      </div>

      {/* 내용 및 태그 */}
      <div className="flex flex-col px-4 pb-7 text-sm">
        <p>{post.content}</p>

        <div className="mt-2 flex flex-wrap gap-1">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-blue-600 cursor-pointer"
              onClick={() => navigate(`/community/free?tag=${tag}`)}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FreePostCard;
