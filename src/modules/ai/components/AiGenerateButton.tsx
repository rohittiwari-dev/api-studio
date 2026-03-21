"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  isAiEnabled,
  isWorkspaceAiConfigured,
} from "@/modules/ai/store/ai.store";
import useWorkspaceState from "@/modules/workspace/store";

interface AiGenerateButtonProps {
  type:
    | "params"
    | "headers"
    | "body"
    | "body_formdata"
    | "saved_messages_websocket"
    | "saved_messages_socketio";
  context: {
    url?: string;
    method?: string;
    description?: string;
    existingValues?: unknown;
  };
  onGenerated: (data: unknown) => void;
  className?: string;
  label?: string;
}

export function AiGenerateButton({
  type,
  context,
  onGenerated,
  className,
  label,
}: AiGenerateButtonProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const { activeWorkspace } = useWorkspaceState();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const payloadContext = {
        ...context,
        description: prompt.trim() || undefined,
      };
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          context: payloadContext,
          workspaceId: activeWorkspace?.id,
        }),
      });

      if (!res.ok) {
        let errMsg = `AI generation failed: ${res.status}`;
        try {
          const errData = (await res.json()) as { error?: string };
          if (errData?.error) errMsg = errData.error;
        } catch {}
        throw new Error(errMsg);
      }

      const json = (await res.json()) as { success: boolean; data: unknown };
      if (json.success) {
        onGenerated(json.data);
        setPrompt("");
        setOpen(false);
        toast.success("AI generated successfully");
      } else {
        throw new Error("Generation failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!isAiEnabled()) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-7 px-2 gap-1.5 text-xs font-medium",
            "text-violet-500 hover:text-violet-400 hover:bg-violet-500/10",
            "border border-violet-500/20 hover:border-violet-500/30",
            "transition-all duration-200",
            className,
          )}
        >
          <Sparkles className="size-3" />
          {label ?? `Generate ${type}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] p-3 shadow-xl">
        {!isWorkspaceAiConfigured(activeWorkspace) ? (
          <div className="py-2 flex flex-col items-center justify-center text-center gap-2">
            <div className="size-8 rounded-full bg-orange-500/10 flex items-center justify-center mb-1">
              <Sparkles className="size-4 text-orange-500" />
            </div>
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">
              AI Not Configured
            </p>
            <p className="text-[11px] text-muted-foreground">
              Go to Workspace Settings to add your API key.
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-[10px] mt-2 w-full"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="text-sm font-medium flex items-center gap-1.5 text-foreground">
                <Sparkles className="size-3.5 text-violet-500" />
                Describe Requirements
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                What exactly should the AI generate? Provide required parameter
                names or specific configuration details.
              </p>
            </div>

            <Textarea
              placeholder={
                (type === "params" &&
                  "e.g. Add pagination like limit and offset...") ||
                (type === "headers" &&
                  "e.g. Include bearer auth and content-type...") ||
                "e.g. A JSON body with user profile info..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[70px] resize-none text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={loading}
                onClick={handleGenerate}
                className="h-7 text-xs bg-violet-600 hover:bg-violet-700 text-white"
              >
                {loading ? (
                  <Loader2 className="size-3 animate-spin mr-1.5" />
                ) : (
                  <Sparkles className="size-3 mr-1.5" />
                )}
                Generate
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
