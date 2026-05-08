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

  const isFree = post.type === "FREE";
  const isSolved = post.type === "QUESTION" && post.question?.isSolved;

  return (
    <button
      onClick={() => navigate(path)}
      className="btn-press w-full bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md p-5 flex flex-col gap-3 text-left transition-all duration-200 hover:border-gray-200 group"
    >
      {/* Top row: badges + time */}
      <div className="flex items-center gap-2">
        <span
          className={`text-[10px] font-black px-2.5 py-1 rounded-xl ${
            isFree ? "bg-main/8 text-main" : "bg-amber-50 text-amber-600"
          }`}
        >
          {isFree ? "자유글" : "Q&A"}
        </span>
        {isSolved && (
          <span className="text-[10px] font-black px-2.5 py-1 rounded-xl bg-green-50 text-green-600 flex items-center gap-1">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            해결됨
          </span>
        )}
        <span className="ml-auto text-[11px] text-gray-400 font-bold">
          {formatRelativeTime(post.createdAt)}
        </span>
      </div>

      {/* Content */}
      <p className="font-black text-[14px] text-gray-800 line-clamp-2 break-keep leading-snug group-hover:text-gray-900 transition-colors">
        {post.type === "QUESTION" ? post.title : post.content}
      </p>

      {/* Stats row */}
      <div className="flex items-center gap-4 pt-1 border-t border-gray-50">
        <span className="flex items-center gap-1.5 text-[12px] text-gray-400 font-bold">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="#F43F5E"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 21C12 21 3 14 3 8.5C3 5.46 5.46 3 8.5 3C10 3 11.37 3.61 12 4.5C12.63 3.61 13.99 3 15.5 3C18.54 3 21 5.46 21 8.5C21 14 12 21 12 21Z" />
          </svg>
          {post.likeCount}
        </span>
        <span className="flex items-center gap-1.5 text-[12px] text-gray-400 font-bold">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {post.commentCount}
        </span>
        <div className="ml-auto w-6 h-6 rounded-lg bg-gray-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#9CA3AF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </div>
      </div>
    </button>
  );
};
