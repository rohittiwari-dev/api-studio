import React from "react";
import { Edit2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useRenameCollection } from "../hooks/queries";
import useWorkspaceState from "@/modules/workspace/store";

interface RenameCollectionProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RenameCollection = ({
  id,
  open,
  onOpenChange,
}: RenameCollectionProps) => {
  const { activeWorkspace } = useWorkspaceState();
  const [newName, setNewName] = React.useState("");
  const {
    mutate: renameCollection,
    isPending,
    isSuccess,
    isError,
  } = useRenameCollection(activeWorkspace?.id || "");

  React.useEffect(() => {
    if (isSuccess) {
      onOpenChange(false);
      toast.success("Collection renamed successfully");
    }
    if (isError) {
      toast.error("Failed to rename collection");
    }
  }, [isSuccess, isError, onOpenChange, id, newName]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle>Rename Collection</AlertDialogTitle>
        <AlertDialogDescription>
          <span className="text-muted-foreground">
            Rename your collection to better organize your requests.
          </span>
        </AlertDialogDescription>
        <InputGroup>
          <InputGroupInput
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <InputGroupAddon>New Name</InputGroupAddon>
        </InputGroup>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </AlertDialogCancel>
          <Button
            className="cursor-pointer"
            onClick={() =>
              renameCollection({ collectionId: id, name: newName })
            }
            disabled={
              !newName ||
              newName?.trim().length === 0 ||
              newName?.trim() === id ||
              isPending
            }
          >
            {isPending && <Spinner />}
            Rename
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RenameCollection;
