"use client";

import React, { useLayoutEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { createId } from "@paralleldrive/cuid2";
import { MoreHorizontal, Plus, X, Pencil, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BodyType, HttpMethod } from "@/generated/prisma/browser";
import { cn } from "@/lib/utils";
import { RequestType } from "../types/store.types";
import { RequestIcon } from "./RequestType";
import { RenameRequestDialog } from "./RenameRequestDialog";
import { useRenameRequest } from "../hooks/queries";
import MethodBadge from "@/components/app-ui/method-badge";
import { RequestStateInterface } from "../types/request.types";
import useRequestSyncStoreState from "../hooks/requestSyncStore";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";
import UnsavedChangesDialog from "./UnsavedChangesDialog";

// Method badge component for API requests

const TabItem = ({
  id,
  title,
  type,
  method,
  workspaceId,
  onCloseClick = () => {},
  onCloseOthers = () => {},
  onCloseAll = () => {},
  onTabClick = () => {},
  onDragStart = () => {},
  onDragEnd = () => {},
  onDragOver = () => {},
  onDragLeave = () => {},
  onDrop = () => {},
  isDragging = false,
  showDropIndicator = false,
  unsaved = false,
}: {
  id: string;
  title: string;
  type: RequestType | "NEW";
  unsaved?: boolean;
  method?: HttpMethod;
  workspaceId: string;
  onCloseClick?: (id: string) => void;
  onCloseOthers?: (id: string) => void;
  onCloseAll?: () => void;
  onTabClick?: (id: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
  isDragging?: boolean;
  showDropIndicator?: boolean;
}) => {
  const { updateRequest } = useRequestSyncStoreState();
  const [showRenameDialog, setShowRenameDialog] = useState(false);

  // Use the rename mutation hook for DB persistence and sidebar refresh
  const renameMutation = useRenameRequest(workspaceId, {
    onSuccess: () => {
      // Local store updates are done in handleRename
    },
    onError: (error: unknown) => {
      console.error("Failed to rename request", error);
    },
  });

  const handleRename = (newName: string) => {
    updateRequest(id, { name: newName });

    // Save to DB and refresh sidebar
    renameMutation.mutate({ requestId: id, name: newName });
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild className="bg-transparent!">
          <div
            className={cn(
              "relative flex items-center",
              isDragging && "opacity-50 scale-95 z-50",
            )}
            id={id + type + method + title}
            style={{
              transform: isDragging ? "scale(0.95)" : "scale(1)",
              transition: "all 200ms cubic-bezier(0.25, 0.1, 0.25, 1)",
            }}
          >
            {showDropIndicator && (
              <div className="absolute top-0 bottom-0 left-0 z-10 w-0.5 bg-primary animate-pulse rounded-full" />
            )}
            <TabsTrigger
              value={id}
              onClick={(e) => {
                onTabClick(id);
              }}
              onDoubleClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowRenameDialog(true);
              }}
              draggable
              onDragStart={(e) => onDragStart(e, id)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => onDragOver(e, id)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, id)}
              className={cn(
                "group relative! flex! items-center! justify-between! gap-2! px-3!",
                // Inactive state - Visible glass background
                "bg-muted/20! hover:bg-muted/30! text-muted-foreground! border-transparent!",
                // Active state - Blended with content
                "data-[state=active]:bg-background/60! data-[state=active]:backdrop-blur-xl! data-[state=active]:text-foreground! data-[state=active]:shadow-none!",
                "data-[state=active]:border-b-transparent!", // Seamless transition to content

                // Shape & Layout
                "rounded-t-md! rounded-b-none! w-44! max-w-44! h-[38px]!",
                "text-xs! cursor-pointer! transition-all! duration-200!",
                "border-r! border-t! border-l! border-white/5!", // Subtle border definition

                showDropIndicator && "ml-1",
                unsaved && "italic",
              )}
            >
              {/* Method/Type Icon */}
              {type !== "NEW" && (
                <span className="flex items-center">
                  {type === "API" ? (
                    <MethodBadge method={method} />
                  ) : (
                    <RequestIcon type={type} className="size-4" />
                  )}
                </span>
              )}

              {/* Title */}
              <span
                className="flex flex-1 items-center gap-1 outline-none overflow-hidden text-start truncate text-ellipsis whitespace-nowrap"
                title="Double-click to rename"
              >
                {title}
              </span>

              {/* Unsaved indicator */}
              {unsaved && (
                <span
                  className="shrink-0 bg-indigo-500 rounded-full w-1 h-1"
                  title="Unsaved changes"
                />
              )}

              {/* Close button */}
              <div
                data-close-button
                className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-muted transition-all duration-150 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onCloseClick(id);
                }}
              >
                <X className="size-3 text-muted-foreground hover:text-foreground" />
              </div>
            </TabsTrigger>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-44 p-1">
          <ContextMenuItem
            onClick={() => setShowRenameDialog(true)}
            className="text-xs py-1 px-2 cursor-pointer"
          >
            <Pencil className="mr-2 size-3" />
            Rename
          </ContextMenuItem>
          <ContextMenuSeparator className="my-1" />
          <ContextMenuItem
            onClick={() => onCloseClick(id)}
            className="text-xs py-1 px-2 cursor-pointer"
          >
            <X className="mr-2 size-3" />
            Close Tab
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => onCloseOthers(id)}
            className="text-xs py-1 px-2 cursor-pointer"
          >
            <XCircle className="mr-2 size-3" />
            Close Other Tabs
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => onCloseAll()}
            variant="destructive"
            className="text-xs py-1 px-2 cursor-pointer"
          >
            <XCircle className="mr-2 size-3" />
            Close All Tabs
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Rename Dialog */}
      <RenameRequestDialog
        open={showRenameDialog}
        onOpenChange={setShowRenameDialog}
        currentName={title}
        onRename={handleRename}
      />
    </>
  );
};

const TabBar = () => {
  const {
    tabs,
    activeRequest,
    setRequestsState,
    openRequest,
    setActiveRequest,
    closeTab,
    closeOtherTabs,
    closeAllTabs,
    getRequestById,
    activeWorkspace,
  } = useRequestSyncStoreState();
  const activeTabId = activeRequest?.id;
  const currentWorkspaceTabs = tabs;
  const [visibleTabs, setVisibleTabs] = useState<RequestStateInterface[]>([]);
  const [hiddenTabs, setHiddenTabs] = useState<RequestStateInterface[]>([]);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hiddenTabsOpen, setHiddenTabsOpen] = useState(false);
  const tabBarRef = useRef<HTMLDivElement>(null);

  // Unsaved changes guard
  const unsavedGuard = useUnsavedChangesGuard();

  // Track the current visible window start index to minimize shifting
  const visibleStartIndexRef = useRef(0);

  // Calculate visible vs hidden tabs based on container width
  // ONLY shift tabs when the active tab is not currently visible
  const calculateVisibleTabs = useCallback(() => {
    if (!tabBarRef.current || isDragging) return;

    const containerWidth = tabBarRef.current.offsetWidth;
    // Reserve space for + button and overflow button
    const reservedSpace = 100;
    const availableWidth = containerWidth - reservedSpace;
    const tabWidth = 176; // w-44 = 176px
    const maxVisibleTabs = Math.max(1, Math.floor(availableWidth / tabWidth));

    // If all tabs fit, show all and reset
    if (maxVisibleTabs >= currentWorkspaceTabs.length) {
      setVisibleTabs(currentWorkspaceTabs);
      setHiddenTabs([]);
      visibleStartIndexRef.current = 0;
      return;
    }

    const activeTabIndex = currentWorkspaceTabs.findIndex(
      (tab) => tab.id === activeTabId,
    );

    let startIndex = visibleStartIndexRef.current;
    let endIndex = startIndex + maxVisibleTabs;

    // Clamp to valid range
    if (startIndex < 0) startIndex = 0;
    if (endIndex > currentWorkspaceTabs.length) {
      endIndex = currentWorkspaceTabs.length;
      startIndex = Math.max(0, endIndex - maxVisibleTabs);
    }

    // Only shift if the active tab is NOT in the current visible window
    if (activeTabIndex !== -1) {
      if (activeTabIndex < startIndex) {
        // Active tab is before visible window - shift left
        startIndex = activeTabIndex;
        endIndex = startIndex + maxVisibleTabs;
      } else if (activeTabIndex >= endIndex) {
        // Active tab is after visible window - shift right
        endIndex = activeTabIndex + 1;
        startIndex = Math.max(0, endIndex - maxVisibleTabs);
      }
      // If active tab is already visible, don't shift at all!
    }

    visibleStartIndexRef.current = startIndex;

    setVisibleTabs(currentWorkspaceTabs.slice(startIndex, endIndex));
    setHiddenTabs([
      ...currentWorkspaceTabs.slice(0, startIndex),
      ...currentWorkspaceTabs.slice(endIndex),
    ]);
  }, [currentWorkspaceTabs, activeTabId, isDragging]);

  useLayoutEffect(() => {
    // eslint-disable-next-line
    calculateVisibleTabs();
    window.addEventListener("resize", calculateVisibleTabs);

    return () => {
      window.removeEventListener("resize", calculateVisibleTabs);
    };
  }, [calculateVisibleTabs]);

  const handleDragStart = (e: React.DragEvent, tabId: string) => {
    setDraggedTabId(tabId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", tabId);
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
    setDragOverTabId(null);
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (draggedTabId && draggedTabId !== tabId) {
      setDragOverTabId(tabId);
    }
  };

  const handleDragLeave = () => {
    setDragOverTabId(null);
  };

  const handleDrop = (e: React.DragEvent, targetTabId: string) => {
    e.preventDefault();

    if (!draggedTabId || draggedTabId === targetTabId) return;

    // Find indices in the CURRENT WORKSPACE tabs only
    const workspaceTabs = [...currentWorkspaceTabs];
    const draggedIndex = workspaceTabs.findIndex(
      (tab) => tab.id === draggedTabId,
    );
    const targetIndex = workspaceTabs.findIndex(
      (tab) => tab.id === targetTabId,
    );

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Reorder within workspace tabs
    const [draggedTab] = workspaceTabs.splice(draggedIndex, 1);
    workspaceTabs.splice(targetIndex, 0, draggedTab);

    // Update tabIds with the reordered array
    setRequestsState({
      tabIds: workspaceTabs.map((tab) => tab.id),
    });

    // Don't change active tab on drop - just reorder
    setDraggedTabId(null);
    setDragOverTabId(null);
    setIsDragging(false);
  };

  const handleAddNewTab = () => {
    const requestId = createId();
    openRequest({
      id: requestId,
      name: "New Request",
      type: "NEW" as RequestType,
      method: null,
      url: "",
      headers: [],
      body: {
        raw: "",
        formData: [],
        urlEncoded: [],
        file: null,
        json: {},
      },
      workspaceId: activeWorkspace?.id || "",
      unsaved: true,
      bodyType: BodyType.NONE,
      parameters: [],
      auth: { type: "NONE", data: null },
      collectionId: "",
      description: "",
      messageType: "CONNECTION",
      createdAt: new Date(),
      updatedAt: new Date(),
      savedMessages: [],
      sortOrder: 0,
    });
  };

  return (
    <>
      <TabsList
        className="relative flex-1 justify-start gap-0.5 bg-background/30 backdrop-blur-sm p-0 px-2 pt-2 pb-0 rounded-none w-full h-fit! max-h-[42px] overflow-hidden"
        ref={tabBarRef}
      >
        {/* Visible tabs with animation wrapper */}
        <LayoutGroup>
          <AnimatePresence mode="popLayout">
            {visibleTabs.map((tab) => (
              <motion.div
                key={tab.id}
                layout="position"
                layoutId={tab.id}
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -10 }}
                transition={{
                  layout: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
                  opacity: { duration: 0.15 },
                  scale: { duration: 0.15 },
                  x: { duration: 0.15 },
                }}
              >
                <TabItem
                  id={tab.id}
                  title={tab.name}
                  type={tab.type || "NEW"}
                  method={tab.method || undefined}
                  workspaceId={tab.workspaceId}
                  onCloseClick={() =>
                    unsavedGuard.confirmClose(tab.id, () => closeTab(tab.id))
                  }
                  onCloseOthers={() =>
                    unsavedGuard.confirmCloseOthers(tab.id, () =>
                      closeOtherTabs(tab.id),
                    )
                  }
                  onCloseAll={() =>
                    unsavedGuard.confirmCloseAll(() => closeAllTabs())
                  }
                  onTabClick={() => {
                    setActiveRequest(tab.id);
                  }}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  unsaved={tab.unsaved && getRequestById(tab.id)?.unsaved}
                  isDragging={draggedTabId === tab.id}
                  showDropIndicator={
                    dragOverTabId === tab.id && draggedTabId !== tab.id
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </LayoutGroup>

        {/* Hidden tabs overflow menu */}
        {hiddenTabs.length > 0 && (
          <Popover open={hiddenTabsOpen} onOpenChange={setHiddenTabsOpen}>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0 cursor-pointer"
                title={`${hiddenTabs.length} more tabs`}
              >
                <MoreHorizontal />
                <span className="sr-only">{hiddenTabs.length} more tabs</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-1 w-auto max-h-[300px] overflow-y-auto"
              align="end"
            >
              <div className="flex flex-col gap-1">
                {hiddenTabs.map((tab) => (
                  <div
                    key={tab.id}
                    onClick={() => {
                      setActiveRequest(tab.id);
                      setHiddenTabsOpen(false);
                    }}
                    className={cn(
                      "group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted",
                      activeTabId === tab.id && "bg-muted",
                    )}
                  >
                    <span className="flex items-center">
                      {tab.type === "API" ? (
                        <MethodBadge method={tab.method || undefined} />
                      ) : tab.type !== "NEW" ? (
                        <RequestIcon
                          type={tab.type || "NEW"}
                          className="size-4"
                        />
                      ) : null}
                    </span>
                    <span className="flex-1 text-sm truncate max-w-[150px]">
                      {tab.name}
                    </span>
                    <button
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-background transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        unsavedGuard.confirmClose(tab.id, () =>
                          closeTab(tab.id),
                        );
                      }}
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Add new tab button */}
        <Button
          size="icon"
          variant="ghost"
          className="shrink-0 h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors"
          onClick={handleAddNewTab}
          title="New Tab"
        >
          <Plus className="size-4" />
        </Button>
      </TabsList>

      {/* Unsaved Changes Dialog */}
      {unsavedGuard.dialogProps && (
        <UnsavedChangesDialog {...unsavedGuard.dialogProps} />
      )}
    </>
  );
};

export default TabBar;
