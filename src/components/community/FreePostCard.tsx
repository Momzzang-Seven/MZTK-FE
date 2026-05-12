import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import type { FreePost } from "@types";
import { formatTimeAgo } from "@utils";
import { ActionList } from "@components/community";
import { usePostService } from "@hooks";

interface Props {
  post: FreePost;
  onDeletePostSuccess?: () => void;
}

const FreePostCard = ({ post, onDeletePostSuccess }: Props) => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const { likePost, unlikePost } = usePostService();

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLiked = !liked;
    if (liked) {
      unlikePost(post.postId);
    } else {
      likePost(post.postId);
    }

    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : prev - 1));
  };

  const handleCardClick = () => {
    navigate("/community/free/" + post.postId);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white border border-gray-100 rounded-[36px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.03)] mb-5 animate-in fade-in slide-in-from-bottom-4 duration-700 cursor-pointer active:scale-[0.98] hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="relative group/avatar">
            <img
              src={post.writer.profileImage || "/icon/defaultUser.svg"}
              alt={post.writer.nickname}
              className={`h-12 w-12 rounded-full ring-4 ring-gray-50 transition-all group-hover/avatar:ring-main/10 ${
                post.writer.profileImage ? "object-cover" : "bg-main p-1.5"
              }`}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-black text-gray-900 tracking-tight group-hover:text-main transition-colors">
              {post.writer.nickname}
            </span>
            <span className="text-[12px] text-gray-400 font-bold tracking-tight opacity-80">
              {formatTimeAgo(post.createdAt)}
            </span>
          </div>
        </div>
        <div
          onClick={(e) => e.stopPropagation()}
          className="opacity-40 hover:opacity-100 transition-opacity"
        >
          <ActionList
            id={post.postId}
            type="FREE"
            authorId={post.writer.userId}
            size="sm"
            onDeletePostSuccess={onDeletePostSuccess}
          />
        </div>
      </div>

      {/* Images */}
      {post.images.length > 0 && (
        <div className="px-6 mb-2">
          <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide snap-x">
            {post.images.map((img) => (
              <div
                key={img.imageId}
                className="relative shrink-0 w-[85%] snap-center"
              >
                <img
                  src={img.imageUrl}
                  alt="post"
                  className="w-full aspect-[4/3] object-cover rounded-[28px] shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-7 py-2">
        <p className="text-[15.5px] text-gray-800 leading-[1.6] font-medium line-clamp-3 tracking-tight">
          {post.content}
        </p>

        <div className="mt-4 flex flex-wrap gap-2.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-4 py-1.5 bg-gray-50 text-gray-500 text-[12px] font-black rounded-full hover:bg-main hover:text-white transition-all cursor-pointer border border-gray-100/50"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/community/free?tag=${tag}`);
              }}
            >
              # {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-7 px-7 py-5 mt-2 bg-gray-50/20">
        <button
          onClick={handleLikeClick}
          data-testid="like-button"
          className="flex items-center gap-2 transition-all active:scale-90 group/btn"
        >
          <div className="p-2 rounded-full transition-colors group-hover/btn:bg-gray-100">
            <Heart
              size={22}
              className={`transition-all ${
                liked ? "fill-red-500 text-red-500 scale-110" : "text-gray-400"
              }`}
              strokeWidth={2.5}
            />
          </div>
          <span
            className={`text-[14px] font-black ${
              liked ? "text-red-500" : "text-gray-500"
            }`}
          >
            {likeCount}
          </span>
        </button>

        <div
          onClick={handleCardClick}
          data-testid="comment-button"
          className="flex items-center gap-2 group/btn cursor-pointer"
        >
          <div className="p-2 rounded-full group-hover/btn:bg-gray-100 transition-colors">
            <MessageCircle
              size={22}
              strokeWidth={2.5}
              className="text-gray-400 group-hover/btn:text-main transition-colors"
            />
          </div>
          <span className="text-[14px] font-black text-gray-500">
            {post.commentCount}
          </span>
        </div>

        <button
          data-testid="share-button"
          className="ml-auto p-2 rounded-full hover:bg-gray-100 text-gray-300 hover:text-gray-900 transition-all active:scale-90"
        >
          <Share2 size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default FreePostCard;
