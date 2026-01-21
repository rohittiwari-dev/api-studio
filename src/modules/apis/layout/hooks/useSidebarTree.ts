"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import useRequestStore from "@/modules/apis/requests/store/request.store";
import useCollectionStore from "@/modules/apis/collections/store/collection.store";
import { generateSidebarTree } from "../utils/generateSidebarTree";

/**
 * Hook to get sidebar tree from stores
 * Subscribes to store state for real-time updates
 */
export function useSidebarTree() {
  // Use shallow comparison to prevent infinite re-renders
  // Filter out NEW type requests (unsaved, shouldn't appear in sidebar)
  const requests = useRequestStore(
    useShallow((state) =>
      Object.values(state.requests).filter((r) => r.type !== "NEW"),
    ),
  );
  const collections = useCollectionStore(
    useShallow((state) => Object.values(state.collections)),
  );

  // Generate tree from store state
  const sidebarTree = useMemo(() => {
    return generateSidebarTree(requests, collections);
  }, [requests, collections]);

  return {
    items: sidebarTree,
  };
}

export default useSidebarTree;
