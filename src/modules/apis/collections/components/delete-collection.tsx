import { IconAlertTriangleFilled } from "@tabler/icons-react";
import React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import useRequestSyncStoreState from "@/modules/apis/requests/hooks/requestSyncStore";
import useWorkspaceState from "@/modules/workspace/store";
import { useDeleteCollection } from "../hooks/queries";

interface DeleteCollectionProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteCollection = ({
  id,
  open,
  onOpenChange,
}: DeleteCollectionProps) => {
  const { activeWorkspace } = useWorkspaceState();
  const {
    mutate: deleteCollection,
    isPending,
    isError,
  } = useDeleteCollection(activeWorkspace?.id || "");

  const { requests, updateRequest } = useRequestSyncStoreState();

  React.useEffect(() => {
    if (isError) {
      console.error("Failed to delete collection");
    }
  }, [isError]);

  const handleDelete = () => {
    // Close dialog immediately for optimistic UX
    onOpenChange(false);

    requests.forEach((req) => {
      if (req.collectionId === id && req.unsaved) {
        updateRequest(req.id, { collectionId: null });
      }
    });

    deleteCollection(id);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-no-dnd="true">
        <AlertDialogTitle className="dark:text-destructive-foreground flex items-center gap-2">
          <IconAlertTriangleFilled className="size-5" />
          Are you sure? you want to delete this collection?
        </AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone, and all the requests inside this will be
          deleted and nested collections and requests inside theme will moved to
          one higher level.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            className="cursor-pointer"
            onClick={handleDelete}
          >
            {isPending && <Spinner />}
            Delete
          </Button>
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteCollection;
