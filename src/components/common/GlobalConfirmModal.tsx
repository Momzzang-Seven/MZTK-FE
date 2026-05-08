import { useConfirmModalStore } from "@store";
import { CommonModal } from "./CommonModal";

export const GlobalConfirmModal = () => {
  const {
    isOpen,
    title,
    message,
    variant,
    onConfirm,
    onCancel,
    confirmLabel,
    cancelLabel,
    closeConfirm,
  } = useConfirmModalStore();

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    closeConfirm();
  };

  const handleCancel = () => {
    if (onCancel) onCancel();
    closeConfirm();
  };

  return (
    <CommonModal
      title={title}
      desc={message}
      variant={variant}
      confirmLabel={confirmLabel}
      onConfirmClick={handleConfirm}
      cancelLabel={cancelLabel}
      onCancelClick={handleCancel}
    />
  );
};
