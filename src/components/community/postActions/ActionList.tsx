import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Hash, Clock, ExternalLink } from "lucide-react";
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
import { useUserStore } from "@store";
import { getNetworkConfig } from "@utils";
import { INQUIRY_FORM_URL } from "@constant/inquiry";

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
  targetId?: number;
  isAnswer?: boolean;
}

const Web3StatusInfo = ({ execution }: { execution: Web3Execution }) => {
  const { resource, executionIntent, transaction } = execution;
  const { EXPLORER_TX_URL } = getNetworkConfig();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-500 bg-green-50 border-green-100";
      case "FAILED":
        return "text-red-500 bg-red-50 border-red-100";
      case "PENDING_EXECUTION":
      case "PENDING_ONCHAIN":
        return "text-amber-500 bg-amber-50 border-amber-100";
      default:
        return "text-gray-500 bg-gray-50 border-gray-100";
    }
  };

  const handleExplorerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (transaction?.txHash) {
      window.open(`${EXPLORER_TX_URL}${transaction.txHash}`, "_blank");
    }
  };

  return (
    <div className="w-full bg-gray-50/50 rounded-[32px] border border-gray-100 p-5 mb-4 shadow-sm animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-main/10 rounded-lg text-main">
            <Activity size={16} strokeWidth={3} />
          </div>
          <span className="text-[13px] font-black text-gray-900 tracking-tight">
            트랜잭션 세부 정보
          </span>
        </div>
        <div
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border transition-all ${getStatusColor(
            resource.status
          )}`}
        >
          {resource.status}
        </div>
      </div>

      <div className="space-y-3.5">
        <div className="flex items-start gap-3">
          <div className="mt-1 text-gray-300">
            <Hash size={12} strokeWidth={3} />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Transaction Hash
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-mono font-medium text-gray-500 truncate">
                {transaction?.txHash || "내역 없음"}
              </span>
              {transaction?.txHash && (
                <button
                  onClick={handleExplorerClick}
                  className="p-1 hover:bg-white rounded-md transition-colors text-gray-300 hover:text-main"
                >
                  <ExternalLink size={12} strokeWidth={3} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="mt-1 text-gray-300">
            <Clock size={12} strokeWidth={3} />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Execution Intent
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-black text-gray-700">
                {executionIntent.status}
              </span>
              <span className="text-[10px] font-medium text-gray-400">
                ID: {executionIntent.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionList = ({
  size = "md",
  type,
  parentPostId,
  id,
  onDeletePostSuccess,
  isSelectable = false,
  authorId,
  answerContent,
  answerImages,
  commentContent = "",
  onUpdateReplySuccess,
  isEditable,
  isWeb3Executable,
  Web3Execution,
  targetId = 0,
  isAnswer = false,
}: PostActionListProps) => {
  const navigate = useNavigate();
  const [modalType, setModalType] = useState<ActionModalType>(null);
  const [content, setContent] = useState(commentContent);
  const { deletePost, acceptAnswer } = usePostService();
  const { updateComment, deleteComment } = useCommentService(
    targetId,
    isAnswer,
    { autoFetch: false }
  );

  const userId = useUserStore((s) => s.user?.userId);
  const isMine = userId !== undefined && Number(authorId) === Number(userId);

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
        navigate(`/community/answer/edit/${id}/${parentPostId}`, {
          state: { content: answerContent, images: answerImages },
        });
      }
    }
    if (type === "COMMENT") {
      setContent(commentContent);
      setModalType("EDIT_COMMENT");
    }
  };

  const handleConfirmEditClick = async () => {
    if (content === commentContent) return;

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
    window.open(INQUIRY_FORM_URL, "_blank", "noopener,noreferrer");
    closeModal();
  };

  const handleSignClick = () => {
    if (type === "ANSWER") {
      navigate(
        `/verify-wallet/${Web3Execution?.resource.type?.toLowerCase()}/${Web3Execution?.resource.id}/${parentPostId}`,
        { state: { intent: Web3Execution } }
      );
    } else {
      navigate(
        `/verify-wallet/${Web3Execution?.resource.type?.toLowerCase()}/${Web3Execution?.resource.id}`,
        { state: { intent: Web3Execution } }
      );
    }
  };

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
    return (
      <div className="flex flex-col">
        {Web3Execution && <Web3StatusInfo execution={Web3Execution} />}
        {(() => {
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
                  isSubmitDisabled={content === commentContent}
                />
              );

            default:
              return null;
          }
        })()}
      </div>
    );
  };

  return (
    <>
      <div
        onClick={openActionModal}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
      >
        <img src="/icon/more.svg" alt="더보기" className={sizeMap[size]} />
      </div>

      {modalType && (
        <CommonModal placement="center">{renderModalContent()}</CommonModal>
      )}
    </>
  );
};

export default ActionList;
