import { useNavigate } from "react-router-dom";
import { MessageCircle, Coins, Clock } from "lucide-react";
import type { QuestionPost } from "@types";
import { getQuestionStatus, statusStyleMap, formatTimeAgo } from "@utils";

interface Props {
  post: QuestionPost;
}

const QuestionPostCard = ({ post }: Props) => {
  const navigate = useNavigate();
  const status = getQuestionStatus(
    post.publicationStatus,
    post.moderationStatus,
    post.question.isSolved,
    post.commentCount
  );
  const statusStyle = statusStyleMap[status];

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const pureText = stripHtml(post.content);

  return (
    <div
      onClick={() => navigate("/community/question/" + post.postId)}
      className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.07)] transition-all duration-500 cursor-pointer mb-5 animate-in fade-in slide-in-from-bottom-4 active:scale-[0.98] group relative overflow-hidden"
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-main/5 blur-[40px] rounded-full pointer-events-none -mr-16 -mt-16 group-hover:bg-main/10 transition-colors duration-500" />

      {/* Top: Status Badge & Reward */}
      <header className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center rounded-xl px-3.5 py-1.5 text-[10px] font-black tracking-widest uppercase shadow-sm ${statusStyle.bg} text-white`}
          >
            {statusStyle.label}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-400 opacity-80">
            <Clock size={12} strokeWidth={3} />
            <span>{formatTimeAgo(post.createdAt).toUpperCase()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 text-main px-4 py-2 rounded-2xl border border-orange-100/50 shadow-sm group-hover:scale-105 transition-transform">
          <div className="bg-main/20 p-1 rounded-lg">
            <Coins size={16} strokeWidth={3} />
          </div>
          <div className="flex flex-col items-end leading-none">
            <span className="text-[14px] font-black">
              {post.question.reward}
            </span>
            <span className="text-[8px] font-black uppercase opacity-60 tracking-tighter">
              MZTK
            </span>
          </div>
        </div>
      </header>

      {/* Title & Preview */}
      <div className="mb-5">
        <h3 className="text-[19px] font-black text-gray-900 mb-2.5 line-clamp-1 tracking-tight group-hover:text-main transition-colors duration-300">
          {post.title}
        </h3>
        <p className="text-[14.5px] text-gray-500 font-medium line-clamp-2 leading-[1.6] opacity-90 tracking-tight">
          {pureText}
        </p>
      </div>

      {/* Tags */}
      <div className="mb-6 flex flex-wrap gap-2">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="text-[12px] font-black text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100/50 hover:bg-main hover:text-white transition-all cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/community/question?tag=${tag}`);
            }}
          >
            # {tag}
          </span>
        ))}
      </div>

      {/* Footer: Writer & Stats */}
      <div className="flex items-center justify-between pt-5 border-t border-gray-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={post.writer.profileImage || "/icon/defaultUser.svg"}
              alt={post.writer.nickname}
              className={`h-8 w-8 rounded-full ring-2 ring-gray-100 ${
                post.writer.profileImage ? "object-cover" : "bg-main p-1.5"
              }`}
            />
            {post.writer.profileImage && (
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
            )}
          </div>
          <span className="text-[13px] font-black text-gray-900 tracking-tight">
            {post.writer.nickname}
          </span>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 group/stat">
            <div className="p-2 rounded-full group-hover/stat:bg-gray-100 transition-colors">
              <MessageCircle
                size={18}
                strokeWidth={3}
                className="text-gray-300 group-hover/stat:text-main"
              />
            </div>
            <span className="text-[13px] font-black text-gray-500">
              {post.commentCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPostCard;
