"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Building2,
  Globe,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import authClient from "@/lib/authClient";
import useWorkspaceState from "@/modules/workspace/store";

export default function WorkspaceSettingsPage() {
  const router = useRouter();
  const { activeWorkspace, setActiveWorkspace, workspaces, setWorkspaces } =
    useWorkspaceState();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form values when workspace changes
  useEffect(() => {
    if (activeWorkspace) {
      setName(activeWorkspace.name || "");
      setSlug(activeWorkspace.slug || "");
    }
  }, [activeWorkspace]);

  // Track changes
  useEffect(() => {
    if (activeWorkspace) {
      const changed =
        name !== (activeWorkspace.name || "") ||
        slug !== (activeWorkspace.slug || "");
      setHasChanges(changed);
    }
  }, [name, slug, activeWorkspace]);

  const handleSave = async () => {
    if (!activeWorkspace) {
      return;
    }

    // Validation
    if (!name.trim()) {
      toast.error("Workspace name is required");
      return;
    }
    if (!slug.trim()) {
      toast.error("Workspace URL is required");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      toast.error(
        "Workspace URL can only contain lowercase letters, numbers, and hyphens",
      );
      return;
    }

    setIsSaving(true);
    try {
      const result = await authClient.organization.update({
        organizationId: activeWorkspace.id,
        data: {
          name: name.trim(),
          slug: slug.trim(),
        },
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to update workspace");
      }

      // Update local state
      const updatedWorkspace = {
        ...activeWorkspace,
        name: name.trim(),
        slug: slug.trim(),
      };
      setActiveWorkspace(updatedWorkspace as any);

      // Update workspaces list
      if (workspaces) {
        const updated = workspaces.map((w) =>
          w.id === activeWorkspace.id ? updatedWorkspace : w,
        );
        setWorkspaces(updated as any);
      }

      toast.success("Workspace settings updated");

      // If slug changed, redirect to new URL
      if (slug !== activeWorkspace.slug) {
        router.replace(`/workspace/${slug}/settings/workspace`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update workspace");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeWorkspace) {
      return;
    }
    if (deleteConfirmation !== activeWorkspace.name) {
      toast.error("Please type the workspace name to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      const result = await authClient.organization.delete({
        organizationId: activeWorkspace.id,
      });

      if (result.error) {
        throw new Error(result.error.message || "Failed to delete workspace");
      }

      toast.success(`"${activeWorkspace.name}" has been deleted`);

      // Remove from local state and redirect
      const remaining = workspaces?.filter((w) => w.id !== activeWorkspace.id);
      setWorkspaces(remaining || []);

      if (remaining && remaining.length > 0) {
        setActiveWorkspace(remaining[0] as any);
        router.push(`/workspace/${remaining[0].slug}`);
      } else {
        router.push("/workspace/get-started");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete workspace");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setDeleteConfirmation("");
    }
  };

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (value: string) => {
    setName(value);
    // Auto-generate slug if it hasn't been manually changed
    if (slug === generateSlug(activeWorkspace?.name || "")) {
      setSlug(generateSlug(value));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Workspace</h2>
        <p className="text-muted-foreground mt-1">
          Manage your workspace settings and configuration
        </p>
      </div>

      <Separator />

      {/* Workspace Info */}
      <div className="space-y-6">
        <h3 className="text-sm font-medium">Workspace Information</h3>

        <div className="grid gap-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="workspace-name" className="text-sm">
              Workspace Name
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="workspace-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="pl-10"
                placeholder="My Workspace"
              />
            </div>
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="workspace-slug" className="text-sm">
              Workspace Slug
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="workspace-slug"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                className="pl-10"
                placeholder="my-workspace"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your workspace will be available at:{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
                /workspace/{slug || "..."}
              </code>
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {hasChanges ? "You have unsaved changes" : "All changes saved"}
        </p>
        <Button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <Separator />

      {/* Danger Zone */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-red-500">Danger Zone</h3>
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Delete Workspace</p>
              <p className="text-xs text-muted-foreground">
                Permanently delete this workspace and all of its data including
                collections, requests, and environments. This action cannot be
                undone.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete Workspace
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="size-5" />
              Delete Workspace
            </DialogTitle>
            <DialogDescription className="pt-2">
              This action <strong>cannot be undone</strong>. This will
              permanently delete the workspace{" "}
              <strong>&quot;{activeWorkspace?.name}&quot;</strong> and all of
              its data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="delete-confirmation" className="text-sm">
              Type{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-semibold">
                {activeWorkspace?.name}
              </code>{" "}
              to confirm
            </Label>
            <Input
              id="delete-confirmation"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Enter workspace name"
              className="font-mono"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmation("");
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={
                isDeleting || deleteConfirmation !== activeWorkspace?.name
              }
              className="gap-2"
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
