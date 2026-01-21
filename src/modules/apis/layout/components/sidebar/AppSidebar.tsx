"use client";

import * as React from "react";
import { createId } from "@paralleldrive/cuid2";
import { ChevronsDownUp, Code2, Plus } from "lucide-react";
import { IconFolderFilled } from "@tabler/icons-react";
import { IconSocketIO, IconWebSocket } from "@/assets/app-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar";
import useWorkspaceState from "@/modules/workspace/store";
import AddNewCollection from "../../../collections/components/AddNewCollection";
import { DraggableSidebarTree } from "./DraggableSidebarTree";
import useRequestSyncStoreState from "@/modules/apis/requests/hooks/requestSyncStore";

export function AppSidebar({
  workspaceId,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  workspaceId: string;
}) {
  const { activeWorkspace } = useWorkspaceState();
  const [collapseKey, setCollapseKey] = React.useState(0);

  const handleCollapseAll = () => {
    setCollapseKey((prev) => prev + 1);
  };

  return (
    <Sidebar
      className="top-(--header-height) h-[calc(100svh-var(--header-height))]! border-r border-white/5 bg-background/40! backdrop-blur-xl! shadow-sm **:data-[sidebar=sidebar]:bg-transparent!"
      {...props}
    >
      <SidebarContent className="pt-2 bg-transparent">
        <SidebarGroup className="w-full p-0">
          {/* Header Section */}
          <SidebarGroupLabel className="group/label sticky -top-2 w-full! z-10 flex min-h-[36px] items-center justify-between gap-2 px-2 py-1 mb-2 rounded-none rounded-b-lg bg-sidebar/90 dark:bg-[#1d1c25]/90! backdrop-blur-3xl!">
            <div className="flex items-center select-none gap-2 text-muted-foreground transition-colors">
              <IconFolderFilled className="size-3.5 opacity-70" />
              <span className="font-medium text-xs uppercase tracking-wider">
                Collections
              </span>
            </div>

            <div className="flex items-center gap-0.5 opacity-0 group-hover/label:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-md cursor-pointer hover:bg-background/80 hover:shadow-sm transition-all"
                onClick={handleCollapseAll}
                title="Collapse All Folders"
              >
                <ChevronsDownUp className="size-3" />
              </Button>
              <AddNewCollectionOption workspaceId={workspaceId} />
            </div>
          </SidebarGroupLabel>

          {/* Tree Content */}
          <SidebarGroupContent className="pr-0.5!">
            <DraggableSidebarTree
              workspaceId={workspaceId}
              collapseKey={collapseKey}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail className="hover:after:bg-violet-500/50 after:w-[2px]" />
    </Sidebar>
  );
}

const AddNewCollectionOption = ({ workspaceId }: { workspaceId: string }) => {
  const { openRequest } = useRequestSyncStoreState();
  const [showAddCollectionDialog, setShowAddCollectionDialog] =
    React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-accent/60 cursor-pointer"
          >
            <Plus className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-1.5">
          <DropdownMenuItem
            className="gap-3 cursor-pointer py-2 px-2.5 rounded-md focus:bg-emerald-500/10 focus:text-emerald-600 dark:focus:text-emerald-400"
            onClick={(e) => {
              const id = createId();
              e.stopPropagation();
              openRequest({
                id,
                type: "API",
                name: "New Request",
                url: "",
                method: "GET",
                unsaved: true,
                collectionId: null,
                workspaceId,
                body: {
                  raw: "",
                  formData: [],
                  urlEncoded: [],
                  file: null,
                  json: {},
                },
                auth: { type: "NONE" },
                headers: [],
                parameters: [],
                bodyType: "NONE",
                description: "",
                messageType: "CONNECTION",
                createdAt: new Date(),
                updatedAt: new Date(),
                savedMessages: [],
                sortOrder: 0,
              });
            }}
          >
            <div className="flex items-center justify-center size-7 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Code2 className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">HTTP Request</span>
              <span className="text-xs text-muted-foreground">
                Create new API request
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="gap-3 cursor-pointer py-2 px-2.5 rounded-md focus:bg-blue-500/10 focus:text-blue-600 dark:focus:text-blue-400"
            onClick={(e) => {
              const id = createId();
              e.stopPropagation();
              openRequest({
                id,
                type: "WEBSOCKET",
                name: "New Request",
                url: "",
                method: null,
                unsaved: true,
                collectionId: null,
                workspaceId,
                body: {
                  raw: "",
                  formData: [],
                  urlEncoded: [],
                  file: null,
                  json: {},
                },
                auth: { type: "NONE" },
                headers: [],
                parameters: [],
                bodyType: "NONE",
                description: "",
                messageType: "CONNECTION",
                createdAt: new Date(),
                updatedAt: new Date(),
                savedMessages: [],
                sortOrder: 0,
              });
            }}
          >
            <div className="flex items-center justify-center size-7 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <IconWebSocket className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">WebSocket</span>
              <span className="text-xs text-muted-foreground">
                Real-time connection
              </span>
            </div>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="gap-3 cursor-pointer py-2 px-2.5 rounded-md focus:bg-green-500/10 focus:text-green-600 dark:focus:text-green-400"
            onClick={(e) => {
              const id = createId();
              e.stopPropagation();
              openRequest({
                id,
                type: "SOCKET_IO",
                name: "New Request",
                url: "",
                method: null,
                unsaved: true,
                collectionId: null,
                workspaceId,
                body: {
                  raw: "",
                  formData: [],
                  urlEncoded: [],
                  file: null,
                  json: {},
                },
                auth: { type: "NONE" },
                headers: [],
                parameters: [],
                bodyType: "NONE",
                description: "",
                messageType: "CONNECTION",
                createdAt: new Date(),
                updatedAt: new Date(),
                savedMessages: [],
                sortOrder: 0,
              });
            }}
          >
            <div className="flex items-center justify-center size-7 rounded-md bg-green-500/10 text-green-600 dark:text-green-400">
              <IconSocketIO className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Socket.IO</span>
              <span className="text-xs text-muted-foreground">
                Event-based connection
              </span>
            </div>
          </DropdownMenuItem>

          <div className="h-px bg-border my-1.5" />

          <DropdownMenuItem
            className="gap-3 cursor-pointer py-2 px-2.5 rounded-md focus:bg-amber-500/10 focus:text-amber-600 dark:focus:text-amber-400"
            onClick={(e) => {
              e.stopPropagation();
              setShowAddCollectionDialog(true);
            }}
          >
            <div className="flex items-center justify-center size-7 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <IconFolderFilled className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Collection</span>
              <span className="text-xs text-muted-foreground">
                Organize requests
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddNewCollection
        open={showAddCollectionDialog}
        onOpenChange={setShowAddCollectionDialog}
        parentID={undefined}
      />
    </>
  );
};
