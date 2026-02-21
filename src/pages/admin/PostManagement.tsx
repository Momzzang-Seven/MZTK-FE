import { useEffect, useState } from "react";
import { useAdminStore } from "@store/adminStore";
import { AdminSearchBar } from "@components/admin/common/AdminSearchBar";
import { PostItem } from "@components/admin/board/PostItem";
import { DeleteConfirmModal } from "@components/admin/board/DeleteConfirmModal";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { useModal } from "@hooks/useModal";
import { ADMIN_TEXT } from "@constant/admin";

const PostManagement = () => {
    const {
        filteredPosts,
        fetchPosts,
        searchPosts,
        banPost,
        unbanPost,
        deleteComment,
        restoreComment,
        hasMore,
        isFetchingPosts,
        postStatusFilter,
        setPostStatusFilter
    } = useAdminStore();

    // Modal State
    const {
        isOpen: isModalOpen,
        modalData,
        openModal,
        closeModal
    } = useModal<'POST' | 'COMMENT', any>();

    const [deleteReason, setDeleteReason] = useState("");

    // Infinite Scroll Observer
    const observerRef = useInfiniteScroll({
        onLoadMore: () => fetchPosts(false),
        hasMore,
        isLoading: isFetchingPosts
    });

    // Initial Fetch
    useEffect(() => {
        fetchPosts(true);
    }, [fetchPosts]);

    // Handlers
    const handleOpenDeleteModal = (type: 'POST' | 'COMMENT', postId: number, commentId?: number) => {
        openModal(type, postId, commentId);
        setDeleteReason("");
    };

    const handleCloseModal = () => {
        closeModal();
        setDeleteReason("");
    };

    const confirmDelete = async () => {
        if (!modalData.targetId) return;

        if (modalData.type === 'POST') {
            await banPost(modalData.targetId);
        } else if (modalData.type === 'COMMENT' && modalData.subTargetId) {
            await deleteComment(modalData.targetId, modalData.subTargetId);
        }

        handleCloseModal();
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Search Bar */}
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                <AdminSearchBar
                    placeholder={ADMIN_TEXT.POST.SEARCH_PLACEHOLDER}
                    onSearch={searchPosts}
                    filterOptions={[
                        { label: ADMIN_TEXT.COMMON.FILTER.ALL, value: "ALL" },
                        { label: ADMIN_TEXT.COMMON.FILTER.POSTING, value: "ACTIVE" },
                        { label: ADMIN_TEXT.COMMON.FILTER.DELETED, value: "BANNED" },
                    ]}
                    currentFilter={postStatusFilter}
                    onFilterChange={(value) => setPostStatusFilter(value as any)}
                />
            </div>

            {/* Post List */}
            <div className="space-y-4">
                {filteredPosts.map(post => (
                    <PostItem
                        key={post.id}
                        post={post}
                        onOpenDeleteModal={handleOpenDeleteModal}
                        onRestorePost={unbanPost}
                        onRestoreComment={restoreComment}
                    />
                ))}

                {/* Sentinel for Infinite Scroll */}
                {hasMore && (
                    <div ref={observerRef} className="h-10 flex items-center justify-center">
                        {isFetchingPosts && (
                            <div className="w-6 h-6 border-2 border-main border-t-transparent rounded-full animate-spin"></div>
                        )}
                    </div>
                )}

                {!hasMore && filteredPosts.length > 0 && (
                    <div className="text-center text-gray-400 py-6 text-sm">
                        {ADMIN_TEXT.POST.MSG_NO_MORE_POSTS}
                    </div>
                )}
            </div>

            {/* Modal */}
            <DeleteConfirmModal
                isOpen={isModalOpen}
                type={modalData.type}
                deleteReason={deleteReason}
                onReasonChange={setDeleteReason}
                onClose={handleCloseModal}
                onConfirm={confirmDelete}
            />
        </div>
    );
};

export default PostManagement;
