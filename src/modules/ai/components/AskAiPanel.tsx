"use client";

import { Bot, Loader2, RotateCcw, Send, Sparkles, Zap } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import useAiStore from "@/modules/ai/store/ai.store";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPTS = [
  "How do I add Bearer auth?",
  "What does a 401 response mean?",
  "How to send JSON in request body?",
  "How do I test a multipart file upload?",
  "What headers should I include for API calls?",
];

export function AskAiPanel() {
  const { isAiPanelOpen, setAiPanelOpen } = useAiStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: "user",
        content: text,
      };
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setIsLoading(true);

      abortRef.current?.abort();
      abortRef.current = new AbortController();

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortRef.current.signal,
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
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: accumulated } : m,
            ),
          );
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          const errMsg = (err as Error).message;
          const displayMsg =
            errMsg.toLowerCase().includes("quota") || errMsg.includes("429")
              ? "⚠️ AI Quota Exceeded. Please check your Gemini API plan and billing."
              : `Sorry, something went wrong: ${errMsg.slice(0, 100)}`;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: displayMsg } : m,
            ),
          );
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <Sheet open={isAiPanelOpen} onOpenChange={setAiPanelOpen}>
      <SheetContent
        side="right"
        className="w-[520px] sm:w-[580px] min-w-[600px] p-0 flex flex-col bg-background border-l border-border/50"
      >
        {/* Header */}
        <SheetHeader className="shrink-0 px-4 py-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
              <div className="size-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Sparkles className="size-3.5 text-violet-400" />
              </div>
              Ask AI
            </SheetTitle>
            <SheetDescription className="hidden">
              Chat with the API Studio AI assistant.
            </SheetDescription>
            <div className="flex pr-10 items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setMessages([])}
                  title="Clear conversation"
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 scroll-smooth">
          <div className="py-4 flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center text-center gap-4 py-8">
                <div className="size-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Bot className="size-6 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">How can I help?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ask anything about API testing, request structure, or
                    debugging.
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setInput(prompt)}
                      className="text-left text-xs px-3 py-2 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/60 hover:border-violet-500/30 transition-all duration-150 text-foreground/80"
                    >
                      <Zap className="size-3 inline-block mr-1.5 text-violet-400" />
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex gap-2.5",
                    msg.role === "user" ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div
                    className={cn(
                      "size-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5",
                      msg.role === "user"
                        ? "bg-primary/20 text-primary"
                        : "bg-violet-500/10 border border-violet-500/20",
                    )}
                  >
                    {msg.role === "user" ? (
                      "U"
                    ) : (
                      <Sparkles className="size-3 text-violet-400" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm max-w-[85%]",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 border border-border/40",
                    )}
                  >
                    {msg.role === "user" ? (
                      <p className="text-sm whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    ) : (
                      <div className="prose whitespace-pre-wrap wrap-anywhere prose-sm dark:prose-invert max-w-none prose-pre:text-xs prose-p:text-sm prose-p:leading-relaxed">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin text-violet-400" />
                Thinking...
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="shrink-0 px-4 py-3 border-t border-border/50 bg-muted/10"
        >
          <div className="flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about APIs..."
              className="min-h-[40px] max-h-[120px] resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="size-10 shrink-0 bg-violet-600 hover:bg-violet-700"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground/50 mt-1.5 text-center">
            Enter to send · Shift+Enter for new line
          </p>
        </form>
      </SheetContent>
    </Sheet>
  );
}
