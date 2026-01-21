"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCollectionsOnTopLevel } from "@/modules/apis/collections/hooks/queries";
import { useMoveRequest } from "@/modules/apis/requests/hooks/queries";
import Spinner from "@/components/app-ui/spinner";
import { FolderOpen, Home } from "lucide-react";
import useRequestSyncStoreState from "../hooks/requestSyncStore";

interface MoveToCollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  requestName: string;
  currentCollectionId: string | null;
  workspaceId: string;
}

export function MoveToCollectionDialog({
  open,
  onOpenChange,
  requestId,
  requestName,
  currentCollectionId,
  workspaceId,
}: MoveToCollectionDialogProps) {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(
    currentCollectionId || "none",
  );
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setSelectedCollectionId(currentCollectionId || "none");
    }
  }

  const { data: collections, isLoading: collectionsLoading } =
    useCollectionsOnTopLevel(workspaceId);
  const { updateRequest, getRequestById } = useRequestSyncStoreState();

  // Check if request is unsaved
  const request = getRequestById(requestId);
  const isUnsaved = request?.unsaved;

  const moveMutation = useMoveRequest(workspaceId, {
    onSuccess: () => {
      // Update local stores after successful DB update
      const collectionId =
        selectedCollectionId === "none" ? null : selectedCollectionId;
      updateRequest(requestId, { collectionId });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Failed to move request", error);
    },
  });

  const handleMove = () => {
    const collectionId =
      selectedCollectionId === "none" ? null : selectedCollectionId;

    if (isUnsaved) {
      // Local update only for unsaved requests
      updateRequest(requestId, { collectionId });
      onOpenChange(false);
    } else {
      moveMutation.mutate({ requestId, collectionId });
    }
  };

  const currentCollection = collections?.find(
    (c) => c.id === currentCollectionId,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-no-dnd="true">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="size-4" />
            Move Request
          </DialogTitle>
          <DialogDescription>
            Move &quot;{requestName}&quot; to a different collection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {currentCollection && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right text-muted-foreground text-xs">
                Current
              </Label>
              <div className="col-span-3 text-sm flex items-center gap-2">
                <FolderOpen className="size-3.5 text-muted-foreground" />
                {currentCollection.name}
              </div>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="collection" className="text-right text-xs">
              Move to
            </Label>
            <Select
              value={selectedCollectionId}
              onValueChange={setSelectedCollectionId}
              disabled={collectionsLoading}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent data-no-dnd="true">
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <Home className="size-3.5" />
                    <span>No Collection (Top Level)</span>
                  </div>
                </SelectItem>
                {collections?.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    <div className="flex items-center gap-2">
                      <FolderOpen className="size-3.5" />
                      <span>{collection.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMove}
            disabled={
              moveMutation.isPending ||
              selectedCollectionId === (currentCollectionId || "none")
            }
          >
            {moveMutation.isPending && <Spinner className="mr-2" />}
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
