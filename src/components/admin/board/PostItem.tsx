import { useState } from "react";
import type { AdminPost, AdminComment } from "@store/adminStore";
import { ADMIN_TEXT } from "@constant/admin";
import { CommonButton } from "@components/common/CommonButton";

interface PostItemProps {
    post: AdminPost;
    onOpenDeleteModal: (type: 'POST' | 'COMMENT', postId: number, commentId?: number) => void;
    onRestorePost: (postId: number) => void;
    onRestoreComment: (postId: number, commentId: number) => void;
}

export const PostItem = ({
    post,
    onOpenDeleteModal,
    onRestorePost,
    onRestoreComment,
}: PostItemProps) => {
    const [isCommentsExpanded, setIsCommentsExpanded] = useState(false);

    const toggleComments = () => {
        setIsCommentsExpanded(!isCommentsExpanded);
    };

    return (
        <div className={`bg-gray-50 p-6 rounded-2xl border ${post.isBanned ? 'border-red-200 bg-red-50' : 'border-gray-100'}`}>
            {/* Post Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg`} style={{ backgroundColor: post.profileColor }}>
                        {post.author[0]}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{post.author}</div>
                        <div className="text-xs text-gray-500">{post.date}</div>
                    </div>
                </div>
                <span className={`font-semibold text-sm ${post.category === '자유게시판' ? 'text-orange-400' : 'text-blue-500'}`}>{post.category}</span>
            </div>

            {/* Post Content */}
            <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Post Actions & Stats */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                <div className="flex gap-4 text-gray-500 text-sm">
                    <span className="flex items-center gap-1">
                        <img src="/icon/comment.svg" alt="comments" className="w-4 h-4" />
                        {post.comments.length}
                    </span>
                    <span className="flex items-center gap-1">
                        <img src="/icon/like.svg" alt="likes" className="w-4 h-4" />
                        {post.likeCount}
                    </span>
                </div>
                {!post.isBanned ? (
                    <CommonButton
                        label={ADMIN_TEXT.POST.BTN_DELETE_POST}
                        onClick={() => onOpenDeleteModal('POST', post.id)}
                        className="border border-red-200 text-sm font-semibold flex items-center gap-2 rounded-xl"
                        width="w-fit"
                        padding="px-4 py-2"
                        bgColor="bg-red-50 hover:bg-red-100"
                        textColor="text-red-500"
                        icon={<img src="/icon/trash.svg" alt="delete" className="w-4 h-4" />}
                    />
                ) : (
                    <CommonButton
                        label={ADMIN_TEXT.POST.BTN_RESTORE_POST}
                        onClick={() => onRestorePost(post.id)}
                        className="border border-green-200 text-sm font-semibold flex items-center gap-2 rounded-xl"
                        width="w-fit"
                        padding="px-4 py-2"
                        bgColor="bg-green-50 hover:bg-green-100"
                        textColor="text-green-600"
                        icon={<img src="/icon/refresh.svg" alt="restore" className="w-4 h-4" />}
                    />
                )}
            </div>

            {/* Comments Section */}
            {post.comments.length > 0 && (
                <div className="bg-white rounded-xl p-4 space-y-4">
                    <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <img src="/icon/comment.svg" alt="comments" className="w-4 h-4" />
                        {ADMIN_TEXT.POST.LABEL_COMMENT} ({post.comments.length})
                    </div>

                    <div className="space-y-3">
                        {(isCommentsExpanded ? post.comments : post.comments.slice(0, 3)).map((comment: AdminComment) => (
                            <div key={comment.id} className={`flex justify-between items-start p-3 rounded-lg ${comment.isBanned ? 'bg-red-50 opacity-70' : 'bg-gray-50'}`}>
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ backgroundColor: comment.profileColor }}>
                                        {comment.author[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-sm text-gray-900">{comment.author}</span>
                                            <span className="text-[10px] text-gray-400">{comment.date}</span>
                                        </div>
                                        <p className={`text-sm ${comment.isBanned ? 'text-red-400 line-through' : 'text-gray-600'}`}>{comment.content}</p>
                                        {comment.isBanned && <span className="text-xs text-red-500 font-bold">{ADMIN_TEXT.POST.LABEL_DELETED_COMMENT}</span>}
                                    </div>
                                </div>
                                {!comment.isBanned ? (
                                    <button
                                        onClick={() => onOpenDeleteModal('COMMENT', post.id, comment.id)}
                                        className="w-8 h-8 rounded-full border border-red-200 text-red-400 flex items-center justify-center hover:bg-red-50"
                                        title={ADMIN_TEXT.POST.BTN_DELETE_COMMENT}
                                    >
                                        <img src="/icon/trash.svg" alt="delete" className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onRestoreComment(post.id, comment.id)}
                                        className="w-8 h-8 rounded-lg bg-green-500 text-white flex items-center justify-center hover:bg-green-600 shadow-sm transition-all active:scale-90"
                                        title={ADMIN_TEXT.POST.BTN_RESTORE_COMMENT}
                                    >
                                        <img src="/icon/refresh.svg" alt="restore" className="w-4 h-4 brightness-0 invert" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {post.comments.length > 3 && (
                        <button
                            onClick={toggleComments}
                            className="text-main text-sm font-bold flex items-center gap-1 hover:underline"
                        >
                            {isCommentsExpanded ? (
                                <>{ADMIN_TEXT.POST.BTN_COMMENT_FOLD} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></>
                            ) : (
                                <>{ADMIN_TEXT.POST.BTN_COMMENT_MORE} ({post.comments.length - 3}개 남음) <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
