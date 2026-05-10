import { useNavigate } from "react-router-dom";
import type { QuestionPost } from "@types";
import { getQuestionStatus, statusStyleMap, replaceImageSrc } from "@utils";
import { QnaContent } from "@components/community";
import { Coins } from "lucide-react";

interface QuestionProps {
  post: QuestionPost;
}

const Question = ({ post }: QuestionProps) => {
  const navigate = useNavigate();
  const status = getQuestionStatus(
    post.publicationStatus,
    post.moderationStatus,
    post.question.isSolved,
    post.commentCount
  );
  const statusStyle = statusStyleMap[status];
  const processedContent = post.content
    ? replaceImageSrc(post.content, post.images)
    : "";

  return (
    <section className="px-5 py-6 flex flex-col gap-5 bg-white shadow-[0_4px_30px_rgba(0,0,0,0.02)] border-b border-gray-50">
      {/* Title */}
      <h1 className="text-[22px] font-black leading-tight text-gray-900 tracking-tight">
        {post.title}
      </h1>

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
