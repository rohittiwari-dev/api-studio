"use client";

import {
  Check,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  ExternalLink,
  FileText,
  FolderOpen,
  Hash,
  Layers,
  Link2,
  Radio,
  Shield,
  Wifi,
} from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { cn, requestTextColorMap } from "@/lib/utils";
import { substituteVariables } from "@/lib/utils/substituteVariables";
import useEnvironmentStore from "@/modules/apis/environment/store/environment.store";
import useRequestSyncStoreState from "@/modules/apis/requests/hooks/requestSyncStore";

// Animated copy button
const CopyButton = ({
  value,
  size = "sm",
}: {
  value: string;
  size?: "sm" | "md";
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "rounded-lg transition-all duration-200",
        size === "sm" ? "p-1" : "p-1.5",
        copied
          ? "bg-emerald-500/20 text-emerald-500"
          : "hover:bg-muted text-muted-foreground hover:text-foreground",
      )}
    >
      {copied ? (
        <Check className={size === "sm" ? "size-3" : "size-3.5"} />
      ) : (
        <Copy className={size === "sm" ? "size-3" : "size-3.5"} />
      )}
    </button>
  );
};

// Stat card for metrics
const StatCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) => (
  <div className="p-3 rounded-xl bg-muted/40 border border-border/40">
    <div className="flex items-center gap-2 mb-1">
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
    <p className="text-sm font-semibold text-foreground truncate">{value}</p>
  </div>
);

const RequestInfoPanel = () => {
  const { activeRequest } = useRequestSyncStoreState();
  const { getVariablesAsRecord } = useEnvironmentStore();

  if (!activeRequest) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 px-8">
        <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-4 border border-border/50">
          <FileText className="size-6 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          No Request Selected
        </p>
        <p className="text-xs text-muted-foreground text-center max-w-[180px]">
          Select a request to view details
        </p>
      </div>
    );
  }

  const getResolvedUrl = (url: string) => {
    try {
      const envVariables = getVariablesAsRecord();
      return substituteVariables(url, envVariables);
    } catch {
      return url;
    }
  };

  const activeHeaders = activeRequest.headers?.filter((h) => h.isActive) || [];
  const activeParams =
    activeRequest.parameters?.filter((p) => p.isActive) || [];
  const authType = activeRequest.auth?.type || "NONE";
  const resolvedUrl = activeRequest.url
    ? getResolvedUrl(activeRequest.url)
    : "";
  const hasEnvVars = resolvedUrl !== activeRequest.url;

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) {
      return "—";
    }
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Compact Header */}
      <div className="p-4 border-b border-border/40 shrink-0 bg-muted/20">
        {/* Type indicator */}
        <div className="flex items-center gap-2 mb-2">
          {activeRequest.type === "API" && activeRequest.method && (
            <span
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-bold",
                requestTextColorMap[activeRequest.method],
              )}
            >
              {activeRequest.method}
            </span>
          )}
          {activeRequest.type === "WEBSOCKET" && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-violet-500">
              <Wifi className="size-3" /> WS
            </span>
          )}
          {activeRequest.type === "SOCKET_IO" && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-indigo-500">
              <Radio className="size-3" /> Socket.IO
            </span>
          )}
          {activeRequest.unsaved && (
            <span className="flex items-center gap-1 text-[10px] text-amber-500">
              <span className="size-1.5 rounded-full bg-amber-500" />
              Unsaved
            </span>
          )}
        </div>

        <h2 className="text-base font-semibold text-foreground truncate">
          {activeRequest.name || "Untitled"}
        </h2>

        {activeRequest.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {activeRequest.description}
          </p>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {/* URL Block */}
        {activeRequest.url && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link2 className="size-3.5" />
              <span className="font-medium">URL</span>
            </div>
            <div className="group p-3 rounded-xl bg-muted/40 border border-border/40 hover:border-primary/30 transition-colors">
              <div className="flex items-start gap-2">
                <code className="text-[11px] font-mono text-foreground break-all flex-1">
                  {activeRequest.url}
                </code>
                <CopyButton value={activeRequest.url} />
              </div>
              {hasEnvVars && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/30">
                  <ExternalLink className="size-3 text-emerald-500 shrink-0" />
                  <code className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 break-all">
                    {resolvedUrl}
                  </code>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Headers */}
        {activeHeaders.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Hash className="size-3.5" />
                <span className="font-medium">Headers</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {activeHeaders.length}
              </span>
            </div>
            <div className="rounded-xl border border-border/40 overflow-hidden">
              {activeHeaders.slice(0, 4).map((h, i) => (
                <div
                  key={i?.toString()}
                  className="flex items-center gap-2 px-3 py-2 text-[11px] border-b border-border/20 last:border-0 hover:bg-muted/30"
                >
                  <span className="font-mono font-medium text-foreground shrink-0">
                    {h.key}
                  </span>
                  <ChevronRight className="size-2.5 text-muted-foreground/50" />
                  <span className="font-mono text-muted-foreground truncate">
                    {h.value}
                  </span>
                </div>
              ))}
              {activeHeaders.length > 4 && (
                <div className="px-3 py-1.5 text-[10px] text-muted-foreground bg-muted/20">
                  +{activeHeaders.length - 4} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Query Params */}
        {activeParams.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Code2 className="size-3.5" />
                <span className="font-medium">Params</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {activeParams.length}
              </span>
            </div>
            <div className="rounded-xl border border-border/40 overflow-hidden">
              {activeParams.slice(0, 4).map((p, i) => (
                <div
                  key={i?.toString()}
                  className="flex items-center gap-2 px-3 py-2 text-[11px] border-b border-border/20 last:border-0 hover:bg-muted/30"
                >
                  <span className="font-mono font-medium text-foreground shrink-0">
                    {p.key}
                  </span>
                  <span className="text-muted-foreground/50">=</span>
                  <span className="font-mono text-muted-foreground truncate">
                    {p.value}
                  </span>
                </div>
              ))}
              {activeParams.length > 4 && (
                <div className="px-3 py-1.5 text-[10px] text-muted-foreground bg-muted/20">
                  +{activeParams.length - 4} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="Body"
            value={activeRequest.bodyType?.replace("_", " ") || "None"}
            icon={Layers}
          />
          <StatCard label="Auth" value={authType} icon={Shield} />
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label="Collection"
            value={activeRequest.collectionId ? "Yes" : "No"}
            icon={FolderOpen}
          />
          <StatCard
            label="Modified"
            value={formatDate(activeRequest.updatedAt)}
            icon={Clock}
          />
        </div>
      </div>
    </div>
  );
};

export default RequestInfoPanel;
