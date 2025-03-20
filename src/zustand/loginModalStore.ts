import { create } from "zustand";

interface LoginState {
  loginPopupOpen: boolean;
  setLoginPopupOpen: (open: boolean) => void;
}

export const useLoginStore = create<LoginState>((set) => ({
  loginPopupOpen: true,
  setLoginPopupOpen: (open: boolean) => set({ loginPopupOpen: open }),
}));
