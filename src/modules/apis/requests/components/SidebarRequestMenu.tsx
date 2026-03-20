"use client";
import { IconDotsVertical } from "@tabler/icons-react";
import { Copy, FolderOutput, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDeleteRequest,
  useDuplicateRequest,
  useRenameRequest,
} from "../hooks/queries";
import useRequestSyncStoreState from "../hooks/requestSyncStore";
import type { RequestType } from "../types/store.types";
import { MoveToCollectionDialog } from "./MoveToCollectionDialog";
import { RenameRequestDialog } from "./RenameRequestDialog";

interface SidebarRequestMenuProps {
  requestId: string;
  requestName: string;
  workspaceId: string;
  collectionId: string | null;
  type: RequestType;
}

export function SidebarRequestMenu({
  requestId,
  requestName,
  workspaceId,
  collectionId,
  type,
}: SidebarRequestMenuProps) {
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);

  const { updateRequest, removeRequest, getRequestById } =
    useRequestSyncStoreState();

  // Check if request is unsaved
  const request = getRequestById(requestId);
  const isUnsaved = request?.unsaved;

  // Rename mutation
  const renameMutation = useRenameRequest(workspaceId, {
    onSuccess: () => {
      // Local updates done in handleRename
    },
    onError: (error) => {
      console.error("Failed to rename request", error);
    },
  });

  // Delete mutation
  const deleteMutation = useDeleteRequest(workspaceId, {
    onSuccess: () => {
      // Remove from local stores
      removeRequest(requestId);
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      console.error("Failed to delete request", error);
    },
  });

  // Duplicate mutation
  const duplicateMutation = useDuplicateRequest(workspaceId, {
    onSuccess: () => {
      // Request will be added via query invalidation
    },
    onError: (error: unknown) => {
      console.error("Failed to duplicate request", error);
    },
  });

  const handleRename = (newName: string) => {
    // Update local stores immediately
    updateRequest(requestId, { name: newName });

    // Only save to DB if it's already persisted
    if (!isUnsaved) {
      renameMutation.mutate({ requestId, name: newName });
    }
  };

  const handleDelete = () => {
    if (isUnsaved) {
      // For unsaved requests, just remove from local store
      removeRequest(requestId);
      setShowDeleteDialog(false);
    } else {
      deleteMutation.mutate(requestId);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          asChild
          onClick={(e) => e.stopPropagation()}
          className="m-0! p-0! group/item-collapsible select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="ml-auto cursor-pointer focus-visible:ring-0 p-0 h-fit w-fit rounded-sm outline-none"
          >
            <IconDotsVertical className="size-4 text-muted-foreground hover:text-indigo-500! dark:hover:text-indigo-400! transition-colors" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="right"
          className="w-40 rounded-xl p-1 shadow-2xl shadow-black/10 bg-popover/95 backdrop-blur-xl border border-border/60"
          onClick={(e) => e.stopPropagation()}
          data-no-dnd="true"
        >
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowRenameDialog(true);
            }}
            className="group cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium outline-none transition-all duration-200 focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-300 active:scale-98 text-muted-foreground"
          >
            <Pencil className="mr-2 size-3 shrink-0 text-muted-foreground transition-colors group-focus:text-indigo-500 dark:group-focus:text-indigo-400" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowMoveDialog(true);
            }}
            className="group cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium outline-none transition-all duration-200 focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-300 active:scale-98 text-muted-foreground"
          >
            <FolderOutput className="mr-2 size-3 shrink-0 text-muted-foreground transition-colors group-focus:text-indigo-500 dark:group-focus:text-indigo-400" />
            Move to Collection
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              // Pass optimistic data
              const request = getRequestById(requestId);
              duplicateMutation.mutate({
                requestId,
                requestName,
                collectionId,
                type,
                method: request?.method,
                url: request?.url,
              });
            }}
            className="group cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium outline-none transition-all duration-200 focus:bg-indigo-500/10 focus:text-indigo-600 dark:focus:text-indigo-300 active:scale-98 text-muted-foreground"
          >
            <Copy className="mr-2 size-3 shrink-0 text-muted-foreground transition-colors group-focus:text-indigo-500 dark:group-focus:text-indigo-400" />
            {duplicateMutation.isPending ? "Duplicating..." : "Duplicate"}
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/60 my-1" />
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            className="group cursor-pointer rounded-md px-2 py-1 text-[11px] font-medium outline-none transition-all duration-200 text-muted-foreground focus:bg-rose-500/10 focus:text-rose-600 dark:focus:text-rose-400 active:scale-98"
          >
            <Trash2 className="mr-2 size-3 shrink-0 transition-colors group-focus:text-rose-600 dark:group-focus:text-rose-400" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div onClick={(e) => e.stopPropagation()}>
        {/* Rename Dialog */}
        <RenameRequestDialog
          open={showRenameDialog}
          onOpenChange={setShowRenameDialog}
          currentName={requestName}
          onRename={handleRename}
        />

        {/* Move Dialog */}
        <MoveToCollectionDialog
          open={showMoveDialog}
          onOpenChange={setShowMoveDialog}
          requestId={requestId}
          requestName={requestName}
          currentCollectionId={collectionId}
          workspaceId={workspaceId}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Request</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;
                {requestName}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
