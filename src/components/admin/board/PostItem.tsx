import { useState } from "react";
import type { AdminPost, AdminComment } from "@store/adminStore";
import { ADMIN_TEXT } from "@constant/admin";
import {
  Trash2,
  RotateCcw,
  MessageSquare,
  Heart,
  ChevronDown,
  ChevronUp,
  Wallet2,
  CheckCircle2,
} from "lucide-react";

interface PostItemProps {
  post: AdminPost;
  onOpenDeleteModal: (
    type: "POST" | "COMMENT",
    postId: number,
    commentId?: number
  ) => void;
  onRestorePost: (postId: number) => void;
  onRestoreComment: (postId: number, commentId: number) => void;
  onOpenEscrowModal: (postId: number) => void;
  onOpenSettleModal: (postId: number, answerId: number) => void;
}

export const PostItem = ({
  post,
  onOpenDeleteModal,
  onRestorePost,
  onRestoreComment,
  onOpenEscrowModal,
  onOpenSettleModal,
}: PostItemProps) => {
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);

  const toggleComments = () => {
    setIsCommentsExpanded(!isCommentsExpanded);
  };

  const isQuestion = post.category === ADMIN_TEXT.POST.BOARD_TYPE.QUESTION;
  const visibleDiscussionCount = isQuestion
    ? (post.answerCount ?? post.commentCount ?? post.comments.length)
    : (post.commentCount ?? post.comments.length);

  return (
    <div
      className={`bg-white p-8 rounded-[28px] border transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.02)] group ${
        post.isBanned
          ? "border-red-100 bg-red-50/20"
          : "border-gray-100 hover:border-gray-200"
      }`}
    >
      {/* Post Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg relative"
            style={{ backgroundColor: post.profileColor }}
          >
            {post.author[0]}
            <div
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${post.isBanned ? "bg-red-500" : "bg-emerald-500"}`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-gray-900 text-[15px] tracking-tight">
                {post.author}
              </span>
              {post.isBanned && (
                <span className="bg-red-100 text-red-500 text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest">
                  {ADMIN_TEXT.COMMON.FILTER.BANNED}
                </span>
              )}
            </div>
            <div className="text-[11px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter italic opacity-70">
              {post.date}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-[0.1em] uppercase border ${
              isQuestion
                ? "bg-blue-50 text-blue-600 border-blue-100"
                : "bg-orange-50 text-main border-orange-100"
            }`}
          >
            {post.category}
          </span>
          {isQuestion && (
            <button
              onClick={() => onOpenEscrowModal(post.id)}
              className="px-4 py-1.5 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 flex items-center gap-2"
            >
              <Wallet2 size={12} />
              {ADMIN_TEXT.POST.BTN_ESCROW}
            </button>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-6 px-1">
        <h3 className="font-black text-xl text-gray-900 mb-3 tracking-tight group-hover:text-main transition-colors duration-300">
          {post.title}
        </h3>
        <p className="text-gray-500 leading-relaxed text-[15px] line-clamp-3">
          {post.content}
        </p>
      </div>

      {/* Post Actions & Stats */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-50">
        <div className="flex gap-6">
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
              <MessageSquare size={14} className="text-gray-400" />
            </div>
            <span className="text-[13px] font-black text-gray-600 tabular-nums">
              {visibleDiscussionCount}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
              <Heart size={14} className="text-gray-400" />
            </div>
            <span className="text-[13px] font-black text-gray-600 tabular-nums">
              {post.likeCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!post.isBanned ? (
            <button
              onClick={() => onOpenDeleteModal("POST", post.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-all text-xs font-black uppercase tracking-widest border border-red-100"
            >
              <Trash2 size={14} />
              {ADMIN_TEXT.POST.BTN_DELETE_POST}
            </button>
          ) : (
            <button
              onClick={() => onRestorePost(post.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all text-xs font-black uppercase tracking-widest border border-emerald-100"
            >
              <RotateCcw size={14} />
              {ADMIN_TEXT.POST.BTN_RESTORE_POST}
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {post.comments.length > 0 && (
        <div className="mt-6 bg-gray-50/50 rounded-[24px] p-6 space-y-4 border border-gray-100/50">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-main" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {ADMIN_TEXT.POST.LABEL_COMMENT} ({post.comments.length})
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {(isCommentsExpanded
              ? post.comments
              : post.comments.slice(0, 3)
            ).map((comment: AdminComment) => (
              <div
                key={comment.id}
                className={`flex justify-between items-center p-4 rounded-2xl transition-all ${
                  comment.isBanned
                    ? "bg-red-50/50 border border-red-100 opacity-60"
                    : "bg-white border border-transparent hover:border-gray-100 shadow-sm"
                }`}
              >
                <div className="flex gap-4 flex-1">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm"
                    style={{ backgroundColor: comment.profileColor }}
                  >
                    {comment.author[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-[13px] text-gray-900 truncate max-w-[120px]">
                        {comment.author}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase italic opacity-60">
                        {comment.date}
                      </span>
                    </div>
                    <p
                      className={`text-[13px] leading-relaxed ${
                        comment.isBanned
                          ? "text-red-400 italic"
                          : "text-gray-500 font-medium"
                      }`}
                    >
                      {comment.isBanned
                        ? `[${ADMIN_TEXT.COMMON.FILTER.DELETED}] ${comment.content}`
                        : comment.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!comment.isBanned ? (
                    <>
                      {isQuestion && (
                        <button
                          onClick={() => onOpenSettleModal(post.id, comment.id)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all flex items-center gap-1"
                        >
                          <CheckCircle2 size={10} />
                          {ADMIN_TEXT.POST.BTN_SETTLE}
                        </button>
                      )}
                      <button
                        onClick={() =>
                          onOpenDeleteModal("COMMENT", post.id, comment.id)
                        }
                        className="p-2 rounded-lg bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => onRestoreComment(post.id, comment.id)}
                      className="p-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"
                    >
                      <RotateCcw size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {post.comments.length > 3 && (
            <button
              onClick={toggleComments}
              className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-main transition-colors group/more"
            >
              {isCommentsExpanded ? (
                <>
                  {ADMIN_TEXT.POST.BTN_COMMENT_FOLD}{" "}
                  <ChevronUp
                    size={14}
                    className="group-hover/more:-translate-y-0.5 transition-transform"
                  />
                </>
              ) : (
                <>
                  {ADMIN_TEXT.POST.BTN_COMMENT_MORE}{" "}
                  <ChevronDown
                    size={14}
                    className="group-hover/more:translate-y-0.5 transition-transform"
                  />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
