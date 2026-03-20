"use client";

import { Check, ChevronDown, Globe, Settings, Zap } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { getEnvironmentsByWorkspace } from "@/modules/apis/environment/actions";
import useEnvironmentStore, {
  type EnvironmentState,
} from "@/modules/apis/environment/store/environment.store";
import useRightPanelStore from "@/modules/apis/layout/store/right-panel.store";
import useWorkspaceState from "@/modules/workspace/store";

const EnvironmentDropdown = () => {
  const {
    environments,
    activeEnvironmentId,
    setEnvironments,
    setActiveEnvironment,
  } = useEnvironmentStore();

  const { activeWorkspace } = useWorkspaceState();
  const { setActivePanel } = useRightPanelStore();

  // Load environments when workspace changes
  useEffect(() => {
    const loadEnvironments = async () => {
      if (!activeWorkspace?.id) {
        return;
      }
      try {
        const envs = await getEnvironmentsByWorkspace(activeWorkspace.id);
        const mapped = envs.map(
          (env): EnvironmentState => ({
            id: env.id,
            name: env.name,
            description: env.description,
            variables: Array.isArray(env.variables)
              ? (env.variables as any)
              : [],
            isGlobal: env.isGlobal,
            workspaceId: env.workspaceId,
          }),
        );
        setEnvironments(mapped);
      } catch (error) {
        console.error("Failed to load environments", error);
      }
    };

    if (activeWorkspace?.id) {
      loadEnvironments();
    }
  }, [activeWorkspace?.id, setEnvironments]);

  const activeEnv = environments.find((e) => e.id === activeEnvironmentId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-auto py-1.5 px-2 gap-2 hover:bg-muted/50 rounded-xl transition-all group border border-transparent hover:border-border/40 max-w-[240px] focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          <div
            className={cn(
              "size-7 rounded-lg flex items-center justify-center border transition-colors shrink-0",
              activeEnv
                ? "bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/30"
                : "bg-muted border-transparent group-hover:border-border/40",
            )}
          >
            <Zap
              className={cn(
                "size-3.5",
                activeEnv
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-muted-foreground",
              )}
            />
          </div>
          <div className="flex flex-col items-start gap-px text-left min-w-0 flex-1">
            <span className="text-[9px] uppercase font-bold text-muted-foreground/70 tracking-wider leading-none">
              Environment
            </span>
            <div className="flex items-center gap-1.5 w-full">
              <span
                className={cn(
                  "text-sm font-semibold truncate block w-full leading-none mt-0.5",
                  activeEnv
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-muted-foreground",
                )}
              >
                {activeEnv?.name || "No Environment"}
              </span>
              <ChevronDown className="size-3 text-muted-foreground/50 group-hover:text-foreground transition-colors shrink-0" />
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[260px] rounded-2xl p-1.5 border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl"
      >
        {/* Header */}
        <div className="px-2 py-1.5 mb-1 bg-muted/40 rounded-xl border border-border/40">
          <p className="text-xs font-semibold text-foreground">Environments</p>
          <p className="text-[10px] text-muted-foreground">
            Select active environment
          </p>
        </div>

        <DropdownMenuSeparator className="my-1.5 bg-border/50" />

        <div className="flex flex-col gap-0.5 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
          {/* No Environment option */}
          <DropdownMenuItem
            onClick={() => {
              setActiveEnvironment(null);
              toast.success("Environment cleared");
            }}
            className={cn(
              "gap-3 py-1.5 px-2 rounded-lg cursor-pointer group focus:bg-accent/50",
              !activeEnvironmentId && "bg-accent/60",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center size-7 rounded-lg transition-colors border",
                !activeEnvironmentId
                  ? "bg-muted border-border/50"
                  : "bg-transparent border-transparent group-hover:bg-muted/50 group-hover:border-border/30",
              )}
            >
              <Globe className="size-3.5 text-muted-foreground" />
            </div>
            <div className="flex flex-col flex-1 gap-0.5">
              <span className="text-xs font-medium">No Environment</span>
              <span className="text-[10px] text-muted-foreground">
                Use without variables
              </span>
            </div>
            {!activeEnvironmentId && (
              <Check className="size-3.5 text-foreground shrink-0" />
            )}
          </DropdownMenuItem>

          {/* Environment list */}
          {environments.map((env) => (
            <DropdownMenuItem
              key={env.id}
              onClick={() => {
                setActiveEnvironment(env.id);
                toast.success(`Active: ${env.name}`);
              }}
              className={cn(
                "gap-3 py-1.5 px-2 rounded-lg cursor-pointer group focus:bg-accent/50",
                activeEnvironmentId === env.id &&
                  "bg-emerald-500/10 dark:bg-emerald-500/20",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-center size-7 rounded-lg transition-colors border",
                  activeEnvironmentId === env.id
                    ? "bg-emerald-500/20 border-emerald-500/20"
                    : "bg-transparent border-transparent group-hover:bg-muted/50 group-hover:border-border/30",
                )}
              >
                <Zap
                  className={cn(
                    "size-3.5",
                    activeEnvironmentId === env.id
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground",
                  )}
                />
              </div>
              <div className="flex flex-col flex-1 min-w-0 gap-0.5">
                <span
                  className={cn(
                    "text-xs font-medium truncate",
                    activeEnvironmentId === env.id
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-foreground",
                  )}
                >
                  {env.name}
                </span>
                {env.description && (
                  <span className="text-[10px] text-muted-foreground truncate">
                    {env.description}
                  </span>
                )}
              </div>
              {activeEnvironmentId === env.id && (
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="my-1.5 bg-border/50" />

        {/* Manage environments */}
        <DropdownMenuItem
          onClick={() => setActivePanel("environment")}
          className="gap-3 py-1.5 px-2 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground group focus:bg-accent/50"
        >
          <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
            <Settings className="size-3.5 text-primary" />
          </div>
          <div className="flex flex-col flex-1 gap-0.5">
            <span className="text-xs font-medium group-hover:text-primary transition-colors">
              Manage Environments
            </span>
            <span className="text-[10px] text-muted-foreground">
              Configure variables
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EnvironmentDropdown;
