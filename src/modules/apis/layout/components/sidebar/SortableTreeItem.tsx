"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { UniqueIdentifier, DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "motion/react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarMenuButton, SidebarMenuSub } from "@/components/ui/sidebar";
import { IconFolderFilled } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { substituteVariables } from "@/lib/utils/substituteVariables";
import { RequestIcon } from "@/modules/apis/requests/components/RequestType";
import { SidebarRequestMenu } from "@/modules/apis/requests/components/SidebarRequestMenu";
import { SidebarCollectionMenu } from "@/modules/apis/collections/components/SidebarCollectionMenu";
import useEnvironmentStore from "@/modules/apis/environment/store/environment.store";
import {
  SidebarItemInterface,
  SidebarCollectionItemInterface,
} from "@/modules/apis/collections/types/sidebar.types";
import { RequestType } from "@/generated/prisma/browser";
import useRequestSyncStoreState from "@/modules/apis/requests/hooks/requestSyncStore";

type DropPosition = "before" | "after" | "inside" | null;

interface SortableTreeItemProps {
  item: SidebarItemInterface;
  overId: UniqueIdentifier | null;
  activeId: UniqueIdentifier | null;
  dropPosition?: DropPosition;
  collapseKey?: number;
  justMovedId?: string | null;
}

export function SortableTreeItem({
  item,
  overId,
  activeId,
  dropPosition,
  collapseKey = 0,
  justMovedId,
}: SortableTreeItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  // Ghost placeholder stays in place with NO transform
  // The DragOverlay component shows the item following the cursor
  const style: React.CSSProperties = {};

  const isOver = overId === item.id;
  const isActive = activeId === item.id;
  const isJustMoved = justMovedId === item.id;

  if (item.type !== "COLLECTION") {
    return (
      <RequestTreeItem
        item={item}
        nodeRef={setNodeRef}
        style={style}
        attributes={attributes}
        listeners={listeners}
        isDragging={isDragging}
        isOver={isOver}
        dropPosition={isOver ? dropPosition : null}
        isJustMoved={isJustMoved}
      />
    );
  }

  return (
    <CollectionTreeItem
      item={item as SidebarCollectionItemInterface}
      nodeRef={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      isDragging={isDragging}
      isOver={isOver}
      overId={overId}
      activeId={activeId}
      dropPosition={isOver ? dropPosition : null}
      collapseKey={collapseKey}
      isJustMoved={isJustMoved}
      justMovedId={justMovedId}
    />
  );
}

interface RequestTreeItemProps {
  item: SidebarItemInterface;
  nodeRef: (node: HTMLElement | null) => void;
  style: React.CSSProperties;
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  isDragging: boolean;
  isOver: boolean;
  dropPosition?: DropPosition | null;
  isJustMoved?: boolean;
}

function RequestTreeItem({
  item,
  nodeRef,
  style,
  attributes,
  listeners,
  isDragging,
  isOver,
  dropPosition,
  isJustMoved,
}: RequestTreeItemProps) {
  const { openRequest, requests, activeRequest } = useRequestSyncStoreState();
  const { getVariablesAsRecord } = useEnvironmentStore();

  const currentRequest = {
    ...item,
    ...(requests.find((req) => req.id === item.id) || {}),
  };

  const rawUrl = currentRequest?.url || (currentRequest as any).path || "";
  const envVariables = getVariablesAsRecord();
  const displayUrl = rawUrl ? substituteVariables(rawUrl, envVariables) : "";

  const method = currentRequest?.method || "GET";
  const isUnsaved = currentRequest?.unsaved;
  const isActive = activeRequest?.id === item.id;

  const methodBgMap: Record<string, string> = {
    GET: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    POST: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    PUT: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    PATCH:
      "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    DELETE:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  };
  const methodBg =
    methodBgMap[method] || "bg-muted text-muted-foreground border-border";

  return (
    <motion.li
      layout={!isJustMoved}
      animate={
        isJustMoved
          ? { scale: [0.98, 1], opacity: [0, 1] }
          : { scale: 1, opacity: 1 }
      }
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      ref={nodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "relative cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40 bg-muted/50 rounded-lg",
        isJustMoved && "ring-2 ring-primary/50",
      )}
    >
      {/* Drop indicator - before */}
      {isOver && dropPosition === "before" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary z-100 rounded-full pointer-events-none" />
      )}
      {/* Drop indicator - after */}
      {isOver && dropPosition === "after" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-100 rounded-full pointer-events-none" />
      )}
      <SidebarMenuButton
        isActive={isActive}
        onClick={() => {
          openRequest({
            auth: currentRequest.auth || { type: "NONE" },
            body: currentRequest.body || {
              raw: "",
              formData: [],
              urlEncoded: [],
              file: null,
              json: {},
            },
            createdAt: currentRequest.createdAt || new Date(),
            updatedAt: currentRequest.updatedAt || new Date(),
            description: currentRequest.description || "",
            headers: currentRequest.headers || [],
            id: item.id,
            unsaved: currentRequest.unsaved || true,
            method: currentRequest.method || "GET",
            name: currentRequest.name || "New Request",
            parameters: currentRequest.parameters || [],
            type: (currentRequest.type as RequestType) || "API",
            url: currentRequest.url || "",
            collectionId: currentRequest.collectionId || null,
            workspaceId: currentRequest.workspaceId || "",
            bodyType: currentRequest.bodyType || "NONE",
            messageType: currentRequest.messageType || "CONNECTION",
            savedMessages: currentRequest.savedMessages || [],
            sortOrder: currentRequest.sortOrder || 0,
          });
        }}
        className={cn(
          "group/item relative h-11! px-2 rounded-lg transition-all",
          "hover:bg-accent/60 border border-transparent",
          isActive && "bg-accent/80 border-accent-foreground/10",
        )}
      >
        <div className="flex items-center w-full gap-2">
          {/* Method/Type Badge */}
          {currentRequest.type === "API" ? (
            <span
              className={cn(
                "shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase border",
                methodBg,
              )}
            >
              {method}
            </span>
          ) : (
            <span className="shrink-0 p-1 rounded-md bg-muted/50 border border-border/50">
              <RequestIcon
                type={(currentRequest.type as RequestType) || "API"}
                className="size-3"
              />
            </span>
          )}

          {/* Content */}
          <div className="flex flex-col min-w-0 flex-1 gap-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "text-[13px] font-medium truncate",
                  isActive ? "text-foreground" : "text-foreground/85",
                )}
              >
                {currentRequest?.name}
              </span>
              {isUnsaved && (
                <span
                  className="shrink-0 size-1.5 rounded-full bg-blue-500"
                  title="Unsaved"
                />
              )}
            </div>
            {displayUrl && (
              <span className="text-[10px] text-muted-foreground/60 truncate font-mono">
                {displayUrl}
              </span>
            )}
          </div>

          {/* Action Button */}
          <div className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0">
            <SidebarRequestMenu
              requestId={currentRequest.id}
              requestName={currentRequest?.name || "Request"}
              workspaceId={currentRequest.workspaceId}
              collectionId={currentRequest.collectionId || null}
              type={(currentRequest?.type as RequestType) || "API"}
            />
          </div>
        </div>
      </SidebarMenuButton>
    </motion.li>
  );
}

interface CollectionTreeItemProps {
  item: SidebarCollectionItemInterface;
  nodeRef: (node: HTMLElement | null) => void;
  style: React.CSSProperties;
  attributes: DraggableAttributes;
  listeners: SyntheticListenerMap | undefined;
  isDragging: boolean;
  isOver: boolean;
  overId: UniqueIdentifier | null;
  activeId: UniqueIdentifier | null;
  dropPosition?: DropPosition | null;
  collapseKey?: number;
  isJustMoved?: boolean;
  justMovedId?: string | null;
}

function CollectionTreeItem({
  item,
  nodeRef,
  style,
  attributes,
  listeners,
  isDragging,
  isOver,
  overId,
  activeId,
  dropPosition,
  collapseKey = 0,
  isJustMoved,
}: CollectionTreeItemProps) {
  const { activeRequest } = useRequestSyncStoreState();
  const [isOpen, setIsOpen] = React.useState(item.id === activeRequest?.id);
  const prevCollapseKeyRef = React.useRef(collapseKey);

  // Collapse when collapseKey changes (increments)
  React.useEffect(() => {
    if (collapseKey !== prevCollapseKeyRef.current && collapseKey > 0) {
      setIsOpen(false);
      prevCollapseKeyRef.current = collapseKey;
    }
  }, [collapseKey]);

  const childIds = item.children?.map((child) => child.id) || [];

  return (
    <motion.li
      layout={!isJustMoved}
      animate={
        isJustMoved
          ? { scale: [0.98, 1], opacity: [0, 1] }
          : { scale: 1, opacity: 1 }
      }
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      ref={nodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group/menu-item relative cursor-grab active:cursor-grabbing",
        isDragging && "opacity-40 bg-muted/50 rounded-lg",
        isOver &&
          dropPosition === "inside" &&
          "ring-2 ring-primary rounded-lg bg-primary/10",
        isJustMoved && "ring-2 ring-primary/50",
      )}
    >
      {/* Drop indicator - before */}
      {isOver && dropPosition === "before" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary z-100 rounded-full pointer-events-none" />
      )}
      {/* Drop indicator - after */}
      {isOver && dropPosition === "after" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-100 rounded-full pointer-events-none" />
      )}
      <Collapsible
        className="w-full select-none"
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton className="group/row py-1.5 px-2 gap-2 rounded-lg hover:bg-accent/40 border border-transparent hover:border-accent-foreground/10">
            <IconFolderFilled className="size-3.5 shrink-0 text-amber-500/80" />
            <span className="text-[13px] font-medium truncate flex-1 text-foreground/90">
              {item?.name}
            </span>
            <div className="opacity-0 group-hover/row:opacity-100 transition-opacity">
              <SidebarCollectionMenu
                type={"COLLECTION"}
                optionId={item.id}
                workspaceId={item.workspaceId}
                collectionId={item.id}
              />
            </div>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SortableContext
            items={childIds}
            strategy={verticalListSortingStrategy}
          >
            <SidebarMenuSub className="ml-3 mr-0 pr-0 border-l-2 border-border/30 pl-2.5 mt-0.5 space-y-1">
              {!item.children?.length && (
                <div className="flex flex-col border border-dashed border-border/40 rounded-lg my-1.5 overflow-hidden bg-muted/20">
                  <p className="px-2.5 py-1.5 text-center text-[11px] text-muted-foreground/70">
                    No requests
                  </p>
                  <div className="flex justify-center pb-1.5">
                    <SidebarCollectionMenu
                      label="Add Request"
                      variant="item-drop"
                      type={"COLLECTION"}
                      optionId={item.id}
                      workspaceId={item.workspaceId}
                      collectionId={item.id}
                    />
                  </div>
                </div>
              )}
              {item?.children?.map((subItem) => (
                <SortableTreeItem
                  key={subItem.id}
                  item={subItem}
                  overId={overId}
                  activeId={activeId}
                />
              ))}
            </SidebarMenuSub>
          </SortableContext>
        </CollapsibleContent>
      </Collapsible>
    </motion.li>
  );
}
