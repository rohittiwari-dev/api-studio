"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import type React from "react";
import { cn } from "@/lib/utils";
import type {
  SidebarCollectionItemInterface,
  SidebarItemInterface,
} from "@/modules/apis/collections/types/sidebar.types";
import { SidebarFile } from "./SidebarFile";
import { SidebarFolder } from "./SidebarFolder";
import { useSidebarTree } from "./SidebarTreeContext";

interface SidebarItemProps {
  item: SidebarItemInterface;
}

export function SidebarItem({ item }: SidebarItemProps) {
  const { justMovedId, dropPosition, overId } = useSidebarTree();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    // Check if target or any parent has data-no-dnd="true"
    // Also check for specific interactive elements if needed, though data-no-dnd should cover modals
    if (target.closest('[data-no-dnd="true"]')) {
      return;
    }
    listeners?.onPointerDown?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-no-dnd="true"]')) {
      return;
    }
    listeners?.onKeyDown?.(e);
  };

  const attributesWithOverrides = {
    ...attributes,
    ...listeners,
    onPointerDown: handlePointerDown,
    onKeyDown: handleKeyDown,
  };

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const isOver = overId === item.id;
  const isJustMoved = justMovedId === item.id;

  const showDropBefore = isOver && dropPosition === "before";
  const showDropAfter = isOver && dropPosition === "after";

  return (
    <motion.li
      layout={!isJustMoved}
      animate={
        isJustMoved
          ? { scale: [0.98, 1], opacity: [0, 1] }
          : { scale: 1, opacity: 1 }
      }
      transition={{ type: "spring", bounce: 0, duration: 0.3 }}
      ref={setNodeRef}
      style={style}
      {...attributesWithOverrides}
      className={cn(
        "relative group/item outline-none flex items-center",
        isDragging && "opacity-40 z-0",
      )}
    >
      {/* Drop indicator - before */}
      {showDropBefore && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-100 h-full w-[2px] bg-primary rounded-l-full pointer-events-none" />
      )}

      {/* Drop indicator - after */}
      {showDropAfter && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary z-100 rounded-full pointer-events-none" />
      )}

      <div className="flex-1 min-w-0">
        {item.type === "COLLECTION" ? (
          <SidebarFolder item={item as SidebarCollectionItemInterface} />
        ) : (
          <SidebarFile item={item} />
        )}
      </div>
    </motion.li>
  );
}
