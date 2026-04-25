import { create } from "zustand";

interface AuthModalState {
  unauthorized: boolean;
  sanctioned: boolean;
  setUnauthorized: (value: boolean) => void;
  setSanctioned: (value: boolean) => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  unauthorized: false,
  sanctioned: false,
  setUnauthorized: (value) => set({ unauthorized: value }),
  setSanctioned: (value) => set({ sanctioned: value }),
}));
