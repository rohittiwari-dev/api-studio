import {
  IconBinary,
  IconBraces,
  IconCode,
  IconDeviceFloppy,
  IconFileText,
  IconPlus,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";
import hljs from "highlight.js";
import { useTheme } from "next-themes";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import Editor from "react-simple-code-editor";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AiGenerateButton } from "@/modules/ai/components/AiGenerateButton";

export type ArgFormat = "text" | "json" | "binary";

export interface SocketIOArg {
  id: string;
  content: string;
  format: ArgFormat;
}

interface SocketIOMessageComposerProps {
  args: SocketIOArg[];
  onArgsChange: (args: SocketIOArg[]) => void;
  eventName: string;
  onEventNameChange: (name: string) => void;
  ack: boolean;
  onAckChange: (ack: boolean) => void;
  onSend: (eventName: string, args: SocketIOArg[], ack: boolean) => void;
  onSave?: (
    name: string,
    eventName: string,
    args: SocketIOArg[],
    ack: boolean,
  ) => void;
  disabled?: boolean;
  className?: string;
}

const formatIcons: Record<ArgFormat, React.ReactNode> = {
  text: <IconFileText className="size-3.5" />,
  json: <IconBraces className="size-3.5" />,
  binary: <IconBinary className="size-3.5" />,
};

const formatLabels: Record<ArgFormat, string> = {
  text: "Text",
  json: "JSON",
  binary: "Binary",
};

const SocketIOMessageComposer: React.FC<SocketIOMessageComposerProps> = ({
  args,
  onArgsChange,
  eventName,
  onEventNameChange,
  ack,
  onAckChange,
  onSend,
  onSave,
  disabled,
  className,
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState("");
  const { resolvedTheme } = useTheme();

  // Add new arg
  const handleAddArg = () => {
    const newArg: SocketIOArg = {
      id: crypto.randomUUID(),
      content: "",
      format: "text",
    };
    onArgsChange([...args, newArg]);
  };

  // Remove arg
  const handleRemoveArg = (id: string) => {
    onArgsChange(args.filter((arg) => arg.id !== id));
  };

  // Update arg content
  const handleArgContentChange = (id: string, content: string) => {
    onArgsChange(
      args.map((arg) => (arg.id === id ? { ...arg, content } : arg)),
    );
  };

  // Update arg format
  const handleArgFormatChange = (id: string, format: ArgFormat) => {
    onArgsChange(args.map((arg) => (arg.id === id ? { ...arg, format } : arg)));
  };

  // Validate JSON for an arg
  const getJsonError = useCallback((content: string, format: ArgFormat) => {
    if (format !== "json" || !content?.trim()) {
      return null;
    }
    try {
      JSON.parse(content);
      return null;
    } catch (e) {
      if (e instanceof Error) {
        return e.message;
      }
      return "Invalid JSON";
    }
  }, []);

  // Prettify JSON for an arg
  const handlePrettify = (id: string) => {
    const arg = args.find((a) => a.id === id);
    if (!arg?.content?.trim() || arg.format !== "json") {
      return;
    }
    try {
      const parsed = JSON.parse(arg.content);
      const pretty = JSON.stringify(parsed, null, 2);
      handleArgContentChange(id, pretty);
    } catch {
      // Error will be displayed by getJsonError
    }
  };

  // Minify JSON for an arg
  const handleMinify = (id: string) => {
    const arg = args.find((a) => a.id === id);
    if (!arg?.content?.trim() || arg.format !== "json") {
      return;
    }
    try {
      const parsed = JSON.parse(arg.content);
      const minified = JSON.stringify(parsed);
      handleArgContentChange(id, minified);
    } catch {
      // Error will be displayed by getJsonError
    }
  };

  // Highlight code
  const highlight = useCallback((code: string, format: ArgFormat) => {
    if (format === "json") {
      try {
        const result = hljs.highlight(code, { language: "json" });
        return result.value;
      } catch {
        return hljs.highlightAuto(code).value;
      }
    }
    return code;
  }, []);

  // Check if any args have errors
  const hasErrors = useMemo(() => {
    return args.some(
      (arg) => arg.format === "json" && getJsonError(arg.content, arg.format),
    );
  }, [args, getJsonError]);

  // Check if can send
  const canSend = useMemo(() => {
    return !disabled && eventName.trim() && !hasErrors;
  }, [disabled, eventName, hasErrors]);

  // Handle send
  const handleSend = () => {
    if (!canSend) {
      return;
    }
    onSend(eventName, args, ack);
  };

  // Handle save
  const handleSave = () => {
    if (!eventName.trim()) {
      return;
    }
    setShowSaveDialog(true);
    setSaveName("New Message");
  };

  const confirmSave = () => {
    if (!saveName?.trim() || !onSave) {
      return;
    }
    onSave(saveName.trim(), eventName, args, ack);
    setShowSaveDialog(false);
    setSaveName("");
  };

  // Handle keyboard shortcut
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <>
      <div className={cn("flex flex-col h-full min-h-0 gap-3", className)}>
        {/* Args List */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-3">
          {args.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 py-8">
              <IconBraces className="size-8 text-muted-foreground/40" />
              <span className="text-xs">No arguments added</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddArg}
                className="h-7 text-[11px] gap-1.5"
              >
                <IconPlus className="size-3.5" />
                Add Argument
              </Button>
            </div>
          ) : (
            args.map((arg, index) => {
              const jsonError = getJsonError(arg.content, arg.format);

              return (
                <div
                  key={arg.id}
                  className="relative rounded-lg border border-border/50 bg-card/30 overflow-hidden"
                >
                  {/* Arg Header */}
                  <div className="flex items-center gap-2 px-2.5 py-1.5 bg-muted/30 border-b border-border/30">
                    <span className="text-[10px] font-bold text-muted-foreground">
                      ARG {index + 1}
                    </span>

                    {/* Format Selector */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[10px] gap-1 font-medium rounded-md"
                        >
                          {formatIcons[arg.format]}
                          {formatLabels[arg.format]}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-28 p-1">
                        <DropdownMenuItem
                          onClick={() => handleArgFormatChange(arg.id, "text")}
                          className="text-[11px] gap-2 cursor-pointer"
                        >
                          <IconFileText className="size-3.5" />
                          Text
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleArgFormatChange(arg.id, "json")}
                          className="text-[11px] gap-2 cursor-pointer"
                        >
                          <IconBraces className="size-3.5" />
                          JSON
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleArgFormatChange(arg.id, "binary")
                          }
                          className="text-[11px] gap-2 cursor-pointer"
                        >
                          <IconBinary className="size-3.5" />
                          Binary
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* JSON Tools */}
                    <div className="flex items-center gap-0.5 ml-auto">
                      <AiGenerateButton
                        type="body"
                        className="h-6 text-[10px] px-2 py-0"
                        label="Generate"
                        context={{
                          description: `Socket.IO event: ${eventName}`,
                          existingValues: arg.content,
                        }}
                        onGenerated={(data: unknown) => {
                          handleArgFormatChange(arg.id, "json");
                          handleArgContentChange(
                            arg.id,
                            JSON.stringify(data, null, 2),
                          );
                        }}
                      />

                      {arg.format === "json" && (
                        <>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePrettify(arg.id)}
                                  className="h-6 w-6 p-0 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  disabled={!arg.content?.trim()}
                                >
                                  <IconSparkles className="size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="text-[10px]"
                              >
                                Prettify
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMinify(arg.id)}
                                  className="h-6 w-6 p-0 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10"
                                  disabled={!arg.content?.trim()}
                                >
                                  <IconCode className="size-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="text-[10px]"
                              >
                                Minify
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </>
                      )}
                    </div>

                    {/* Delete Button */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveArg(arg.id)}
                      className={cn(
                        "h-6 w-6 p-0 rounded-md text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10",
                        arg.format !== "json" && "ml-auto",
                      )}
                    >
                      <IconTrash className="size-3" />
                    </Button>
                  </div>

                  {/* Arg Content Editor */}
                  <div className="relative min-h-[80px]">
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
                      value={arg.content}
                      onValueChange={(val) =>
                        handleArgContentChange(arg.id, val)
                      }
                      highlight={(code) => highlight(code, arg.format)}
                      padding={10}
                      spellCheck={false}
                      tabSize={2}
                      placeholder={
                        arg.format === "json"
                          ? '{"key": "value"}'
                          : arg.format === "binary"
                            ? "Base64 encoded data..."
                            : "Enter text..."
                      }
                      style={{
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                        fontSize: "11px",
                        minHeight: "80px",
                        backgroundColor: "transparent",
                      }}
                      textareaClassName="focus:outline-none resize-none !text-xs !bg-transparent"
                      preClassName={
                        arg.format === "json"
                          ? "language-json !text-xs"
                          : "!text-xs"
                      }
                      onKeyDown={handleKeyDown}
                    />
                    {jsonError && (
                      <div className="absolute bottom-2 left-2 bg-destructive/10 backdrop-blur-md border border-destructive/20 text-destructive text-[10px] px-2 py-1 rounded-md shadow-sm pointer-events-none">
                        {jsonError}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center gap-2 shrink-0 pt-2 border-t border-border/30">
          {/* Add Arg Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddArg}
            className="h-7 px-2.5 text-[11px] font-medium gap-1.5 rounded-md text-muted-foreground hover:text-foreground"
          >
            <IconPlus className="size-3.5" />
            Arg
          </Button>

          {/* Format indicator for first arg */}
          {args.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
              {formatIcons[args[0].format]}
              <span className="font-medium">
                {formatLabels[args[0].format]}
              </span>
            </div>
          )}

          <div className="flex-1" />

          {/* Ack Checkbox */}
          <div className="flex items-center gap-1.5">
            <Checkbox
              id="ack"
              checked={ack}
              onCheckedChange={(c) => onAckChange(!!c)}
              className="size-3.5"
            />
            <Label
              htmlFor="ack"
              className="text-[11px] font-medium text-muted-foreground cursor-pointer"
            >
              Ack
            </Label>
          </div>

          {/* Event Name Input */}
          <Input
            placeholder='Event name, defaults to "message"'
            value={eventName}
            onChange={(e) => onEventNameChange(e.target.value)}
            className="h-7 w-52 text-[11px] rounded-md border-border/50 bg-background/50"
          />

          {/* Send Button */}
          <Button
            type="button"
            onClick={handleSend}
            disabled={!canSend}
            size="sm"
            className="h-7 px-4 text-[11px] font-semibold gap-1.5 rounded-md bg-linear-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/20 border border-indigo-500/20 transition-all duration-200"
          >
            Send
          </Button>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[400px] gap-0 p-0 overflow-hidden border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-base flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <IconDeviceFloppy className="size-4" />
              </span>
              Save Args
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground ml-9">
              Save this args configuration for quick access later.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="argsName"
                className="text-xs font-semibold text-foreground/80"
              >
                Name
              </Label>
              <Input
                id="argsName"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., Subscribe Payload"
                className="h-9 text-sm rounded-lg focus-visible:ring-indigo-500/30"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    confirmSave();
                  }
                }}
              />
            </div>

            <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
              <div className="text-[10px] text-muted-foreground space-y-1">
                <div>
                  <span className="font-semibold">Event:</span>{" "}
                  {eventName || "message"}
                </div>
                <div>
                  <span className="font-semibold">Args:</span> {args.length}
                </div>
                <div>
                  <span className="font-semibold">Ack:</span>{" "}
                  {ack ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 pt-2 gap-2 bg-muted/5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSaveDialog(false)}
              className="rounded-lg h-8 text-xs hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={confirmSave}
              disabled={!saveName?.trim()}
              className={cn(
                "rounded-lg h-8 text-xs font-medium gap-1.5 transition-all duration-200",
                "bg-linear-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500",
                "shadow-md shadow-indigo-500/20 border border-indigo-500/20",
              )}
            >
              <IconDeviceFloppy className="size-3.5" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SocketIOMessageComposer;
