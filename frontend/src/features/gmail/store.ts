import { create } from "zustand";

interface GmailUiState {
  selectedMessageId: string | null;

  setSelectedMessageId: (id: string | null) => void;
}

export const useGmailStore = create<GmailUiState>((set) => ({
  selectedMessageId: null,

  setSelectedMessageId: (id) =>
    set({
      selectedMessageId: id,
    }),
}));
