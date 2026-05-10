import { create } from "zustand";

type MailboxType = "inbox" | "sent" | "trash" | "unread";

interface GmailUiState {
  selectedMessageId: string | null;

  selectedMailbox: MailboxType;

  search: string;

  sidebarCollapsed: boolean;

  setSelectedMessageId: (id: string | null) => void;

  setSelectedMailbox: (mailbox: MailboxType) => void;

  setSearch: (search: string) => void;

  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useGmailStore = create<GmailUiState>((set) => ({
  selectedMessageId: null,

  selectedMailbox: "inbox",

  search: "",

  sidebarCollapsed: false,

  setSelectedMessageId: (id) =>
    set({
      selectedMessageId: id,
    }),

  setSelectedMailbox: (mailbox) =>
    set({
      selectedMailbox: mailbox,
    }),

  setSearch: (search) =>
    set({
      search,
    }),

  setSidebarCollapsed: (collapsed) =>
    set({
      sidebarCollapsed: collapsed,
    }),
}));
