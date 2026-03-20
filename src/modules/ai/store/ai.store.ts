"use client";

import { create } from "zustand";

interface AiStore {
  isAiPanelOpen: boolean;
  setAiPanelOpen: (open: boolean) => void;
  toggleAiPanel: () => void;
}

const useAiStore = create<AiStore>((set) => ({
  isAiPanelOpen: false,
  setAiPanelOpen: (open) => set({ isAiPanelOpen: open }),
  toggleAiPanel: () => set((s) => ({ isAiPanelOpen: !s.isAiPanelOpen })),
}));

export default useAiStore;

/** Returns true when AI is enabled via NEXT_PUBLIC_AI_ENABLED env var */
export const isAiEnabled = () => process.env.NEXT_PUBLIC_AI_ENABLED === "true";
