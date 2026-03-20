"use client";

import { format } from "date-fns";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  FileJson,
  Filter,
  Globe,
  Pause,
  Play,
  Search,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeEditor } from "@/components/ui/code-editor";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useClearWebhookEvents, useWebhookEvents } from "../hooks/queries";
import type { WebhookEvent } from "../types/webhook.types";

interface WebhookEventViewerProps {
  webhookId: string;
  webhookName?: string;
}

const WebhookEventViewer: React.FC<WebhookEventViewerProps> = ({
  webhookId,
  webhookName = "webhook",
}) => {
  const [filter, setFilter] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<string[]>([]);

  const { data: events = [], isLoading } = useWebhookEvents(webhookId);
  const clearEvents = useClearWebhookEvents();

  // Filter events
  const filteredEvents = events.filter((event) => {
    if (!filter) {
      return true;
    }
    const search = filter.toLowerCase();
    return (
      event.method.toLowerCase().includes(search) ||
      JSON.stringify(event.body).toLowerCase().includes(search) ||
      JSON.stringify(event.headers).toLowerCase().includes(search)
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedEvents((prev) =>
      prev.includes(id)
        ? prev.filter((prevId) => prevId !== id)
        : [...prev, id],
    );
  };

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleDownload = () => {
    if (events.length === 0) {
      toast.error("No events to download");
      return;
    }

    const data = {
      webhookId,
      exportedAt: new Date().toISOString(),
      totalEvents: events.length,
      events,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${webhookName.replace(/\s+/g, "-").toLowerCase()}-events-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${events.length} events`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="size-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        <p className="text-xs text-muted-foreground">Loading events...</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/5 dark:border-white/5 p-12 m-4 bg-linear-to-br from-violet-500/5 via-fuchsia-500/5 to-transparent backdrop-blur-sm">
        <div className="size-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
          <Clock className="size-7 text-violet-500" />
        </div>
        <h3 className="text-lg font-semibold">Waiting for events</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm text-center">
          Send a request to your webhook URL to see it appear here in realtime.
        </p>
        <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-background/50 border border-white/5 dark:border-white/5">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">
            Listening for incoming requests...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full rounded-2xl border border-white/5 dark:border-white/5 bg-background/40 backdrop-blur-sm overflow-hidden shadow-lg">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5 dark:border-white/5 bg-linear-to-r from-violet-500/5 via-transparent to-transparent">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Filter events by method, body, or headers..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-9 pl-9 bg-background/50 border-white/10 dark:border-white/10 text-sm focus-visible:ring-violet-500/30 rounded-lg"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "size-9 rounded-lg transition-all",
                  autoScroll
                    ? "text-violet-500 bg-violet-500/10 border border-violet-500/20"
                    : "text-muted-foreground border border-transparent hover:border-white/10",
                )}
                onClick={() => setAutoScroll(!autoScroll)}
              >
                {autoScroll ? (
                  <Pause className="size-4" />
                ) : (
                  <Play className="size-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {autoScroll ? "Pause auto-scroll" : "Resume auto-scroll"}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 rounded-lg text-muted-foreground border border-transparent hover:text-foreground hover:bg-white/5 hover:border-white/10"
                onClick={handleDownload}
                disabled={events.length === 0}
              >
                <Download className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download all events</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 rounded-lg text-muted-foreground border border-transparent hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
                onClick={() => clearEvents.mutate(webhookId)}
                disabled={events.length === 0}
              >
                <Trash2 className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Clear all events</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Events List */}
      <ScrollArea className="flex-1 overflow-x-hidden w-full overflow-y-auto ">
        <div className="flex flex-col">
          {filteredEvents.length === 0 ? (
            <div className="py-16 text-center">
              <div className="size-12 rounded-xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                <Search className="size-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">
                No events match your filter
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <EventItem
                key={event.id}
                event={event}
                webhookName={webhookName}
                isExpanded={expandedEvents.includes(event.id)}
                onToggle={() => toggleExpand(event.id)}
                onCopy={copyToClipboard}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer Status */}
      <div className="border-t border-white/5 dark:border-white/5 bg-background/50 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">
          {filteredEvents.length} event
          {filteredEvents.length !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">Live</span>
          <span className="text-muted-foreground/70">
            • Listening for events
          </span>
        </span>
      </div>
    </div>
  );
};

// Event Item Component
const EventItem = ({
  event,
  isExpanded,
  onToggle,
  onCopy,
  webhookName,
}: {
  event: WebhookEvent;
  isExpanded: boolean;
  webhookName: string;
  onToggle: () => void;
  onCopy: (text: string, label: string) => void;
}) => {
  const methodColors: Record<string, string> = {
    GET: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    POST: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    PUT: "text-orange-500 bg-orange-500/10 border-orange-500/20",
    DELETE: "text-red-500 bg-red-500/10 border-red-500/20",
    PATCH: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  };

  const methodColor =
    methodColors[event.method.toUpperCase()] ||
    "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";

  // Extract origin from headers
  const origin: string =
    event.headers?.origin ||
    event.headers?.referer ||
    event.headers?.host ||
    "Direct Request";

  // Format headers as YAML-like string for CodeEditor
  const headersString = Object.entries(event.headers || {})
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  // Format query params as YAML-like string
  const queryString = event.searchParams
    ? Object.entries(event.searchParams)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n")
    : "";

  // Format body
  const bodyString: string =
    typeof event.body === "string"
      ? event.body
      : (JSON.stringify(event.body, null, 2) ?? "");

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const data = {
      ...event,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${webhookName
      .replace(/\s+/g, "-")
      .toLowerCase()}-event-${event.id.slice(0, 8)}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Event downloaded");
  };

  return (
    <div
      className={cn(
        "border-b border-white/5 dark:border-white/5 last:border-0 flex-1 min-w-0 overflow-hidden transition-all",
        isExpanded ? "bg-violet-500/2" : "bg-transparent hover:bg-muted/5",
      )}
    >
      {/* Collapsed Row - Compact */}
      <div
        role="img"
        onKeyDown={() => {}}
        className="flex items-center gap-2 px-3 pr-8 py-2.5 cursor-pointer select-none group"
        onClick={onToggle}
      >
        <div
          className={cn(
            "flex items-center justify-center size-5 rounded transition-all shrink-0",
            isExpanded
              ? "text-violet-500"
              : "text-muted-foreground/40 group-hover:text-foreground",
          )}
        >
          {isExpanded ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </div>

        <Badge
          variant="secondary"
          className={cn(
            "h-5 px-1.5 font-mono text-[10px] font-bold border shadow-none rounded shrink-0",
            methodColor,
          )}
        >
          {event.method}
        </Badge>

        {/* Origin URL */}
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          <Globe className="size-3 text-muted-foreground/40 shrink-0" />
          <span className="text-xs text-foreground/80 truncate">{origin}</span>
        </div>

        {/* Meta Info - Compact */}
        <div className="flex items-center gap-2 text-[10px] shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6 rounded dark:text-muted-foreground/60 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/10"
            onClick={handleDownload}
            title="Download Event JSON"
          >
            <Download className="size-3" />
          </Button>
          <span className="hidden sm:inline dark:text-muted-foreground/60 text-muted-foreground font-mono">
            {event.size}B
          </span>
          <span className="dark:text-muted-foreground/60 text-muted-foreground font-mono">
            {format(new Date(event.createdAt), "HH:mm:ss")}
          </span>
        </div>
      </div>

      {/* Expanded Details - Modern & Compact */}
      {isExpanded && (
        <div className="pb-3 px-3 animate-in fade-in duration-150 overflow-hidden">
          <div className="ml-5 space-y-2 min-w-0">
            {/* Quick Info Bar */}
            <div className="flex flex-wrap items-center gap-2 py-2 text-[10px]">
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/30">
                <span className="text-muted-foreground">ID:</span>
                <span className="font-mono text-foreground/80">
                  {event.id.slice(0, 12)}...
                </span>
              </div>
              {event.ip && (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/30">
                  <span className="text-muted-foreground">IP:</span>
                  <span className="font-mono text-foreground/80">
                    {event.ip}
                  </span>
                </div>
              )}
              {event.contentType && (
                <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/30">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-mono text-foreground/80">
                    {event.contentType}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/30">
                <span className="text-muted-foreground">Time:</span>
                <span className="font-mono text-foreground/80">
                  {format(new Date(event.createdAt), "MMM d, HH:mm:ss")}
                </span>
              </div>
            </div>

            {/* Headers - CodeEditor */}
            {!!event.headers && headersString && (
              <CodeEditor
                lang="yaml"
                header={true}
                dots={false}
                title={`Headers (${Object.keys(event.headers || {}).length})`}
                icon={<Filter className="size-3 text-blue-500" />}
                copyButton={true}
                writing={false}
                onCopy={() =>
                  onCopy(JSON.stringify(event.headers, null, 2), "Headers")
                }
                className="w-full! max-w-full h-auto max-h-32 border-slate-400/20 dark:border-white/10 bg-muted/30 dark:bg-zinc-900/50 rounded-lg overflow-hidden"
                contentClassName="p-3"
              >
                {headersString}
              </CodeEditor>
            )}

            {/* Query Params - CodeEditor */}
            {!!queryString && (
              <CodeEditor
                lang="yaml"
                header={true}
                dots={false}
                title={`Query Params (${
                  Object.keys(event.searchParams || {}).length
                })`}
                icon={<Search className="size-3 text-amber-500" />}
                copyButton={true}
                writing={false}
                onCopy={() =>
                  onCopy(
                    JSON.stringify(event.searchParams, null, 2),
                    "Query Params",
                  )
                }
                className="w-full! max-w-full h-auto max-h-32 border-slate-400/20 dark:border-white/10 bg-muted/30 dark:bg-zinc-900/50 rounded-lg overflow-hidden"
                contentClassName="p-3"
              >
                {queryString}
              </CodeEditor>
            )}

            {/* Body - CodeEditor */}
            {event.body !== undefined && event.body !== null && (
              <CodeEditor
                lang="json"
                header={true}
                dots={false}
                title={`Body (${event.size} bytes)`}
                icon={<FileJson className="size-3 text-emerald-500" />}
                copyButton={true}
                writing={false}
                onCopy={() => onCopy(bodyString, "Body")}
                className="w-full! max-w-full h-auto max-h-32 border-slate-400/20 dark:border-white/10 bg-muted/30 dark:bg-zinc-900/50 rounded-lg overflow-hidden"
                contentClassName="p-3"
              >
                {bodyString}
              </CodeEditor>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebhookEventViewer;
