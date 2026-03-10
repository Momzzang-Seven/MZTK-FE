import { useNavigate } from "react-router-dom";
import type { QuestionPost } from "@types";
import { getStatus, statusStyleMap } from "@utils";

interface QuestionProps {
  post: QuestionPost;
}

const Question = ({ post }: QuestionProps) => {
  const navigate = useNavigate();
  const status = getStatus(post.question.isSolved, post.commentCount);
  const statusStyle = statusStyleMap[status];

  return (
    <section className="px-4 py-3 flex flex-col gap-3 border-b-1 border-gray-200 bg-white shadow-sm">
      {/* 제목 */}
      <h1 className="text-lg font-semibold leading-snug">{post.title}</h1>

      {/* 상태 + 토큰 */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-sm text-white font-normal ${statusStyle.bg}`}
        >
          {statusStyle.label}
        </span>
        <div className="flex items-center gap-1 text-sm font-normal text-[#ffffff] bg-[#FAB12F] px-2 py-1 rounded-full">
          <img src="/icon/token.svg" alt="token" className="w-5 h-5" />
          <span>{post.question.reward}</span>
        </div>
      </div>

      {/* 본문 */}
      {post.content && (
        <p className="text-base text-gray-700 whitespace-pre-line">
          {post.content}
        </p>
      )}

      {/* 이미지 */}
      {post.imageUrls && (
        <img
          src={post.imageUrls}
          alt="question"
          className="w-full rounded-lg object-cover"
        />
      )}

      {/* 태그 */}
      <div className="flex gap-2 flex-wrap">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded cursor-pointer"
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
