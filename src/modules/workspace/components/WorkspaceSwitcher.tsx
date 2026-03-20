"use client";

import { Briefcase, Check, ChevronDown, Plus } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import authClient from "@/lib/authClient";
import { cn } from "@/lib/utils";
import UnsavedChangesDialog from "@/modules/apis/requests/components/UnsavedChangesDialog";
import { useUnsavedChangesGuard } from "@/modules/apis/requests/hooks/useUnsavedChangesGuard";
import WorkspaceSetup from "@/modules/workspace/components/workspace-setup";
import useResetStore from "@/store/reset";
import { useWorkspaceSwitcher } from "../hooks/use-workspace-switcher";
import useWorkspaceState from "../store";

const WorkspaceSwitcher = () => {
  const router = useRouter();
  const { resetCollectionsRequestsAndCookies } = useResetStore();
  const { workspaces, activeWorkspace } = useWorkspaceState();
  const { switchWorkspace, initializeWorkspaceTracking, currentWorkspaceId } =
    useWorkspaceSwitcher();
  const [workspaceSetupModalOpen, setWorkspaceSetupModalOpen] =
    React.useState(false);

  // Unsaved changes guard for workspace switching
  const unsavedGuard = useUnsavedChangesGuard();

  // Initialize workspace tracking on mount
  useEffect(() => {
    if (activeWorkspace?.id && !currentWorkspaceId) {
      initializeWorkspaceTracking(activeWorkspace.id);
    }
  }, [activeWorkspace?.id, currentWorkspaceId, initializeWorkspaceTracking]);

  const performWorkspaceSwitch = async (workspaceId: string) => {
    const workspace = workspaces?.find((w) => w.id === workspaceId);
    if (workspace) {
      authClient.organization.setActive({
        organizationId: workspace.id,
        organizationSlug: workspace.slug || "",
      });
      switchWorkspace(workspace);
      resetCollectionsRequestsAndCookies();
      router.push(`/workspace/${workspace.slug}`);
    }
  };

  const handleWorkspaceSwitch = (workspaceId: string) => {
    // Don't show modal if switching to the same workspace
    if (workspaceId === activeWorkspace?.id) {
      return;
    }

    // Use the unsaved changes guard to check before switching
    unsavedGuard.confirmWorkspaceSwitch(() => {
      performWorkspaceSwitch(workspaceId);
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="h-auto py-1.5 px-2 gap-2 hover:bg-muted/50 rounded-xl transition-all group border border-transparent hover:border-border/40 max-w-[240px] focus-visible:ring-0 focus-visible:ring-offset-0"
          >
            <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/10 group-hover:border-primary/20 transition-colors shrink-0">
              <Briefcase className="size-3.5 text-primary" />
            </div>
            <div className="flex flex-col items-start gap-px text-left min-w-0 flex-1">
              <span className="text-[9px] uppercase font-bold text-muted-foreground/70 tracking-wider leading-none">
                Workspace
              </span>
              <div className="flex items-center gap-1.5 w-full">
                <span className="text-sm font-semibold text-foreground truncate block w-full leading-none mt-0.5">
                  {activeWorkspace?.name || "Select Workspace"}
                </span>
                <ChevronDown className="size-3 text-muted-foreground/50 group-hover:text-foreground transition-colors shrink-0" />
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-[260px] rounded-2xl p-1.5 border-border/50 bg-background/70 backdrop-blur-xl shadow-2xl"
        >
          {/* Header */}
          <div className="px-2 py-1.5 mb-1 bg-muted/40 rounded-xl border border-border/40">
            <p className="text-xs font-semibold text-foreground">Workspaces</p>
            <p className="text-[10px] text-muted-foreground">
              Switch between workspaces
            </p>
          </div>

          <DropdownMenuSeparator className="my-1.5 bg-border/50" />

          {/* Workspace list */}
          <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
            {workspaces?.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => handleWorkspaceSwitch(workspace.id)}
                className={cn(
                  "gap-3 py-1.5 px-2 rounded-lg cursor-pointer group focus:bg-accent/50",
                  activeWorkspace?.id === workspace.id && "bg-accent/60",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center size-7 rounded-lg transition-colors border",
                    activeWorkspace?.id === workspace.id
                      ? "bg-primary/20 border-primary/20"
                      : "bg-background/50 border-border/50 group-hover:border-primary/30 group-hover:bg-primary/10",
                  )}
                >
                  <Briefcase
                    className={cn(
                      "size-3.5",
                      activeWorkspace?.id === workspace.id
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-primary",
                    )}
                  />
                </div>
                <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                  <span
                    className={cn(
                      "text-xs font-medium truncate",
                      activeWorkspace?.id === workspace.id
                        ? "text-primary"
                        : "text-foreground",
                    )}
                  >
                    {workspace.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    /{workspace.slug}
                  </span>
                </div>
                {activeWorkspace?.id === workspace.id && (
                  <Check className="size-3.5 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="my-1.5 bg-border/50" />

          {/* Create new workspace */}
          <DropdownMenuItem
            onClick={() =>
              unsavedGuard.confirmWorkspaceSwitch(() =>
                setWorkspaceSetupModalOpen(true),
              )
            }
            className="gap-3 py-1.5 px-2 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground group focus:bg-accent/50"
          >
            <div className="flex items-center justify-center size-7 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
              <Plus className="size-3.5" />
            </div>
            <div className="flex flex-col flex-1 gap-0.5">
              <span className="text-xs font-medium group-hover:text-emerald-500 transition-colors">
                Create Workspace
              </span>
              <span className="text-[10px] text-muted-foreground">
                Add a new workspace
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Workspace Modal */}
      <Dialog
        onOpenChange={(open) => setWorkspaceSetupModalOpen(open || false)}
        open={workspaceSetupModalOpen}
        modal={true}
      >
        <DialogContent className="max-w-[700px]! min-w-[800px]! p-0 gap-0 overflow-hidden border-0">
          <DialogTitle className="sr-only">Create Workspace</DialogTitle>
          <div className="grid md:grid-cols-2 min-h-[420px]">
            {/* Left side - Decorative */}
            <div className="hidden md:flex relative bg-linear-to-br from-primary via-primary/90 to-primary/70 p-8 flex-col justify-between overflow-hidden">
              {/* Decorative gradient orbs */}
              <div className="absolute top-1/4 -left-16 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-white/90">
                  <div className="flex justify-center items-center bg-white/20 backdrop-blur-sm rounded-lg size-8">
                    <Briefcase className="size-4 text-white" />
                  </div>
                  <span className="font-semibold text-lg">New Workspace</span>
                </div>
              </div>

              <div className="relative z-10 space-y-4">
                <h2 className="text-2xl font-bold text-white leading-tight">
                  Organize your API testing workflow
                </h2>
                <p className="text-white/80 text-sm leading-relaxed">
                  Create dedicated workspaces for different projects and invite
                  your team to collaborate seamlessly.
                </p>
                <div className="flex gap-3 pt-2">
                  <div className="flex items-center gap-2 text-white/70 text-xs">
                    <div className="size-1.5 rounded-full bg-emerald-400" />
                    Unlimited collections
                  </div>
                  <div className="flex items-center gap-2 text-white/70 text-xs">
                    <div className="size-1.5 rounded-full bg-emerald-400" />
                    Team collaboration
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="flex items-center justify-center p-8 bg-background">
              <WorkspaceSetup type={"workspace-setup-modal"} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unsaved Changes Dialog for workspace switching */}
      {unsavedGuard.dialogProps && (
        <UnsavedChangesDialog {...unsavedGuard.dialogProps} />
      )}
    </>
  );
};

export default WorkspaceSwitcher;
