"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  SidebarItemInterface,
  SidebarCollectionItemInterface,
} from "@/modules/apis/collections/types/sidebar.types";
import { SidebarFile } from "./SidebarFile";
import { SidebarFolder } from "./SidebarFolder";
import { useSidebarTree } from "./SidebarTreeContext";
import { IconGripVertical } from "@tabler/icons-react";

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
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "relative group/item outline-none flex items-center",
        isDragging && "opacity-40 z-0",
      )}
    >
      {/* Drag Handle - ONLY this element triggers drag */}
      <div
        {...listeners}
        className="shrink-0 cursor-grab active:cursor-grabbing p-0.5 opacity-0 group-hover/item:opacity-50 hover:opacity-100! transition-opacity touch-none"
        title="Drag to reorder"
      >
        <IconGripVertical className="size-3.5 text-muted-foreground" />
      </div>

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
