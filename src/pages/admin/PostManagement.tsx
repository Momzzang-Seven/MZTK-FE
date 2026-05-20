import { useEffect, useState } from "react";
import { useAdminStore } from "@store/adminStore";
import { AdminSearchBar } from "@components/admin/common/AdminSearchBar";
import { PostItem } from "@components/admin/board/PostItem";
import { DeleteConfirmModal } from "@components/admin/board/DeleteConfirmModal";
import { EscrowModal } from "@components/admin/board/EscrowModal";
import { useInfiniteScroll } from "@hooks/useInfiniteScroll";
import { useModal } from "@hooks/useModal";
import { ADMIN_TEXT } from "@constant/admin";
import type { BanRequest } from "@types";

import { useUserStore } from "@store/userStore";

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
    setPostStatusFilter,
  } = useAdminStore();

  const { showSnackbar } = useUserStore();

  // Modal State
  const {
    isOpen: isModalOpen,
    modalData,
    openModal,
    closeModal,
  } = useModal<"POST" | "COMMENT", unknown>();

  const [deleteReason, setDeleteReason] = useState<
    BanRequest["reasonCode"] | ""
  >("");
  const [escrowPostId, setEscrowPostId] = useState<number | null>(null);
  const [escrowAnswerId, setEscrowAnswerId] = useState<number | null>(null);

  const handleOpenSettleModal = (postId: number, answerId: number) => {
    setEscrowPostId(postId);
    setEscrowAnswerId(answerId);
  };

  const handleCloseEscrowModal = () => {
    setEscrowPostId(null);
    setEscrowAnswerId(null);
  };

  // Infinite Scroll Observer
  const observerRef = useInfiniteScroll({
    onLoadMore: () => fetchPosts(false),
    hasMore,
    isLoading: isFetchingPosts,
  });

  // 마운트 시 1회만 실행 — fetchPosts를 deps에 넣으면 스토어 상태 변경마다
  // 새 함수 참조가 생성되어 무한 루프 발생
  useEffect(() => {
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handleOpenDeleteModal = (
    type: "POST" | "COMMENT",
    postId: number,
    commentId?: number
  ) => {
    openModal(type, postId, commentId);
    setDeleteReason("");
  };

  const handleCloseModal = () => {
    closeModal();
    setDeleteReason("");
  };

  const confirmDelete = async () => {
    if (!modalData.targetId) return;

    const selectedReason = ADMIN_TEXT.POST.REASONS.find(
      (r) => r.value === deleteReason
    );
    const reasonLabel = selectedReason
      ? selectedReason.label
      : ADMIN_TEXT.POST.MSG_DELETE_REASON;

    try {
      if (modalData.type === "POST") {
        await banPost(
          modalData.targetId,
          reasonLabel,
          deleteReason as BanRequest["reasonCode"]
        );
        showSnackbar(
          `${ADMIN_TEXT.COMMON.FILTER.POSTING} ${ADMIN_TEXT.COMMON.FILTER.DELETED} 완료`
        );
      } else if (modalData.type === "COMMENT" && modalData.subTargetId) {
        await deleteComment(
          modalData.targetId,
          modalData.subTargetId,
          reasonLabel,
          deleteReason as BanRequest["reasonCode"]
        );
        showSnackbar(
          `${ADMIN_TEXT.POST.LABEL_COMMENT} ${ADMIN_TEXT.COMMON.FILTER.DELETED} 완료`
        );
      }
    } catch (error) {
      showSnackbar(`${ADMIN_TEXT.SETTINGS.RECOVERY.MSG_FAILED}`);
      console.error("Failed to delete post/comment:", error);
    } finally {
      handleCloseModal();
    }
  };

  const handleRestorePost = async (postId: number) => {
    try {
      await unbanPost(postId);
      showSnackbar(`${ADMIN_TEXT.POST.BTN_RESTORE_POST} 완료`);
    } catch (error) {
      showSnackbar(`${ADMIN_TEXT.SETTINGS.RECOVERY.MSG_FAILED}`);
      console.error(error);
    }
  };

  const handleRestoreComment = async (postId: number, commentId: number) => {
    try {
      await restoreComment(postId, commentId);
      showSnackbar(`${ADMIN_TEXT.POST.BTN_RESTORE_COMMENT} 완료`);
    } catch (error) {
      showSnackbar(`${ADMIN_TEXT.SETTINGS.RECOVERY.MSG_FAILED}`);
      console.error(error);
    }
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
          onFilterChange={(value) =>
            setPostStatusFilter(
              value as Parameters<typeof setPostStatusFilter>[0]
            )
          }
        />
      </div>

      {/* Post List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            style={{
              contentVisibility: "auto",
              containIntrinsicSize: "0 180px",
            }}
          >
            <PostItem
              post={post}
              onOpenDeleteModal={handleOpenDeleteModal}
              onRestorePost={handleRestorePost}
              onRestoreComment={handleRestoreComment}
              onOpenEscrowModal={setEscrowPostId}
              onOpenSettleModal={handleOpenSettleModal}
            />
          </div>
        ))}

        {/* Sentinel for Infinite Scroll */}
        {hasMore && (
          <div
            ref={observerRef}
            className="h-10 flex items-center justify-center"
          >
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
        onReasonChange={(reason) =>
          setDeleteReason(reason as BanRequest["reasonCode"])
        }
        onClose={handleCloseModal}
        onConfirm={confirmDelete}
      />

      {/* Escrow Modal */}
      <EscrowModal
        isOpen={!!escrowPostId}
        postId={escrowPostId || 0}
        answerId={escrowAnswerId}
        onClose={handleCloseEscrowModal}
      />
    </div>
  );
};

export default PostManagement;
