"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragMoveEvent,
  UniqueIdentifier,
  rectIntersection,
  useDroppable,
  pointerWithin,
  CollisionDetection,
  Modifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useMemo, useRef, useState } from "react";
import { LayoutGroup } from "motion/react";
import { SidebarMenu } from "@/components/ui/sidebar";
import {
  useMoveCollection,
  useReorderCollections,
  useReorderRequests,
  useMoveRequest,
} from "@/modules/apis/collections/hooks/mutations";
import { SidebarItem } from "./SidebarItem";
import { SidebarFile } from "./SidebarFile";
import { SidebarFolder } from "./SidebarFolder";
import { SidebarTreeContext, DropPosition } from "./SidebarTreeContext";
import {
  SidebarItemInterface,
  SidebarCollectionItemInterface,
} from "@/modules/apis/collections/types/sidebar.types";
import { cn } from "@/lib/utils";
import useRequestSyncStoreState from "@/modules/apis/requests/hooks/requestSyncStore";
import useSidebarTree from "../../hooks/useSidebarTree";
import { IconChevronRight, IconFolderFilled } from "@tabler/icons-react";

interface DraggableSidebarTreeProps {
  workspaceId: string;
  collapseKey?: number;
}

class SmartPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: "onPointerDown" as const,
      handler: ({ nativeEvent: event }: React.PointerEvent) => {
        if (
          !event.isPrimary ||
          event.button !== 0 ||
          isInteractiveElement(event.target as Element)
        ) {
          return false;
        }

        return true;
      },
    },
  ];
}

function isInteractiveElement(element: Element | null) {
  const interactiveElements = [
    "button",
    "input",
    "textarea",
    "select",
    "option",
  ];

  if (
    element &&
    element.tagName &&
    interactiveElements.includes(element.tagName.toLowerCase())
  ) {
    return true;
  }

  // Handle text nodes or other non-element nodes by traversing up
  let current: Element | null = element;
  if (current?.nodeType === 3) {
    // Node.TEXT_NODE
    current = current.parentElement;
  }

  if (
    current?.closest(
      '[role="dialog"], [role="menu"], [role="listbox"], [data-radix-portal], [data-no-dnd="true"]',
    )
  ) {
    return true;
  }

  return false;
}

const snapCenterY: Modifier = ({
  transform,
  activatorEvent,
  draggingNodeRect,
}) => {
  if (draggingNodeRect && activatorEvent) {
    const activator = activatorEvent as any;
    if (!("clientY" in activator)) return transform;

    const activatorY = activator.clientY;
    const overlayHeight = draggingNodeRect.height;

    const targetTop = activatorY - overlayHeight / 2;
    const newY = targetTop - draggingNodeRect.top;

    return {
      ...transform,
      y: transform.y + newY,
    };
  }

  return transform;
};

export function DraggableSidebarTree({
  workspaceId,
  collapseKey = 0,
}: DraggableSidebarTreeProps) {
  const { items } = useSidebarTree();

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [dropPosition, setDropPosition] = useState<DropPosition>(null);
  const [justMovedId, setJustMovedId] = useState<string | null>(null);

  // Track pointer Y for precise drop positioning
  const pointerY = useRef<number>(0);

  const { updateRequest } = useRequestSyncStoreState();

  const moveCollectionMutation = useMoveCollection(workspaceId);
  const reorderCollectionsMutation = useReorderCollections(workspaceId);
  const reorderRequestsMutation = useReorderRequests(workspaceId);
  const moveRequestMutation = useMoveRequest(workspaceId);

  const { setNodeRef: setRootRef } = useDroppable({
    id: "ROOT",
  });

  const sensors = useSensors(
    useSensor(SmartPointerSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const collisionDetection: CollisionDetection = useCallback((args) => {
    if (args.pointerCoordinates) {
      pointerY.current = args.pointerCoordinates.y;
    }
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return rectIntersection(args);
  }, []);

  const flatItems = useMemo(() => {
    const flat: Map<
      string,
      { item: SidebarItemInterface; parentId: string | null }
    > = new Map();

    function traverse(item: SidebarItemInterface, parentId: string | null) {
      flat.set(item.id, { item, parentId });
      if (item.type === "COLLECTION" && item.children) {
        item.children.forEach((child) => traverse(child, item.id));
      }
    }

    items.forEach((item) => traverse(item, null));
    return flat;
  }, [items]);

  const activeItem = activeId ? flatItems.get(String(activeId))?.item : null;

  // Only highlight if coming from deep inside (parentId is truthy)
  // This satisfies: "if the root is target to move the element from collection"
  const activeData = activeId ? flatItems.get(String(activeId)) : null;
  const isRootHighlight = overId === "ROOT" && !!activeData?.parentId;

  const rootItemIds = useMemo(() => items.map((item) => item.id), [items]);

  const isDescendant = (parentId: string, childId: string): boolean => {
    const parent = flatItems.get(parentId)?.item;
    if (!parent || parent.type !== "COLLECTION") return false;
    const children = (parent as SidebarCollectionItemInterface).children || [];
    for (const child of children) {
      if (child.id === childId) return true;
      if (child.type === "COLLECTION" && isDescendant(child.id, childId))
        return true;
    }
    return false;
  };

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  function handleDragMove(event: DragMoveEvent) {
    const { over, active } = event;

    if (!over) {
      setOverId(null);
      setDropPosition(null);
      return;
    }

    // Special handling for ROOT drop zone
    if (over.id === "ROOT") {
      setOverId("ROOT");
      setDropPosition(null); // No specific position, just "to root"
      return;
    }

    // Default: Trust the event's over ID
    let targetOverId = over.id;
    let targetDropPosition: DropPosition = null;

    const overRect = over.rect;
    const activeRect = active.rect.current.translated;

    if (!activeRect || !overRect) {
      setDropPosition(null);
      return;
    }

    const activeData = flatItems.get(String(active.id));
    const overData = flatItems.get(String(over.id));

    if (!activeData || !overData) {
      setDropPosition(null);
      return;
    }

    const overHeight = overRect.height;
    // Use the actual pointer Y captured during collision detection
    const cursorY = pointerY.current;
    const overTop = overRect.top;
    const relativeY = cursorY - overTop;

    // Folder Redirection Logic:
    // If moving a Request across parents (or Root -> Collection),
    // we want to "Select the Folder" instead of precise placement.
    const isCrossParent = activeData.parentId !== overData.parentId;
    const isActiveRequest = activeData.item.type !== "COLLECTION"; // Only requests redirect

    // If hovering a Request inside a different collection, redirect to the Collection
    if (
      isActiveRequest &&
      isCrossParent &&
      overData.item.type !== "COLLECTION" &&
      overData.parentId
    ) {
      targetOverId = overData.parentId;
      targetDropPosition = "inside";
      setOverId(targetOverId);
      setDropPosition(targetDropPosition);
      return;
    }

    // If hovering a Collection from outside:
    // - Middle 70%: Force "Inside" (Select Folder)
    // - Top/Bottom 15%: Allow "Before/After" (Insert at this level/root)
    if (
      isActiveRequest &&
      isCrossParent &&
      overData.item.type === "COLLECTION"
    ) {
      const innerTop = overHeight * 0.15;
      const innerBottom = overHeight * 0.85;

      if (relativeY >= innerTop && relativeY <= innerBottom) {
        targetOverId = overData.item.id;
        targetDropPosition = "inside";
        setOverId(targetOverId);
        setDropPosition(targetDropPosition);
        return;
      }
      // If at edges, fall through to Standard Logic (which handles Before/After)
    }

    // Standard Logic for siblings or same-parent moves
    setOverId(over.id);

    const topThreshold = overHeight * 0.25;
    const bottomThreshold = overHeight * 0.75;

    if (overData.item.type === "COLLECTION") {
      if (relativeY < topThreshold) {
        setDropPosition("before");
      } else if (relativeY > bottomThreshold) {
        setDropPosition("after");
      } else {
        setDropPosition("inside");
      }
    } else {
      if (relativeY < overHeight / 2) {
        setDropPosition("before");
      } else {
        setDropPosition("after");
      }
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active } = event;
    // CAPTURE STATE before clearing it
    // We use the state `overId` because `handleDragMove` might have redirected it (e.g. child -> parent)
    const currentDropPosition = dropPosition;
    const finalOverId = overId;

    setActiveId(null);
    setOverId(null);
    setDropPosition(null);

    setJustMovedId(active.id as string);
    setTimeout(() => setJustMovedId(null), 400);

    if (!finalOverId || (finalOverId !== "ROOT" && active.id === finalOverId))
      return;

    const activeData = flatItems.get(String(active.id));
    if (!activeData) return;
    const activeItem = activeData.item;
    const activeParentId = activeData.parentId;

    // Handle Drop to ROOT
    if (finalOverId === "ROOT") {
      // If item is already at root, do nothing (or move to end?)
      if (!activeParentId) return;

      if (activeItem.type === "COLLECTION") {
        moveCollectionMutation.mutate({
          collectionId: activeItem.id,
          newParentId: null, // Move to Root
        });
      } else {
        updateRequest(activeItem.id, { collectionId: null });
        moveRequestMutation.mutate({
          requestId: activeItem.id,
          collectionId: null,
        });
      }
      return;
    }

    if (!currentDropPosition) return;

    const overData = flatItems.get(String(finalOverId));
    if (!overData) return;

    const overItem = overData.item;
    const overParentId = overData.parentId;

    if (currentDropPosition === "inside") {
      if (overItem.type !== "COLLECTION") return;
      // Prevent dropping into self or descendants (standard check)
      if (activeItem.type === "COLLECTION") {
        if (
          overItem.id === activeItem.id ||
          isDescendant(activeItem.id, overItem.id)
        ) {
          return;
        }
      }

      if (activeItem.type === "COLLECTION") {
        moveCollectionMutation.mutate({
          collectionId: activeItem.id,
          newParentId: overItem.id,
        });
      } else {
        updateRequest(activeItem.id, { collectionId: overItem.id });
        moveRequestMutation.mutate({
          requestId: activeItem.id,
          collectionId: overItem.id,
        });
      }
    } else {
      // Reordering logic remains SAME, but relies on overData which comes from finalOverId
      // ... (rest of the logic handles same-parent reordering or explicit moves if we allowed them)
      const targetParentId = overParentId;

      const getSiblings = (
        parentId: string | null,
        type: "COLLECTION" | "REQUEST",
      ) => {
        if (parentId) {
          const parent = flatItems.get(parentId)
            ?.item as SidebarCollectionItemInterface;
          return (parent?.children || []).filter(
            type === "COLLECTION"
              ? (c) => c.type === "COLLECTION"
              : (c) => c.type !== "COLLECTION",
          );
        }
        return items.filter(
          type === "COLLECTION"
            ? (i) => i.type === "COLLECTION"
            : (i) => i.type !== "COLLECTION",
        );
      };

      if (activeItem.type === "COLLECTION") {
        if (overItem.type !== "COLLECTION" && activeParentId === overParentId)
          return;

        if (activeParentId !== targetParentId) {
          moveCollectionMutation.mutate({
            collectionId: activeItem.id,
            newParentId: targetParentId,
          });
        } else {
          const siblings = getSiblings(targetParentId, "COLLECTION");
          const orderedIds = siblings.map((s) => s.id);
          const oldIndex = orderedIds.indexOf(activeItem.id);
          let newIndex = orderedIds.indexOf(overItem.id);

          if (overItem.type !== "COLLECTION") {
            newIndex = orderedIds.length;
          }

          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            orderedIds.splice(oldIndex, 1);
            if (currentDropPosition === "after") {
              orderedIds.splice(newIndex, 0, activeItem.id);
            } else {
              orderedIds.splice(Math.max(0, newIndex), 0, activeItem.id);
            }
            reorderCollectionsMutation.mutate({
              orderedIds,
              parentId: targetParentId,
            });
          }
        }
      } else {
        if (overItem.type === "COLLECTION" && currentDropPosition === "before")
          return;

        const newCollectionId = targetParentId;

        if (activeItem.collectionId !== newCollectionId) {
          updateRequest(activeItem.id, { collectionId: newCollectionId });
          moveRequestMutation.mutate({
            requestId: activeItem.id,
            collectionId: newCollectionId,
          });
        } else {
          const siblings = getSiblings(newCollectionId, "REQUEST");
          const orderedIds = siblings.map((s) => s.id);
          const oldIndex = orderedIds.indexOf(activeItem.id);
          let newIndex = orderedIds.indexOf(overItem.id);

          if (overItem.type === "COLLECTION") {
            newIndex = 0;
          }

          if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
            orderedIds.splice(oldIndex, 1);
            if (
              currentDropPosition === "after" &&
              overItem.type !== "COLLECTION"
            ) {
              orderedIds.splice(newIndex, 0, activeItem.id);
            } else {
              orderedIds.splice(Math.max(0, newIndex), 0, activeItem.id);
            }
            reorderRequestsMutation.mutate({
              orderedIds,
              parentId: newCollectionId,
            });
          }
        }
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <SidebarTreeContext.Provider
        value={{
          activeId,
          overId,
          dropPosition,
          justMovedId,
          collapseKey,
        }}
      >
        <div
          ref={setRootRef}
          className={cn(
            "flex-1 min-h-[calc(100vh-12rem)] transition-all duration-200 rounded-lg p-1",
            isRootHighlight
              ? "bg-primary/5 border-2 border-dashed border-primary/30"
              : "border-2 border-transparent",
          )}
        >
          <SortableContext
            items={rootItemIds}
            strategy={verticalListSortingStrategy}
          >
            <LayoutGroup id="sidebar-items">
              <SidebarMenu className="space-y-0.5!">
                {items.map((item) => (
                  <SidebarItem key={item.id} item={item} />
                ))}
              </SidebarMenu>
            </LayoutGroup>
          </SortableContext>
        </div>

        <DragOverlay dropAnimation={null} modifiers={[snapCenterY]}>
          {activeItem && (
            <div className="flex items-center rounded-md bg-popover supports-backdrop-filter:bg-popover opacity-90 shadow-md backdrop-blur-3xl! border border-border ring-1 ring-border/50">
              <div className="flex-1 min-w-0 overflow-hidden">
                {activeItem.type === "COLLECTION" ? (
                  <div className="flex items-center gap-2 px-2 py-1.5 h-8">
                    <IconChevronRight className="size-3.5 shrink-0 text-muted-foreground/70" />
                    <IconFolderFilled className="size-3.5 shrink-0 text-amber-500/80" />
                    <span className="text-[13px] font-medium truncate flex-1 text-foreground/90">
                      {activeItem.name}
                    </span>
                  </div>
                ) : (
                  <SidebarFile item={activeItem} />
                )}
              </div>
            </div>
          )}
        </DragOverlay>
      </SidebarTreeContext.Provider>
    </DndContext>
  );
}
