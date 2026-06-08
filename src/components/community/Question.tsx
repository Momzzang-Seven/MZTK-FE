import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { QuestionPost } from "@types";
import { getPostStatus, statusStyleMap, replaceImageSrc } from "@utils";
import { QnaContent } from "@components/community";
import { Coins, Heart } from "lucide-react";
import { usePostService } from "@hooks";

interface QuestionProps {
  post: QuestionPost;
}

const Question = ({ post }: QuestionProps) => {
  console.log(post);
  const navigate = useNavigate();
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [liked, setLiked] = useState(post.isLiked);
  const { likePost, unlikePost } = usePostService();
  const status = getPostStatus(
    post.publicationStatus,
    post.moderationStatus,
    post.question.isSolved,
    post.commentCount,
    post.question.web3Execution
  );
  const statusStyle = statusStyleMap[status];
  const processedContent = post.content
    ? replaceImageSrc(post.content, post.images)
    : "";

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

  return (
    <section className="px-5 py-2 flex flex-col gap-3 bg-white shadow-[0_4px_30px_rgba(0,0,0,0.02)] border-b border-gray-50">
      <div className="px-2 flex items-center justify-between">
        {/* Title */}
        <h1 className="text-[22px] font-black leading-tight text-gray-900 tracking-tight">
          {post.title}
        </h1>
        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          data-testid="like-button"
          className="flex flex-row rounded-full items-center gap-2 transition-all active:scale-90 group/btn"
        >
          <div className="p-2 rounded-full transition-colors group-hover/btn:bg-gray-100">
            <Heart
              size={22}
              className={`transition-all ${
                liked ? "fill-red-500 text-red-500 scale-110" : "text-gray-400"
              }`}
              strokeWidth={2}
            />
            <span
              className={`text-[14px] font-black ${
                liked ? "text-red-500" : "text-gray-500"
              }`}
            >
              {likeCount}
            </span>
          </div>
        </button>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-3">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-black tracking-wider uppercase ${statusStyle.bg} text-white shadow-sm`}
        >
          {statusStyle.label}
        </span>
        <div className="flex items-center gap-1.5 bg-main/10 text-main px-3 py-1 rounded-full">
          <Coins size={14} strokeWidth={2.5} />
          <span className="text-[13px] font-black">{post.question.reward}</span>
        </div>
      </div>

      {/* Body */}
      <div className="text-[15px] text-gray-800 leading-relaxed">
        {processedContent && <QnaContent content={processedContent} />}
      </div>

      {/* Tags */}
      <div className="flex gap-2 flex-wrap">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="text-[13px] font-bold text-main bg-gray-50 px-3 py-1 rounded-full cursor-pointer hover:bg-main/10 transition-colors"
            onClick={() => navigate(`/community/question?tag=${tag}`)}
          >
            #{tag}
          </span>
        ))}
      </div>
    </section>
  );
};

export default Question;
