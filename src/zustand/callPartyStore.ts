import { create } from "zustand";

interface CallPartyState {
  cli: string;
  apartyno: number | string | null;
  bpartyno: number | string | null;
  reference_id: string;
  dtmfflag: number;
  recordingflag: number;
  setApartyNo: (data: number | string | null | undefined) => void;
  setBpartyNo: (data: number | string | null | undefined) => void;
}

export const callPartyStore = create<CallPartyState>((set) => ({
  cli: "9610012318",
  apartyno: "",
  bpartyno: "",
  reference_id: "",
  dtmfflag: 0,
  recordingflag: 0,

  setApartyNo: (data: number | string | null | undefined) => {
    set((state) => ({ ...state, apartyno: data }));
  },
  setBpartyNo: (data: number | string | null | undefined) => {
    set((state) => ({ ...state, bpartyno: data }));
  },
}));
