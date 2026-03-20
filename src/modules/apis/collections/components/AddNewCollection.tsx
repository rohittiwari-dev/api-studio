"use client";

import { createId } from "@paralleldrive/cuid2";
import React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import useWorkspaceState from "@/modules/workspace/store";
import { useCreateCollection } from "../hooks/queries";

interface AddNewCollectionProps {
  parentID?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddNewCollection = ({
  parentID,
  open,
  onOpenChange,
}: AddNewCollectionProps) => {
  const [collectionName, setCollectionName] = React.useState("");
  const { activeWorkspace } = useWorkspaceState();

  // Reset name when dialog opens
  React.useEffect(() => {
    if (open) {
      setCollectionName("");
    }
  }, [open]);

  const { mutate: createCollectionMutation, isPending } = useCreateCollection(
    activeWorkspace?.id || "",
    {
      onSuccess: () => {
        setCollectionName("");
        toast.success("Collection created successfully");
      },
      onError: (error) => {
        toast.error("Failed to create collection", {
          description:
            (error as { data: { message: string } })?.data?.message ||
            (error as Error).message ||
            "Unknown error",
        });
      },
    },
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-no-dnd="true">
        <DialogTitle>Add New Collection</DialogTitle>
        <DialogDescription>
          Create a new collection to organize your requests.
        </DialogDescription>
        <Input
          placeholder="Collection Name"
          value={collectionName}
          onChange={(e) => setCollectionName(e.target.value)}
        />
        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={async () => {
              onOpenChange(false);
              const tempId = createId();
              createCollectionMutation({
                name: collectionName,
                parentId: parentID,
                tempId,
              });
            }}
            disabled={!collectionName || isPending}
            className="cursor-pointer"
          >
            {isPending && <Spinner />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewCollection;
