import {
  IconAlertTriangle,
  IconBraces,
  IconCheck,
  IconCode,
  IconDeviceFloppy,
  IconEdit,
  IconFileText,
  IconMessage,
  IconPlayerPlay,
  IconPlus,
  IconSearch,
  IconSparkles,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import hljs from "highlight.js";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Editor from "react-simple-code-editor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { updateRequestAction } from "../../actions";
import useRequestSyncStoreState from "../../hooks/requestSyncStore";
import type { MessageFormat } from "./WebSocketMessageComposer";

export interface SavedMessage {
  id: string;
  name: string;
  content: string;
  format: MessageFormat;
  eventName?: string; // For Socket.IO
  createdAt?: number;
}

type FilterType = "all" | "json" | "text";

interface WebSocketSavedMessagesProps {
  requestId: string;
  onSelect: (message: SavedMessage) => void;
  onAdd?: () => void;
  type: "WEBSOCKET" | "SOCKET_IO";
  className?: string;
}

const WebSocketSavedMessages: React.FC<WebSocketSavedMessagesProps> = ({
  requestId,
  onSelect,
  onAdd: _onAdd,
  type: _type,
  className,
}) => {
  const { updateRequest, getRequestById } = useRequestSyncStoreState();

  // Use selector to subscribe to changes in the specific request
  const request = getRequestById(requestId);

  // Normalize saved messages to new format (backward compatibility)
  const rawSavedMessages: any[] = request?.savedMessages || [];
  const savedMessages: SavedMessage[] = rawSavedMessages.map((msg, index) => ({
    id: msg.id || crypto.randomUUID(),
    name: msg.name || `Message ${index + 1}`,
    content: msg.content || "",
    format: msg.format || "text",
    eventName: msg.eventName,
    createdAt: msg.createdAt,
  }));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  const { resolvedTheme } = useTheme();

  // Create message modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMsgName, setNewMsgName] = useState("New Message");
  const [newMsgContent, setNewMsgContent] = useState("");
  const [newMsgFormat, setNewMsgFormat] = useState<MessageFormat>("text");
  const [newMsgJsonError, setNewMsgJsonError] = useState<string | null>(null);

  const highlight = React.useCallback(
    (code: string) => {
      if (newMsgFormat === "json") {
        try {
          return hljs.highlight(code, { language: "json" }).value;
        } catch (_e) {
          return code;
        }
      }
      return code;
    },
    [newMsgFormat],
  );

  // Filter and search messages
  const filteredMessages = useMemo(() => {
    return savedMessages.filter((msg) => {
      // Filter by type
      if (filterType === "json" && msg.format !== "json") {
        return false;
      }
      if (filterType === "text" && msg.format !== "text") {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          msg.name.toLowerCase().includes(query) ||
          msg.content.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [savedMessages, searchQuery, filterType]);

  // Handle open create modal
  const handleOpenCreateModal = () => {
    setNewMsgName("New Message");
    setNewMsgContent("");
    setNewMsgFormat("text");
    setNewMsgJsonError(null);
    setShowCreateModal(true);
  };

  // Validate JSON for new message
  const validateNewMsgJson = useCallback((text: string) => {
    if (!text?.trim()) {
      setNewMsgJsonError(null);
      return true;
    }
    try {
      JSON.parse(text);
      setNewMsgJsonError(null);
      return true;
    } catch (e) {
      if (e instanceof Error) {
        setNewMsgJsonError(e.message);
      }
      return false;
    }
  }, []);

  // Handle content change
  const handleContentChange = (val: string) => {
    setNewMsgContent(val);
    if (newMsgFormat === "json" && !val?.trim()) {
      setNewMsgJsonError(null);
    }
  };

  // Debounced JSON validation for modal content
  useEffect(() => {
    if (newMsgFormat !== "json" || !showCreateModal) {
      return;
    }

    if (!newMsgContent?.trim()) {
      return;
    }

    const timeoutId = setTimeout(() => {
      validateNewMsgJson(newMsgContent);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [newMsgContent, newMsgFormat, showCreateModal, validateNewMsgJson]);

  // Handle create new message
  const handleCreateMessage = () => {
    if (!newMsgName?.trim() || !newMsgContent?.trim()) {
      return;
    }
    if (newMsgFormat === "json" && newMsgJsonError) {
      return;
    }

    const newMessage: SavedMessage = {
      id: crypto.randomUUID(),
      name: newMsgName?.trim(),
      content: newMsgContent,
      format: newMsgFormat,
      createdAt: Date.now(),
    };

    const updatedMessages = [...savedMessages, newMessage];

    // Optimistic update
    updateRequest(requestId, {
      savedMessages: updatedMessages,
    });

    // Backend update
    updateRequestAction(requestId, { savedMessages: updatedMessages });

    setShowCreateModal(false);
  };

  // Start editing a message name
  const handleStartEdit = (msg: SavedMessage) => {
    setEditingId(msg.id);
    setEditName(msg.name);
  };

  // Save edited name
  const handleSaveEdit = () => {
    if (!editingId || !editName?.trim()) {
      return;
    }

    const updatedMessages = savedMessages.map((msg) =>
      msg.id === editingId ? { ...msg, name: editName?.trim() } : msg,
    );

    // Optimistic update
    updateRequest(requestId, { savedMessages: updatedMessages });
    // Backend update
    updateRequestAction(requestId, { savedMessages: updatedMessages });

    setEditingId(null);
    setEditName("");
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  // Delete a message
  const handleDelete = () => {
    if (!deleteId) {
      return;
    }

    const updatedMessages = savedMessages.filter((m) => m.id !== deleteId);

    // Optimistic update
    updateRequest(requestId, {
      savedMessages: updatedMessages,
    });
    // Backend update
    updateRequestAction(requestId, { savedMessages: updatedMessages });

    setDeleteId(null);
  };

  // Detect if content is JSON
  const isJson = (content: string): boolean => {
    try {
      JSON.parse(content);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div
      className={cn("flex flex-col h-full min-h-0 overflow-hidden", className)}
    >
      {/* Header */}
      <div className="flex flex-col gap-3 p-3 pb-2 border-b border-border/40 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground tracking-tight">
              Saved Messages
            </span>
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 h-4 min-w-5 justify-center rounded-full bg-muted text-muted-foreground border border-border/50"
            >
              {filteredMessages.length}
            </Badge>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleOpenCreateModal}
                  className="h-7 px-2.5 text-xs gap-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary transition-colors border border-primary/10 shadow-sm"
                >
                  <IconPlus className="size-3.5" />
                  <span>New</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[10px]">
                Create new template
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-2 text-xs rounded-lg border-border/50 bg-muted/40 hover:bg-muted/60 focus-visible:bg-background focus-visible:ring-primary/20 transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
              >
                <IconX className="size-3" />
              </button>
            )}
          </div>
          {/* Filter Segmented Control */}
          <div className="flex items-center p-0.5 rounded-lg bg-muted/40 border border-border/40">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={cn(
                "flex items-center justify-center h-7 px-2.5 rounded-md text-[10px] font-medium transition-all duration-200",
                filterType === "all"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              All
            </button>
            <div className="w-px h-3 bg-border/40 mx-0.5" />
            <button
              type="button"
              onClick={() => setFilterType("json")}
              className={cn(
                "flex items-center justify-center h-7 px-2.5 rounded-md text-[10px] font-medium transition-all duration-200",
                filterType === "json"
                  ? "bg-background text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-muted/50",
              )}
            >
              JSON
            </button>
            <div className="w-px h-3 bg-border/40 mx-0.5" />
            <button
              type="button"
              onClick={() => setFilterType("text")}
              className={cn(
                "flex items-center justify-center h-7 px-2.5 rounded-md text-[10px] font-medium transition-all duration-200",
                filterType === "text"
                  ? "bg-background text-orange-600 dark:text-orange-400 shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 hover:bg-muted/50",
              )}
            >
              Text
            </button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-3 space-y-2">
          {filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <div className="size-14 rounded-lg bg-linear-to-br from-muted/50 to-muted/20 flex items-center justify-center">
                <IconMessage className="size-8 text-muted-foreground/40" />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium block">
                  {savedMessages.length === 0
                    ? "No saved messages"
                    : "No matches found"}
                </span>
                <span className="text-[11px] text-muted-foreground/60 mt-1 block px-4 max-w-48">
                  {savedMessages.length === 0
                    ? "Save messages from the composer to reuse them later"
                    : "Try a different search or filter"}
                </span>
              </div>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const msgIsJson = msg.format === "json" || isJson(msg.content);
              const isEditing = editingId === msg.id;

              return (
                <div
                  role="img"
                  onKeyDown={() => {}}
                  key={msg.id}
                  className={cn(
                    "group flex flex-col rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-all duration-200",
                    "hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 cursor-pointer overflow-hidden",
                  )}
                  onClick={() => onSelect(msg)}
                >
                  {/* Message Header */}
                  <div className="flex items-center gap-2 p-3 pb-2">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5 flex-1 animate-in fade-in duration-200">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-7 text-xs flex-1 rounded-md bg-background focus-visible:ring-primary/20"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            if (e.key === "Enter") {
                              handleSaveEdit();
                            }
                            if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-emerald-500 hover:bg-emerald-500/10 rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveEdit();
                          }}
                        >
                          <IconCheck className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:bg-muted rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelEdit();
                          }}
                        >
                          <IconX className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div
                            className={cn(
                              "flex items-center justify-center size-7 rounded-md shrink-0 border border-border/30",
                              msgIsJson
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-orange-500/10 text-orange-600 dark:text-orange-400",
                            )}
                          >
                            {msgIsJson ? (
                              <IconBraces className="size-3.5" />
                            ) : (
                              <IconFileText className="size-3.5" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[13px] font-medium truncate text-foreground/90 group-hover:text-primary transition-colors">
                              {msg.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60 truncate">
                              {msg.createdAt
                                ? new Date(msg.createdAt).toLocaleDateString()
                                : "Template"}
                            </span>
                          </div>
                        </div>

                        {/* Actions (visible on hover) */}
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-200">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-muted rounded-md text-muted-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(msg);
                            }}
                          >
                            <IconEdit className="size-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(msg.id);
                            }}
                          >
                            <IconTrash className="size-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Message Content Preview */}
                  <div className="px-3 pb-3">
                    <div className="relative rounded-md bg-muted/40 border border-border/30 overflow-hidden group/preview">
                      <pre
                        className={cn(
                          "p-2 text-[10px] font-mono text-muted-foreground/90",
                          "max-h-20 overflow-hidden text-ellipsis leading-relaxed",
                          "whitespace-pre-wrap break-all text-ellipsis",
                        )}
                      >
                        {msg.content}
                      </pre>

                      {/* Mask for long content */}
                      <div className="absolute inset-x-0 bottom-0 h-6 bg-linear-to-t from-muted/30 group-hover:from-muted/50 to-transparent pointer-events-none" />

                      {/* "Use" Overlay on Hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/5 backdrop-blur-[1px]">
                        <Badge
                          variant="secondary"
                          className="bg-background shadow-sm text-[10px] h-6 px-2 gap-1.5 border-primary/20 text-primary"
                        >
                          <IconPlayerPlay className="size-3" />
                          Use
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">
              Delete Message?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              This will permanently delete this saved message. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs h-8">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="text-xs h-8 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Message Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden border-border/60 shadow-2xl bg-card">
          {/* Header */}
          <DialogHeader className="p-6 py-4 border-b border-border/40 bg-muted/40">
            <DialogTitle className="text-base font-medium flex items-center gap-2.5">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-sm">
                <IconPlus className="size-4" />
              </div>
              Create Saved Message
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground ml-[42px]">
              Save this message as a template to reuse it later.
            </DialogDescription>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Name Input */}
              <div className="space-y-2">
                <Label
                  htmlFor="msgName"
                  className="text-sm font-medium text-foreground"
                >
                  Message Name
                </Label>
                <Input
                  id="msgName"
                  value={newMsgName}
                  onChange={(e) => setNewMsgName(e.target.value)}
                  placeholder="e.g., Subscribe to updates"
                  className="h-10 bg-input! text-sm rounded-lg border-border/50  focus-visible:ring-primary/20 transition-all shadow-sm"
                />
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Message Format
                </Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center p-1 rounded-lg bg-muted/60 border border-border/40 w-fit">
                    <button
                      type="button"
                      onClick={() => {
                        setNewMsgFormat("text");
                        setNewMsgJsonError(null);
                      }}
                      className={cn(
                        "flex items-center justify-center h-7 px-4 rounded-md text-[11px] font-medium transition-all duration-200 min-w-[70px]",
                        newMsgFormat === "text"
                          ? "bg-background text-foreground shadow-sm ring-1 ring-border/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                      )}
                    >
                      Text
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNewMsgFormat("json");
                        if (newMsgContent?.trim()) {
                          validateNewMsgJson(newMsgContent);
                        }
                      }}
                      className={cn(
                        "flex items-center justify-center h-7 px-4 rounded-md text-[11px] font-medium transition-all duration-200 min-w-[70px]",
                        newMsgFormat === "json"
                          ? "bg-background text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-border/20"
                          : "text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-background/50",
                      )}
                    >
                      JSON
                    </button>
                  </div>

                  {/* JSON Status (if applicable) */}
                  {newMsgFormat === "json" && newMsgContent?.trim() && (
                    <Badge
                      variant={newMsgJsonError ? "destructive" : "outline"}
                      className={cn(
                        "text-[10px] px-2.5 py-0.5 h-6 rounded-md font-medium border shadow-sm",
                        !newMsgJsonError &&
                          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                      )}
                    >
                      {newMsgJsonError ? "Invalid JSON" : "Valid JSON"}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">
                    Content
                  </Label>

                  {/* JSON Tools */}
                  {newMsgFormat === "json" && (
                    <div className="flex items-center gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                if (!newMsgContent?.trim()) {
                                  return;
                                }
                                try {
                                  const parsed = JSON.parse(newMsgContent);
                                  setNewMsgContent(
                                    JSON.stringify(parsed, null, 2),
                                  );
                                  setNewMsgJsonError(null);
                                } catch (e) {
                                  if (e instanceof Error) {
                                    setNewMsgJsonError(e.message);
                                  }
                                }
                              }}
                            >
                              <IconSparkles className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="text-[10px]">
                            Prettify JSON
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground"
                              onClick={() => {
                                if (!newMsgContent?.trim()) {
                                  return;
                                }
                                try {
                                  const parsed = JSON.parse(newMsgContent);
                                  setNewMsgContent(JSON.stringify(parsed));
                                  setNewMsgJsonError(null);
                                } catch (e) {
                                  if (e instanceof Error) {
                                    setNewMsgJsonError(e.message);
                                  }
                                }
                              }}
                            >
                              <IconCode className="size-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="text-[10px]">
                            Minify JSON
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    "h-[180px] w-full relative rounded-lg border border-border/40 bg-muted/20 overflow-hidden",
                    "transition-all duration-200 focus-within:ring-1 focus-within:ring-primary/20 focus-within:border-primary/30",
                  )}
                >
                  <link
                    rel="stylesheet"
                    href={
                      resolvedTheme === "dark"
                        ? "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/tokyo-night-dark.min.css"
                        : "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/intellij-light.min.css"
                    }
                    crossOrigin="anonymous"
                  />
                  <Editor
                    value={newMsgContent}
                    onValueChange={handleContentChange}
                    highlight={highlight}
                    padding={12}
                    spellCheck={false}
                    tabSize={4}
                    style={{
                      lineHeight: "1.5",
                      fontFamily:
                        'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                      color:
                        resolvedTheme === "dark" ? "#becad3ff" : "#45505eff",
                      borderRadius: "8px",
                      height: "100%",
                      minHeight: "100%",
                      backgroundColor: "transparent",
                    }}
                    textareaClassName="focus:outline-none resize-none !text-xs !bg-input"
                    preClassName={
                      newMsgFormat === "json"
                        ? "language-json !text-xs"
                        : "!text-xs"
                    }
                  />

                  {newMsgJsonError && (
                    <div className="absolute inset-x-2 bottom-2 z-10">
                      <div className="bg-destructive/10 backdrop-blur-md border border-destructive/20 text-destructive text-[10px] px-3 py-2 rounded-md shadow-sm animate-in fade-in slide-in-from-bottom-1 flex items-start gap-2">
                        <div className="mt-0.5">
                          <IconAlertTriangle className="size-3" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold block mb-0.5">
                            Invalid JSON
                          </span>
                          <span className="opacity-90">{newMsgJsonError}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-4 border-t border-border/40 bg-muted/40">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateModal(false)}
              className="h-9 px-4 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCreateMessage}
              disabled={
                !newMsgName?.trim() ||
                !newMsgContent?.trim() ||
                (newMsgFormat === "json" && !!newMsgJsonError)
              }
              className="h-9 px-4 text-xs font-medium gap-1.5 shadow-sm rounded-lg"
            >
              <IconDeviceFloppy className="size-3.5" />
              Save Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebSocketSavedMessages;
