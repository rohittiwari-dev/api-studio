"use client";

import type React from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from "@/components/ui/sidebar";
import type { Webhook } from "../../types/webhook.types";
import WebhookItem from "./webhook-item";

interface WebhookListProps {
  webhooks: Webhook[];
  isLoading: boolean;
  activeWebhookId?: string;
  onSelect: (webhook: Webhook) => void;
  onCopy: (webhook: Webhook) => void;
  onDelete: (webhook: Webhook) => void;
}

const WebhookList: React.FC<WebhookListProps> = ({
  webhooks,
  isLoading,
  activeWebhookId,
  onSelect,
  onCopy,
  onDelete,
}) => {
  const { state } = useSidebar();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 px-4">
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Skeleton Items */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 w-full animate-pulse opacity-50"
            >
              <div className="size-9 rounded-lg bg-white/5 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-3/4 rounded bg-white/5" />
                <div className="h-2 w-1/2 rounded bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:p-0">
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1.5 px-2">
          {webhooks.map((webhook) => (
            <WebhookItem
              key={webhook.id}
              webhook={webhook}
              isActive={activeWebhookId === webhook.id}
              isCollapsed={state === "collapsed"}
              onSelect={() => onSelect(webhook)}
              onCopy={() => onCopy(webhook)}
              onDelete={() => onDelete(webhook)}
            />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default WebhookList;
