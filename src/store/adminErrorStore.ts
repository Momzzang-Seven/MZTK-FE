import { create } from "zustand";

interface AdminErrorState {
  isOpen: boolean;
  status: number | null;
  code: string | null;
  message: string | null;
  detail: unknown | null;
  url: string | null;
  method: string | null;
  openErrorModal: (errorData: {
    status: number;
    code?: string;
    message?: string;
    detail?: unknown;
    url?: string;
    method?: string;
  }) => void;
  closeErrorModal: () => void;
}

export const useAdminErrorStore = create<AdminErrorState>((set) => ({
  isOpen: false,
  status: null,
  code: null,
  message: null,
  detail: null,
  url: null,
  method: null,
  openErrorModal: (data) => {
    // 이미 모달이 열려있다면 추가 에러는 무시 (중복 팝업 방지)
    if (useAdminErrorStore.getState().isOpen) return;

    set({
      isOpen: true,
      status: data.status,
      code: data.code || "UNKNOWN_ERROR",
      message: data.message || "서버 응답 중 오류가 발생했습니다.",
      detail: data.detail || null,
      url: data.url || null,
      method: data.method || null,
    });
  },
  closeErrorModal: () =>
    set({
      isOpen: false,
      status: null,
      code: null,
      message: null,
      detail: null,
      url: null,
      method: null,
    }),
}));
