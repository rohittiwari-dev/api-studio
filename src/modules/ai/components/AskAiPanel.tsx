"use client";

import { useChat } from "@ai-sdk/react";
import { createId } from "@paralleldrive/cuid2";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import {
  Bot,
  CheckCircle2,
  Cookie,
  Globe,
  Loader2,
  Plus,
  RotateCcw,
  Send,
  Settings,
  Sparkles,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
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
import useAiStore, {
  isWorkspaceAiConfigured,
} from "@/modules/ai/store/ai.store";
import useCookieStore from "@/modules/apis/cookies/store/cookie.store";
import { updateEnvironmentAction } from "@/modules/apis/environment/actions";
import useEnvironmentStore from "@/modules/apis/environment/store/environment.store";
import useRequestSyncStoreState from "@/modules/apis/requests/hooks/requestSyncStore";
import useRequestStore from "@/modules/apis/requests/store/request.store";
import useWorkspaceState from "@/modules/workspace/store";

// ─── Quick prompts ────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  "Create a GET request to https://api.github.com/users/octocat",
  "How do I add Bearer token auth?",
  "What does a 401 response mean?",
  "Create an environment variable BASE_URL=https://api.example.com",
  "Create a session cookie for domain api.example.com",
];

// ─── Tool icon/label meta ─────────────────────────────────────────────────

const TOOL_META: Record<
  string,
  { icon: React.ElementType; label: string; color: string; doneLabel: string }
> = {
  createRequest: {
    icon: Plus,
    label: "Creating request…",
    color: "text-blue-400",
    doneLabel: "Request created",
  },
  updateRequestParams: {
    icon: Settings,
    label: "Updating request params…",
    color: "text-amber-400",
    doneLabel: "Params updated",
  },
  createEnvironmentVariable: {
    icon: Globe,
    label: "Creating environment variable…",
    color: "text-green-400",
    doneLabel: "Variable created",
  },
  createCookie: {
    icon: Cookie,
    label: "Creating cookie…",
    color: "text-orange-400",
    doneLabel: "Cookie created",
  },
  analyzeRequest: {
    icon: Sparkles,
    label: "Analyzing request…",
    color: "text-violet-400",
    doneLabel: "Analysis complete",
  },
};

// ─── Component ────────────────────────────────────────────────────────────

export function AskAiPanel() {
  const { isAiPanelOpen, setAiPanelOpen } = useAiStore();
  const { activeWorkspace } = useWorkspaceState();
  const { activeRequest } = useRequestSyncStoreState();
  const [input, setInput] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, addToolOutput, status, setMessages } = useChat(
    {
      transport: new DefaultChatTransport({
        api: "/api/ai/chat",
        body: {
          workspaceId: activeWorkspace?.id,
          activeRequestId: activeRequest?.id,
        },
      }),

      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

      onError: (err: Error) => {
        const isQuota =
          err.message?.toLowerCase().includes("quota") ||
          err.message?.includes("429");
        toast.error(
          isQuota
            ? "AI Quota Exceeded — check your Gemini API plan."
            : "Something went wrong with the AI.",
        );
      },

      onToolCall: async ({ toolCall }) => {
        // Must check dynamic first for type narrowing
        if (toolCall.dynamic) return;

        const name = toolCall.toolName;
        const args = toolCall.input as Record<string, any>;

        // ── createRequest ────────────────────────────────────────────
        if (name === "createRequest") {
          if (!activeWorkspace?.id) {
            addToolOutput({
              tool: "createRequest",
              toolCallId: toolCall.toolCallId,
              output: "Error: no active workspace.",
            });
            toast.error("No active workspace — open one first.");
            return;
          }
          const tempId = createId();
          useRequestStore.getState().upsertRequest({
            id: tempId,
            name: args.name || "AI Request",
            url: args.url || "",
            type: args.type || "API",
            method: args.method || "GET",
            workspaceId: activeWorkspace.id,
            collectionId: null,
            headers: (args.headers || []).map((h: any) => ({
              ...h,
              isActive: h.isActive ?? true,
            })),
            parameters: (args.parameters || []).map((p: any) => ({
              ...p,
              isActive: p.isActive ?? true,
            })),
            body: {
              raw: args.bodyContent || "",
              formData: [],
              urlEncoded: [],
              file: null,
              json: null,
            },
            auth: { type: "NONE" },
            bodyType: args.bodyType || "NONE",
            savedMessages: [],
            unsaved: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            sortOrder: 0,
          } as any);
          toast.success(`✅ Request "${args.name}" created!`);
          addToolOutput({
            tool: "createRequest",
            toolCallId: toolCall.toolCallId,
            output: `Request "${args.name}" (${args.type}, ${args.method || "—"}) created successfully in workspace.`,
          });
          return;
        }

        // ── updateRequestParams ──────────────────────────────────────
        if (name === "updateRequestParams") {
          const targetId = args.requestId;
          if (!targetId) {
            addToolOutput({
              tool: "updateRequestParams",
              toolCallId: toolCall.toolCallId,
              output: "Error: no request selected.",
            });
            toast.error("No request selected — open a request first.");
            return;
          }
          const store = useRequestStore.getState();
          const existing = store.requests[targetId];
          if (!existing) {
            addToolOutput({
              tool: "updateRequestParams",
              toolCallId: toolCall.toolCallId,
              output: "Error: request not found.",
            });
            toast.error("Request not found in the workspace.");
            return;
          }
          const newHeaders = (args.headers || []).map((h: any) => ({
            ...h,
            isActive: true,
          }));
          const newParams = (args.parameters || []).map((p: any) => ({
            ...p,
            isActive: true,
          }));
          store.updateRequest(targetId, {
            headers: [...(existing.headers || []), ...newHeaders],
            parameters: [...(existing.parameters || []), ...newParams],
          });
          toast.success(
            `✅ Updated "${existing.name}" with ${newHeaders.length} headers, ${newParams.length} params.`,
          );
          addToolOutput({
            tool: "updateRequestParams",
            toolCallId: toolCall.toolCallId,
            output: `Added ${newHeaders.length} header(s) and ${newParams.length} param(s) to "${existing.name}".`,
          });
          return;
        }

        // ── createEnvironmentVariable ────────────────────────────────
        if (name === "createEnvironmentVariable") {
          const store = useEnvironmentStore.getState();
          const activeEnv = store.getActiveEnvironment();

          if (!activeEnv) {
            toast.error(
              "No active environment found. Please create or select one first.",
            );
            addToolOutput({
              tool: "createEnvironmentVariable",
              toolCallId: toolCall.toolCallId,
              output:
                "Error: no active environment. Tell the user to create or select an environment first.",
            });
            return;
          }

          const newVar = {
            key: args.key,
            value: args.value,
            type: args.type || "default",
            enabled: true,
          };

          const updatedVariables = [...activeEnv.variables, newVar];

          store.updateEnvironment(activeEnv.id, {
            variables: updatedVariables,
          });

          updateEnvironmentAction(activeEnv.id, {
            variables: updatedVariables as any,
          }).catch((err) => {
            console.error("Failed to sync environment variable to DB", err);
            toast.error("Variable added locally but failed to save to DB.");
          });

          toast.success(
            `✅ Variable "${args.key}" added to environment "${activeEnv.name}".`,
          );
          addToolOutput({
            tool: "createEnvironmentVariable",
            toolCallId: toolCall.toolCallId,
            output: `Variable "${args.key}" created and saved successfully to environment "${activeEnv.name}".`,
          });
          return;
        }

        // ── createCookie ─────────────────────────────────────────────
        if (name === "createCookie") {
          useCookieStore.getState().addCookie({
            key: args.name,
            value: args.value,
            domain: args.domain,
            path: args.path || "/",
            secure: args.secure || false,
          });

          toast.success(
            `✅ Cookie "${args.name}" for ${args.domain} saved to Cookie Manager.`,
            { duration: 6000 },
          );
          addToolOutput({
            tool: "createCookie",
            toolCallId: toolCall.toolCallId,
            output: `Cookie "${args.name}" successfully created and saved for domain ${args.domain}.`,
          });
          return;
        }
      },
    },
  );

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (messages.length)
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <Sheet open={isAiPanelOpen} onOpenChange={setAiPanelOpen}>
      <SheetContent
        side="right"
        className="w-[520px] sm:w-[580px] min-w-[600px] p-0 flex flex-col bg-background border-l border-border/50"
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <SheetHeader className="shrink-0 px-4 py-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
              <div className="size-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                <Sparkles className="size-3.5 text-violet-400" />
              </div>
              Ask AI
              {activeRequest && (
                <span className="text-[10px] font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/50">
                  {activeRequest.method && (
                    <span className="text-violet-400 mr-1">
                      {activeRequest.method}
                    </span>
                  )}
                  {activeRequest.name || "Untitled"}
                </span>
              )}
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

        {/* ── Messages ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-4 scroll-smooth">
          <div className="py-4 flex flex-col gap-3">
            {/* Welcome state */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center text-center gap-4 py-8">
                <div className="size-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Bot className="size-6 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">How can I help?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    I can create requests, set environment variables, manage
                    cookies, and analyze your existing requests.
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
            )}

            {/* Message list — render via msg.parts (ai v6) */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                {/* Avatar */}
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

                {/* Bubble */}
                <div
                  className={cn(
                    "flex flex-col gap-1.5 rounded-xl px-3 py-2 text-sm max-w-[85%] overflow-hidden",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 border border-border/40",
                  )}
                >
                  {msg.parts.map((part, i) => {
                    // Text part
                    if (part.type === "text") {
                      if (msg.role === "user") {
                        return (
                          <p
                            key={i?.toString()}
                            className="text-sm whitespace-pre-wrap"
                          >
                            {part.text}
                          </p>
                        );
                      }
                      return (
                        <div
                          key={i?.toString()}
                          className="prose whitespace-pre-wrap wrap-anywhere prose-sm dark:prose-invert max-w-none prose-pre:text-xs prose-p:text-sm prose-p:leading-relaxed prose-p:my-0.5"
                        >
                          <ReactMarkdown>{part.text}</ReactMarkdown>
                        </div>
                      );
                    }

                    // Tool parts (any tool-* type)
                    if (part.type.startsWith("tool-")) {
                      const toolName =
                        ((part as any).toolName as string) ??
                        part.type.replace("tool-", "");
                      const state = (part as any).state as string;
                      const meta = TOOL_META[toolName];
                      const Icon = meta?.icon ?? Zap;
                      const isDone =
                        state === "output-available" ||
                        state === "output-error";
                      const isError = state === "output-error";

                      return (
                        <div
                          key={i?.toString()}
                          className={cn(
                            "flex items-center gap-2 px-2 py-1.5 rounded-lg border text-xs",
                            isError
                              ? "border-red-500/20 bg-red-500/5 text-red-400"
                              : isDone
                                ? "border-green-500/20 bg-green-500/5 text-green-400"
                                : "border-border/50 bg-background/50 text-muted-foreground",
                          )}
                        >
                          {isDone && !isError ? (
                            <CheckCircle2 className="size-3 shrink-0 text-green-400" />
                          ) : (
                            <Icon
                              className={cn(
                                "size-3 shrink-0",
                                isDone ? "" : "animate-pulse",
                                meta?.color ?? "text-violet-400",
                              )}
                            />
                          )}
                          <span className="font-mono">
                            {isError
                              ? `${meta?.doneLabel ?? toolName} — error`
                              : isDone
                                ? (meta?.doneLabel ?? toolName)
                                : (meta?.label ?? `${toolName}…`)}
                          </span>
                        </div>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            ))}

            {/* Thinking indicator */}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pl-8">
                <Loader2 className="size-3.5 animate-spin text-violet-400" />
                Thinking…
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── Input ───────────────────────────────────────────────────── */}
        {!isWorkspaceAiConfigured(activeWorkspace) ? (
          <div className="shrink-0 p-4 border-t border-border/50 bg-orange-500/5 flex flex-col items-center justify-center text-center gap-2">
            <Settings className="size-5 text-orange-500" />
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              AI Features are Disabled or Not Configured
            </p>
            <p className="text-[11px] text-muted-foreground/80 max-w-[250px]">
              Head to <b>Workspace Settings</b> &gt; <b>AI Configuration</b> to
              provide your API Key and enable these tools.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="shrink-0 px-4 py-3 border-t border-border/50 bg-muted/10"
          >
            <div className="flex gap-2 items-end">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about APIs, or say 'create a request'…"
                className="min-h-[40px] max-h-[120px] resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
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
        )}
      </SheetContent>
    </Sheet>
  );
}
