"use client";

import { create } from "zustand";

type PanelType =
  | "request"
  | "environment"
  | "code"
  | "cookies"
  | "auth"
  | "webhooks"
  | null;

interface RightPanelStore {
  activePanel: PanelType;
  setActivePanel: (panel: PanelType) => void;
  togglePanel: (panel: PanelType) => void;
  closePanel: () => void;
}

const useRightPanelStore = create<RightPanelStore>((set, get) => ({
  activePanel: null,

  setActivePanel: (panel) => set({ activePanel: panel }),

  togglePanel: (panel) => {
    const current = get().activePanel;
    set({ activePanel: current === panel ? null : panel });
  },

  closePanel: () => set({ activePanel: null }),
}));

export default useRightPanelStore;
