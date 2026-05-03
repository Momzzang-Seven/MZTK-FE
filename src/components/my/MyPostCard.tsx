import { useNavigate } from "react-router-dom";
import type { MyPost } from "@types";

type MyPostCardProps = {
  post: MyPost;
};

const formatRelativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

export const MyPostCard = ({ post }: MyPostCardProps) => {
  const navigate = useNavigate();
  const path =
    post.type === "FREE"
      ? `/community/free/${post.postId}`
      : `/community/question/${post.postId}`;

  return (
    <div
      onClick={() => navigate(path)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2 cursor-pointer active:bg-gray-50 transition-colors"
    >
      {/* 타입 배지 */}
      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            post.type === "FREE"
              ? "bg-main/10 text-main"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {post.type === "FREE" ? "자유" : "Q&A"}
        </span>
        {post.type === "QUESTION" && post.question?.isSolved && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600">
            해결됨
          </span>
        )}
        <span className="ml-auto text-[11px] text-gray-400">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>

      {/* 제목 (Q&A는 title, 자유글은 content 앞부분) */}
      <p className="font-bold text-[14px] text-gray-800 line-clamp-2 break-keep leading-snug">
        {post.type === "QUESTION" ? post.title : post.content}
      </p>

      {/* 통계 */}
      <div className="flex items-center gap-3 text-[12px] text-gray-400">
        <span className="flex items-center gap-1">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 21C12 21 3 14 3 8.5C3 5.46243 5.46243 3 8.5 3C10.0057 3 11.3677 3.60802 12 4.5C12.6323 3.60802 13.9943 3 15.5 3C18.5376 3 21 5.46243 21 8.5C21 14 12 21 12 21Z"
              fill="currentColor"
              className="text-rose-400"
            />
          </svg>
          {post.likeCount}
        </span>
        <span className="flex items-center gap-1">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {post.commentCount}
        </span>
      </div>
    </div>
  );
};
