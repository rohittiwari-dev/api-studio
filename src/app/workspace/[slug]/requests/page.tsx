"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Tabs } from "@/components/ui/tabs";
import TabBar from "@/modules/apis/requests/components/tab-bar";
import TabContent from "@/modules/apis/requests/components/tab-content";
import { useWorkspaceSwitcher } from "@/modules/workspace/hooks/use-workspace-switcher";
import useWorkspaceState from "@/modules/workspace/store";
import useRequestSyncStoreState from "@/modules/apis/requests/hooks/requestSyncStore";
import WorkspaceEmptyState from "@/modules/workspace/components/workspace-empty-state";

const Page = () => {
  const { tabs, setActiveRequest, activeRequest } = useRequestSyncStoreState();
  const { activeWorkspace } = useWorkspaceState();
  const { initializeWorkspaceTracking, currentWorkspaceId } =
    useWorkspaceSwitcher();

  // Initialize workspace tracking when the page loads
  useEffect(() => {
    if (activeWorkspace?.id && currentWorkspaceId !== activeWorkspace.id) {
      initializeWorkspaceTracking(activeWorkspace.id);
    }
  }, [activeWorkspace?.id, currentWorkspaceId, initializeWorkspaceTracking]);

  return (
    <Tabs
      value={activeRequest?.id || tabs[0]?.id}
      onValueChange={(id) => {
        // Sync both tab and request stores
        setActiveRequest(id);
      }}
      className="h-full w-full flex flex-col gap-0!"
    >
      <TabBar />
      {(tabs.length && <TabContent id={activeRequest?.id || tabs[0]?.id} />) ||
        null}
      {tabs.length <= 0 && <WorkspaceEmptyState />}
    </Tabs>
  );
};

export default Page;
