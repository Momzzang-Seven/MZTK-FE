import { useNavigate } from "react-router-dom";
import type { QuestionPost } from "@types";
import { getStatus, statusStyleMap, formatTimeAgo } from "@utils";

interface Props {
  post: QuestionPost;
}

const QuestionPostCard = ({ post }: Props) => {
  const navigate = useNavigate();
  const status = getStatus(post.question.isSolved, post.commentCount);
  const statusStyle = statusStyleMap[status];

  return (
    <div className="rounded-2xl bg-white border-1 border-gray-100 shadow-xs px-5 py-4 hover:cursor-pointer">
      {/* 상단: 상태 배지 + 시간 */}
      <header className="mb-2 flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs text-white font-normal ${statusStyle.bg}`}
        >
          {statusStyle.label}
        </span>
        <span className="text-xs text-gray-400 fontSize-12">
          {formatTimeAgo(post.createdAt)}
        </span>
      </header>

      {/* 제목 + 내용 미리보기 */}
      <div
        className="mb-2"
        onClick={() => navigate("/community/question/" + post.postId)}
      >
        <div className="mb-1 text-base font-medium text-gray-900 line-clamp-1">
          {post.title}
        </div>
        <p className="text-sm text-gray-500 font-normal line-clamp-2">
          {post.content}
        </p>
      </div>

      {/* 태그 */}
      <div className="mb-2 flex flex-wrap gap-1 text-sm text-[#4C6FFF]">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="cursor-pointer"
            onClick={() => navigate(`/community/question?tag=${tag}`)}
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* 하단: 작성자 / 답변 수 / 토큰 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              src={post.writer.profileImage || "/icon/defaultUser.svg"}
              alt={post.writer.nickname}
              className={`h-6 w-6 rounded-full ${
                post.writer.profileImage ? "object-cover" : "bg-main pt-1"
              }`}
            />
            <span className="text-sm text-gray-500 font-medium">
              {post.writer.nickname}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
            <img src="/icon/comment.svg" alt="comment" className="w-5 h-5" />
            <span>{post.commentCount}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm font-normal text-[#ffffff] bg-[#FAB12F] px-2 py-1 rounded-full">
          <img src="/icon/token.svg" alt="token" className="w-5 h-5" />
          <span>{post.question.reward}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionPostCard;
