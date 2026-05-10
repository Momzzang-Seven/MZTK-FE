import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import type { PostType, Writer, Web3Execution } from "@types";
import { formatTimeAgo } from "@utils";
import { ActionList, SharePost } from "@components/community";

interface QuestionHeaderProps {
  isMine: boolean;
  type: PostType;
  postId: number;
  writer: Writer;
  createdAt: string;
  isEditable: boolean;
  isWeb3Executable: boolean;
  Web3Execution: Web3Execution;
}

const QuestionHeader = ({
  type,
  postId,
  writer,
  createdAt,
  isEditable,
  isWeb3Executable,
  Web3Execution,
}: QuestionHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 w-full max-w-[450px] h-[88px] bg-white/80 backdrop-blur-2xl z-[100] px-5 flex items-center justify-between border-b border-gray-100/50 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center justify-center w-11 h-11 rounded-full bg-gray-50/50 hover:bg-gray-100 transition-all active:scale-90 border border-gray-100/30"
        >
          <ChevronLeft
            size={24}
            className="text-gray-900 group-hover:text-main transition-colors"
            strokeWidth={2.5}
          />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="relative group/avatar">
            <img
              src={writer.profileImage || "/icon/defaultUser.svg"}
              alt={writer.nickname}
              className={`h-11 w-11 rounded-2xl ring-4 ring-gray-100/50 transition-all group-hover/avatar:ring-main/10 ${
                writer.profileImage ? "object-cover" : "bg-main p-2"
              }`}
            />
            {writer.profileImage && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-[15px] font-black text-gray-900 tracking-tight leading-none mb-1.5">
              {writer.nickname}
            </span>
            <span className="text-[11px] font-bold text-gray-400 tracking-tight uppercase opacity-70">
              {formatTimeAgo(createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="p-1 rounded-full hover:bg-gray-50 transition-colors">
          <SharePost type={type} postId={postId} />
        </div>
        <div className="opacity-80 hover:opacity-100 transition-opacity">
          <ActionList
            size="md"
            type={type}
            id={postId}
            authorId={writer.userId}
            isEditable={isEditable}
            isWeb3Executable={isWeb3Executable}
            Web3Execution={Web3Execution}
          />
        </div>
      </div>
    </div>
  );
};

export default QuestionHeader;
