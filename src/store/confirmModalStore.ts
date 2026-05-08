import { create } from "zustand";

interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  variant: "warning" | "error" | "info" | "success";
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
  confirmLabel: string;
  cancelLabel: string;
  openConfirm: (options: {
    title: string;
    message: string;
    variant?: "warning" | "error" | "info" | "success";
    onConfirm: () => void;
    onCancel?: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
  }) => void;
  closeConfirm: () => void;
}

export const useConfirmModalStore = create<ConfirmModalState>((set) => ({
  isOpen: false,
  title: "",
  message: "",
  variant: "warning",
  onConfirm: null,
  onCancel: null,
  confirmLabel: "확인",
  cancelLabel: "취소",
  openConfirm: (options) =>
    set({
      isOpen: true,
      title: options.title,
      message: options.message,
      variant: options.variant || "warning",
      onConfirm: options.onConfirm,
      onCancel: options.onCancel || null,
      confirmLabel: options.confirmLabel || "확인",
      cancelLabel: options.cancelLabel || "취소",
    }),
  closeConfirm: () =>
    set({
      isOpen: false,
      title: "",
      message: "",
      onConfirm: null,
      onCancel: null,
    }),
}));
