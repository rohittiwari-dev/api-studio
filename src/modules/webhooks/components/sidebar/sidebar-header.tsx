"use client";

import { Zap } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
  SidebarHeader as ShadcnSidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import useWebhookStore from "../../store/webhook.store";

interface SidebarHeaderProps {
  onOpenCreate: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ onOpenCreate }) => {
  const { state } = useSidebar();
  const { isConnected } = useWebhookStore();

  return (
    <ShadcnSidebarHeader className="border-b border-border/50 pb-2 pt-3.5 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {/* Icon matching reference - violet bg with lightning */}
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white shadow-md shadow-violet-500/30">
            <Zap className="size-4" />
          </div>

          <div
            className={cn(
              "flex items-center gap-2 transition-all duration-200",
              state === "collapsed" && "opacity-0 w-0",
            )}
          >
            <span className="font-semibold text-sm text-foreground">
              Webhooks
            </span>

            {/* Status dot */}
            <span
              className={cn(
                "size-2 rounded-full",
                isConnected
                  ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                  : "bg-muted-foreground/50",
              )}
            />
          </div>
        </div>

        <div
          className={cn(
            "transition-opacity duration-200",
            state === "collapsed" && "opacity-0 hidden",
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-violet-500 hover:bg-violet-500/10 cursor-pointer!"
                onClick={onOpenCreate}
              >
                + New
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px] p-0.5">
              Create Webhook
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </ShadcnSidebarHeader>
  );
};

export default SidebarHeader;
