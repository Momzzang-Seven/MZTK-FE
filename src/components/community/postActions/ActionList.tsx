import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CommonModal } from "@components/common";
import {
  MyPostActions,
  OtherPostActions,
  ConfirmSelect,
  ConfirmDelete,
  ConfirmReport,
  EditComment,
} from "@components/community";
import type { ActionModalType, Web3Execution, Image } from "@types";
import { usePostService, useCommentService } from "@hooks";

const sizeMap = {
  xs: "w-3 h-3",
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-6 h-6",
} as const;

interface PostActionListProps {
  size?: "xs" | "sm" | "md" | "lg";
  type: string;
  parentPostId?: number;
  id?: number;
  authorId: number;
  onDeletePostSuccess?: () => void;
  isSelectable?: boolean;
  commentId?: number;
  answerContent?: string;
  answerImages?: Image[];
  commentContent?: string;
  onUpdateReplySuccess?: () => void;
  isEditable?: boolean;
  isWeb3Executable?: boolean;
  Web3Execution?: Web3Execution;
}

const ActionList = ({
  size = "md",
  type,
  parentPostId,
  id,
  onDeletePostSuccess,
  isSelectable = true,
  authorId,
  answerContent,
  answerImages,
  commentContent = "",
  onUpdateReplySuccess,
  isEditable,
  isWeb3Executable,
  Web3Execution
}: PostActionListProps) => {
  const navigate = useNavigate();
  const [modalType, setModalType] = useState<ActionModalType>(null);
  const [content, setContent] = useState(commentContent);
  const { deletePost, acceptAnswer } = usePostService();
  const { updateComment, deleteComment } = useCommentService(0); // 댓글 수정, 삭제는 postId가 필요 없으므로 0으로 고정

  const stored = localStorage.getItem("user-storage");
  const userId = stored ? JSON.parse(stored)?.state?.user?.userId : null;
  const isMine = userId !== null && authorId === userId;

  const openActionModal = () =>
    isMine ? setModalType("MY") : setModalType("OTHERS");

  const closeModal = () => setModalType(null);

  const handleEditClick = () => {
    if (type === "FREE") navigate(`/community/free/edit/${id}/select-image`);
    if (type === "QUESTION") {
      if (isEditable && !isWeb3Executable) {
        navigate(`/community/question/edit/${id}`);
      }
    }
    if (type === "ANSWER" && answerContent) {
      if (isEditable && !isWeb3Executable) {
        navigate(`/community/answer/edit/${id}/${parentPostId}`, { state: { content: answerContent, images: answerImages } });
      }
    }
    if (type === "COMMENT") setModalType("EDIT_COMMENT");
  };

  const handleConfirmEditClick = async () => {
    if (type === "COMMENT" && id) {
      await updateComment(id, content);
    }
    closeModal();
    onUpdateReplySuccess?.();
  };
  
  const handleConfirmDeleteClick = async () => {
    if (type === "COMMENT" && id) {
      await deleteComment(id);
    } else if (type === "QUESTION" && isEditable && id) {
      await deletePost(type, id);
    } else if (type === "ANSWER" && isEditable && parentPostId && id) {
      await deletePost(type, id, parentPostId);
    } else if (type === "FREE" && id) {
      await deletePost(type, id);
    }
    closeModal();
    onUpdateReplySuccess?.();
    onDeletePostSuccess?.();
  };
  
  const handleConfirmAcceptClick = async () => {
    if (type === "ANSWER" && id && parentPostId) {
      await acceptAnswer(parentPostId, id);
    }
    closeModal();
  };
  
  const handleConfirmReportClick = () => {
    closeModal();
  };

  const handleSignClick = () => {
    if (type === "ANSWER") {
      navigate(`/verify-wallet/${Web3Execution?.resource.type?.toLowerCase()}/${Web3Execution?.resource.id}/${parentPostId}`, {state : { intent: Web3Execution }})
    } else {
      navigate(`/verify-wallet/${Web3Execution?.resource.type?.toLowerCase()}/${Web3Execution?.resource.id}`, {state : { intent: Web3Execution }})
    }
  }

  const handleDeleteClick = () => {
    setModalType("DELETE_CONFIRM");
  };

  const handleReportClick = () => {
    setModalType("REPORT_CONFIRM");
  };


  const handleSelectClick = () => {
    setModalType("SELECT_CONFIRM");
  };

  const renderModalContent = () => {
    switch (modalType) {
      case "MY":
        return (
          <MyPostActions
            handleEditClick={handleEditClick}
            handleDeleteClick={handleDeleteClick}
            handleCancelClick={closeModal}
            handleSignClick={handleSignClick}
            isWeb3Executable={isWeb3Executable ?? false}
            isEditable={isEditable ?? true}
          />
        );

      case "OTHERS":
        return (
          <OtherPostActions
            type={type}
            isSelectable={isSelectable}
            handleSelectClick={handleSelectClick}
            handleReportClick={handleReportClick}
            handleCancelClick={closeModal}
          />
        );

      case "SELECT_CONFIRM":
        return (
          <ConfirmSelect
            handleSelectClick={handleConfirmAcceptClick}
            handleCancelClick={closeModal}
          />
        );

      case "DELETE_CONFIRM":
        return (
          <ConfirmDelete
            handleConfirmClick={handleConfirmDeleteClick}
            handleCancelClick={closeModal}
          />
        );

      case "REPORT_CONFIRM":
        return (
          <ConfirmReport
            handleReportClick={handleConfirmReportClick}
            handleCancelClick={closeModal}
          />
        );

      case "EDIT_COMMENT":
        return (
          <EditComment
            setCommentContent={setContent}
            commentContent={content}
            handleEditClick={handleConfirmEditClick}
            handleCancelClick={closeModal}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div
        onClick={openActionModal}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      >
        <img src="/icon/more.svg" alt="더보기" className={sizeMap[size]} />
      </div>

      {modalType && <CommonModal>{renderModalContent()}</CommonModal>}
    </>
  );
};

export default ActionList;
