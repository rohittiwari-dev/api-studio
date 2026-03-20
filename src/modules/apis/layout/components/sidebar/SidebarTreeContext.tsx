import type { UniqueIdentifier } from "@dnd-kit/core";
import { createContext, useContext } from "react";

export type DropPosition = "before" | "after" | "inside" | null;

interface SidebarTreeContextType {
  activeId: UniqueIdentifier | null;
  overId: UniqueIdentifier | null;
  dropPosition: DropPosition;
  justMovedId: string | null;
  collapseKey: number;
}

export const SidebarTreeContext = createContext<SidebarTreeContextType>({
  activeId: null,
  overId: null,
  dropPosition: null,
  justMovedId: null,
  collapseKey: 0,
});

export const useSidebarTree = () => useContext(SidebarTreeContext);
