"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import useCollectionStore from "@/modules/apis/collections/store/collection.store";
import useRequestStore from "@/modules/apis/requests/store/request.store";
import useWorkspaceState from "@/modules/workspace/store";
import { generateSidebarTree } from "../utils/generateSidebarTree";

export function useSidebarTree() {
  const { activeWorkspace } = useWorkspaceState();
  const requests = useRequestStore(
    useShallow((state) =>
      Object.values(state.requests).filter((r) => r.type !== "NEW"),
    ),
  );
  const collections = useCollectionStore(
    useShallow((state) => Object.values(state.collections)),
  );

  const sidebarTree = useMemo(() => {
    return generateSidebarTree(requests, collections, activeWorkspace?.id);
  }, [requests, collections, activeWorkspace?.id]);

  return {
    items: sidebarTree,
  };
}

export default useSidebarTree;
