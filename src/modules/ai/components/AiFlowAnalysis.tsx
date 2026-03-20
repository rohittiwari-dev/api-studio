"use client";

import { BrainCircuit, Loader2, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { isAiEnabled } from "@/modules/ai/store/ai.store";

interface AiFlowAnalysisProps {
  messages: any[];
  type: "websocket" | "socketio";
}

export function AiFlowAnalysis({ messages, type }: AiFlowAnalysisProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyse = useCallback(async () => {
    if (messages.length === 0) return;
    setAnalysis("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/analyse-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, type, prompt }),
      });

      if (!res.ok || !res.body) {
        const errorText = await res.text().catch(() => "");
        throw new Error(errorText || "Stream failed");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setAnalysis(accumulated);
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Analysis failed";
      setAnalysis(
        errMsg.toLowerCase().includes("quota") || errMsg.includes("429")
          ? "⚠️ **AI Quota Exceeded.** Please check your Gemini API plan and billing."
          : `Error: ${errMsg}`,
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages, type, prompt]);

  // Reset state when closing the dialog
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setAnalysis("");
      setPrompt("");
    }
  };

  if (!isAiEnabled()) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={messages.length === 0}
          className="h-7 px-3 gap-1.5 text-[11px] font-medium rounded-md border-violet-500/30 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all shadow-sm"
        >
          <Sparkles className="size-3" />
          Analyze Flow
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="p-4 border-b border-border/40 bg-muted/40 shrink-0">
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-md bg-violet-500/10 text-violet-500 border border-violet-500/20 shadow-sm shadow-violet-500/10">
              <BrainCircuit className="size-4" />
            </div>
            AI Flow Analysis
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground ml-10">
            Analyze {messages.length} real-time logs for RPC mapping,
            transaction blocks, or race conditions.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0">
          <div className="p-4 shrink-0 border-b border-border/40">
            <Textarea
              placeholder="What would you like to analyze? (e.g. 'Trace the RPC transaction IDs', 'Check for out-of-order race conditions', 'Why did auth fail?')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[60px] resize-y text-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isLoading) handleAnalyse();
                }
              }}
            />
            <div className="flex justify-end mt-3">
              <Button
                onClick={handleAnalyse}
                disabled={isLoading}
                size="sm"
                className="gap-1.5 h-8 text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20"
              >
                {isLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {analysis ? "Re-Analyze" : "Analyze Log Flow"}
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 bg-muted/10 p-4">
            {!analysis && !isLoading ? (
              <div className="h-40 flex flex-col items-center justify-center text-center gap-3">
                <BrainCircuit className="size-8 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">
                  Click 'Analyze' to generate an AI breakdown of your network
                  traffic.
                </p>
              </div>
            ) : (
              <div className="prose prose-xs dark:prose-invert max-w-none prose-pre:text-[10px] prose-pre:bg-muted/50 py-2">
                {isLoading && !analysis && (
                  <div className="flex items-center gap-2 text-sm text-violet-500/80">
                    <Loader2 className="size-4 animate-spin" />
                    Reviewing message payloads...
                  </div>
                )}
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
