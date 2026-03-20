import {
  IconBraces,
  IconCode,
  IconDeviceFloppy,
  IconFileText,
  IconSend,
  IconSparkles,
} from "@tabler/icons-react";
import hljs from "highlight.js";
import { useTheme } from "next-themes";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import Editor from "react-simple-code-editor";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AiGenerateButton } from "@/modules/ai/components/AiGenerateButton";

export type MessageFormat = "text" | "json";

interface WebSocketMessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string, format: MessageFormat) => void;
  onSave: (name: string, content: string, format: MessageFormat) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const WebSocketMessageComposer: React.FC<WebSocketMessageComposerProps> = ({
  value,
  onChange,
  onSend,
  onSave,
  disabled,
  placeholder: _placeholder = "Compose message...",
  className,
}) => {
  const [format, setFormat] = useState<MessageFormat>("text");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState("");
  const { resolvedTheme } = useTheme();

  // Derive JSON error state directly from value and format
  const jsonError = useMemo(() => {
    if (format !== "json" || !value?.trim()) {
      return null;
    }
    try {
      JSON.parse(value);
      return null;
    } catch (e) {
      if (e instanceof Error) {
        return e.message;
      }
      return "Invalid JSON";
    }
  }, [value, format]);

  const highlight = useCallback(
    (code: string) => {
      if (format === "json") {
        try {
          const result = hljs.highlight(code, { language: "json" });
          return result.value;
        } catch {
          return hljs.highlightAuto(code).value;
        }
      }
      return code;
    },
    [format],
  );

  // Handle format change
  const handleFormatChange = (newFormat: MessageFormat) => {
    setFormat(newFormat);
  };

  // Prettify JSON
  const handlePrettify = () => {
    if (!value?.trim()) {
      return;
    }
    try {
      const parsed = JSON.parse(value);
      const pretty = JSON.stringify(parsed, null, 2);
      onChange(pretty);
    } catch {
      // Error will be displayed by derived jsonError
    }
  };

  // Minify JSON
  const handleMinify = () => {
    if (!value?.trim()) {
      return;
    }
    try {
      const parsed = JSON.parse(value);
      const minified = JSON.stringify(parsed);
      onChange(minified);
    } catch {
      // Error will be displayed by derived jsonError
    }
  };

  // Handle text change
  const _handleChange = (text: string) => {
    onChange(text);
  };

  // Handle send
  const handleSend = () => {
    if (!value?.trim() || disabled) {
      return;
    }

    let messageToSend = value;

    // If JSON format, validate and optionally minify for sending
    if (format === "json") {
      try {
        const parsed = JSON.parse(value);
        messageToSend = JSON.stringify(parsed); // Minify for sending
      } catch {
        // Send as-is if not valid JSON
      }
    }

    onSend(messageToSend, format);
  };

  // Handle save
  const handleSave = () => {
    if (!value?.trim()) {
      return;
    }
    setShowSaveDialog(true);
    setSaveName("New Message");
  };

  const confirmSave = () => {
    if (!saveName?.trim()) {
      return;
    }
    onSave(saveName?.trim(), value, format);
    setShowSaveDialog(false);
    setSaveName("");
  };

  // Handle keyboard shortcut
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey) {
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
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 shrink-0">
          {/* Format Toggle */}
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/20">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleFormatChange("text")}
              className={cn(
                "h-7 px-3 text-[11px] font-medium gap-1.5 rounded-md transition-all duration-200",
                format === "text"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent",
              )}
            >
              <IconFileText className="size-3.5" />
              Text
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleFormatChange("json")}
              className={cn(
                "h-7 px-3 text-[11px] font-medium gap-1.5 rounded-md transition-all duration-200",
                format === "json"
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent",
              )}
            >
              <IconBraces className="size-3.5" />
              JSON
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <AiGenerateButton
              type="body"
              label="Generate Message"
              context={{
                description: "WebSocket message payload",
                existingValues: value,
              }}
              onGenerated={(data: unknown) => {
                handleFormatChange("json");
                onChange(JSON.stringify(data, null, 2));
              }}
            />

            {/* JSON Tools */}
            {format === "json" && (
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handlePrettify}
                        className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        disabled={!value?.trim()}
                      >
                        <IconSparkles className="size-3.5" />
                        <span className="sr-only">Prettify</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px]">
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
                        onClick={handleMinify}
                        className="h-7 w-7 p-0 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        disabled={!value?.trim()}
                      >
                        <IconCode className="size-3.5" />
                        <span className="sr-only">Minify</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-[10px]">
                      Minify
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0 relative group">
          <div
            className={cn(
              "h-full w-full relative rounded-lg transition-all duration-200",
              "ring-offset-background group-focus-within:ring-2 group-focus-within:ring-ring/20 group-focus-within:border-primary/50",
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
              value={value}
              onValueChange={onChange}
              highlight={highlight}
              padding={12}
              spellCheck={false}
              tabSize={4}
              style={{
                lineHeight: "1.5",
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                color: resolvedTheme === "dark" ? "#becad3ff" : "#45505eff",
                border: jsonError
                  ? resolvedTheme === "dark"
                    ? "1px solid #961838ff"
                    : "1px solid #f18199ff"
                  : resolvedTheme === "dark"
                    ? "1px solid #202327ff"
                    : "1px solid #dee6f0ff",
                borderRadius: "8px",
                height: "100%",
                minHeight: "100%",
              }}
              textareaClassName="focus:outline-none resize-none !text-xs !bg-transparent"
              preClassName={
                format === "json" ? "language-json !text-xs" : "!text-xs"
              }
              onKeyDown={handleKeyDown}
            />
          </div>
          {jsonError && (
            <div className="absolute bottom-3 left-3 bg-destructive/10 backdrop-blur-md border border-destructive/20 text-destructive text-[10px] px-2 py-1 rounded-md shadow-sm pointer-events-none animate-in fade-in slide-in-from-bottom-1">
              {jsonError}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 shrink-0 pt-1">
          <span className="text-[10px] text-muted-foreground/60 font-medium">
            <span className="inline-flex items-center gap-1 opacity-70">
              <IconSend className="size-3" />
              <kbd className="font-sans">Enter</kbd> to send
            </span>
          </span>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={!value?.trim() || (format === "json" && !!jsonError)}
              className="h-7 px-3 text-[11px] font-medium gap-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            >
              <IconDeviceFloppy className="size-3.5" />
              Save
            </Button>

            <Button
              type="button"
              onClick={handleSend}
              disabled={
                disabled || !value?.trim() || (format === "json" && !!jsonError)
              }
              size="sm"
              className="h-7 px-4 text-[11px] font-semibold gap-1.5 rounded-md bg-linear-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-500/20 border border-violet-500/20 transition-all duration-200"
            >
              <IconSend className="size-3.5" />
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[440px] gap-0 p-0 overflow-hidden border-violet-500/20 shadow-2xl shadow-violet-500/10">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="text-base flex items-center gap-2">
              <span className="p-1.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400">
                <IconDeviceFloppy className="size-4" />
              </span>
              Save Message
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground ml-9">
              Save this message to your collection for quick access later.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="messageName"
                className="text-xs font-semibold text-foreground/80"
              >
                Message Name
              </Label>
              <Input
                id="messageName"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="e.g., Subscribe Payload"
                className="h-9 text-sm rounded-lg focus-visible:ring-violet-500/30"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    confirmSave();
                  }
                }}
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground/80">
                Preview Content
              </span>
              <div
                className={cn(
                  "rounded-lg border border-border/50 bg-muted/30 overflow-hidden relative group",
                  "ring-offset-background transition-all duration-200",
                )}
              >
                <div className="h-[120px] w-full relative">
                  <Editor
                    value={value || ""}
                    onValueChange={() => {}} // Read-only
                    highlight={highlight}
                    padding={10}
                    spellCheck={false}
                    tabSize={4}
                    style={{
                      fontFamily:
                        'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                      fontSize: "11px",
                      backgroundColor: "transparent",
                      height: "100%",
                    }}
                    textareaClassName="!bg-transparent focus:outline-none cursor-default"
                    preClassName={
                      format === "json"
                        ? "language-json !bg-transparent"
                        : "!bg-transparent"
                    }
                    disabled
                  />
                  {!value && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground/50 italic">
                      (empty content)
                    </div>
                  )}
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
                "bg-linear-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500",
                "shadow-md shadow-violet-500/20 border border-violet-500/20",
              )}
            >
              <IconDeviceFloppy className="size-3.5" />
              Save Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WebSocketMessageComposer;
