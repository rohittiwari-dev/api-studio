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

/** AI is enabled globally but requires valid workspace configuration */
export const isAiEnabled = () => true;

export const isWorkspaceAiConfigured = (workspace: any) => {
  if (!workspace?.aiConfig) return false;
  const config = workspace.aiConfig as any;
  if (config.enabled === false) return false;
  if (!config.apiKey) return false;
  return true;
};
