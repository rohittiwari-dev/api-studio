"use client";

import { Bot, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { isAiEnabled } from "@/modules/ai/store/ai.store";

interface AiResponseAnalysisProps {
  response: {
    status: number;
    statusText: string;
    time: number;
    size: number;
    headers: Record<string, string>;
    body: string | unknown;
  } | null;
  request?: {
    method: string;
    url: string;
  };
}

export function AiResponseAnalysis({
  response,
  request,
}: AiResponseAnalysisProps) {
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyse = useCallback(async () => {
    if (!response) return;
    setAnalysis("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response, request }),
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
  }, [response, request]);

  if (!isAiEnabled()) return null;

  if (!response || response.status === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-12">
        <div className="size-12 rounded-xl bg-muted/50 border border-dashed border-border/50 flex items-center justify-center">
          <Bot className="size-5 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground">
          Send a request first to analyse the response
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-border/50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="size-3.5 text-violet-400" />
          <span>AI Analysis</span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={handleAnalyse}
          disabled={isLoading}
          className="h-7 px-3 gap-1.5 text-xs text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 border border-violet-500/20"
        >
          {isLoading && <Loader2 className="size-3 animate-spin" />}
          {!isLoading && analysis && <RefreshCw className="size-3" />}
          {!isLoading && !analysis && <Sparkles className="size-3" />}
          {isLoading && "Analysing..."}
          {!isLoading && analysis && "Re-analyse"}
          {!isLoading && !analysis && "Analyse Response"}
        </Button>
      </div>

      {/* Analysis content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4">
          {!analysis && !isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <div className="size-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Sparkles className="size-5 text-violet-400" />
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Click <strong>Analyse Response</strong> to get an AI-powered
                breakdown of the status, headers, body, and any issues.
              </p>
            </div>
          )}

          {isLoading && !analysis && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-violet-400" />
              Analysing your response...
            </div>
          )}

          {analysis && (
            <div className="prose prose-xs! dark:prose-invert max-w-none prose-pre:text-[10px]! prose-pre:bg-muted/50 prose-headings:text-sm prose-headings:font-semibold prose-headings:mb-2 prose-p:text-xs prose-p:leading-snug prose-p:text-foreground/80 prose-li:text-xs prose-strong:text-foreground prose-a:text-xs">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
