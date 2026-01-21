"use client";

import React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { SidebarMenuButton, SidebarMenuSub } from "@/components/ui/sidebar";
import { IconFolderFilled, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { SidebarCollectionMenu } from "@/modules/apis/collections/components/SidebarCollectionMenu";
import { SidebarCollectionItemInterface } from "@/modules/apis/collections/types/sidebar.types";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSidebarTree } from "./SidebarTreeContext";
import { SidebarItem } from "./SidebarItem";

interface SidebarFolderProps {
  item: SidebarCollectionItemInterface;
}

export function SidebarFolder({ item }: SidebarFolderProps) {
  const { overId, dropPosition, collapseKey } = useSidebarTree();

  const isOver = overId === item.id;

  const [isOpen, setIsOpen] = React.useState(false);

  // Sync collapse key to force close
  const prevCollapseKeyRef = React.useRef(collapseKey);
  React.useEffect(() => {
    if (collapseKey !== prevCollapseKeyRef.current && collapseKey > 0) {
      setIsOpen(false);
      prevCollapseKeyRef.current = collapseKey;
    }
  }, [collapseKey]);

  const childIds = item.children?.map((child) => child.id) || [];

  return (
    <Collapsible
      className={cn(
        "w-full select-none transition-colors rounded-md",
        isOver &&
          dropPosition === "inside" &&
          "bg-primary/10 border border-primary/20 ring-1 ring-primary/30",
      )}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <CollapsibleTrigger asChild>
        <SidebarMenuButton
          className={cn(
            "h-8 py-1 px-1 cursor-pointer gap-2 rounded-md hover:bg-accent/40 border border-transparent hover:border-accent-foreground/10 transition-colors",
            "hover:[&_div[data-actions]]:opacity-100",
          )}
        >
          <IconChevronRight
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground/70 transition-transform duration-200",
              isOpen && "rotate-90",
            )}
          />
          <IconFolderFilled className="size-3.5 shrink-0 text-amber-500/80" />
          <span className="text-[13px] font-medium truncate flex-1 text-foreground/90">
            {item.name}
          </span>

          <div
            data-actions="true"
            className="opacity-0 transition-opacity ml-auto"
          >
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
          <ul className="ml-[1.15rem] border-l border-border/40 pl-2 mt-0.5 space-y-0.5">
            {!item.children?.length && (
              <div className="flex flex-col border border-dashed border-border/40 rounded-md my-1 overflow-hidden bg-muted/20">
                <p className="px-2 py-2 text-center text-[11px] text-muted-foreground/70">
                  Empty
                </p>
                <div className="flex justify-center pb-2">
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
            {item.children?.map((subItem) => (
              <SidebarItem key={subItem.id} item={subItem} />
            ))}
          </ul>
        </SortableContext>
      </CollapsibleContent>
    </Collapsible>
  );
}
