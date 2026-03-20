"use client";

import { HTTPSnippet } from "httpsnippet";
import {
  AlertCircle,
  Braces,
  Code2,
  Coffee,
  Cpu,
  FileCode,
  FileJson,
  Gem,
  Hash,
  Loader2,
  Search,
  Server,
  Sparkles,
  Terminal,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { CodeEditor } from "@/components/ui/code-editor";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BodyType } from "@/generated/prisma/browser";
import { cn } from "@/lib/utils";
import { substituteVariables } from "@/lib/utils/substituteVariables";
import useEnvironmentStore from "@/modules/apis/environment/store/environment.store";
import useRequestSyncStoreState from "@/modules/apis/requests/hooks/requestSyncStore";

// --- Types & Data ---

type SnippetClient = {
  key: string;
  label: string;
  targetId: string;
};

type SnippetGroup = {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string; // Tailwind color class for accent
  clients: SnippetClient[];
};

const GROUPS: SnippetGroup[] = [
  {
    id: "shell",
    label: "Shell",
    icon: Terminal,
    color: "emerald",
    clients: [
      { key: "curl", label: "cURL", targetId: "shell" },
      { key: "httpie", label: "HTTPie", targetId: "shell" },
      { key: "wget", label: "Wget", targetId: "shell" },
    ],
  },
  {
    id: "javascript",
    label: "JavaScript",
    icon: FileJson,
    color: "yellow",
    clients: [
      { key: "fetch", label: "Fetch", targetId: "javascript" },
      { key: "axios", label: "Axios", targetId: "javascript" },
      { key: "jquery", label: "jQuery", targetId: "javascript" },
      { key: "xhr", label: "XHR", targetId: "javascript" },
    ],
  },
  {
    id: "node",
    label: "Node.js",
    icon: Server,
    color: "green",
    clients: [
      { key: "fetch", label: "Fetch", targetId: "node" },
      { key: "axios", label: "Axios", targetId: "node" },
      { key: "native", label: "Native", targetId: "node" },
    ],
  },
  {
    id: "python",
    label: "Python",
    icon: Braces,
    color: "blue",
    clients: [
      { key: "requests", label: "Requests", targetId: "python" },
      { key: "python3", label: "http.client", targetId: "python" },
    ],
  },
  {
    id: "go",
    label: "Go",
    icon: Cpu,
    color: "cyan",
    clients: [{ key: "native", label: "Native", targetId: "go" }],
  },
  {
    id: "java",
    label: "Java",
    icon: Coffee,
    color: "orange",
    clients: [
      { key: "okhttp", label: "OkHttp", targetId: "java" },
      { key: "unirest", label: "Unirest", targetId: "java" },
    ],
  },
  {
    id: "php",
    label: "PHP",
    icon: FileCode,
    color: "indigo",
    clients: [
      { key: "curl", label: "cURL", targetId: "php" },
      { key: "guzzle", label: "Guzzle", targetId: "php" },
    ],
  },
  {
    id: "csharp",
    label: "C#",
    icon: Hash,
    color: "purple",
    clients: [
      { key: "httpclient", label: "HttpClient", targetId: "csharp" },
      { key: "restsharp", label: "RestSharp", targetId: "csharp" },
    ],
  },
  {
    id: "ruby",
    label: "Ruby",
    icon: Gem,
    color: "red",
    clients: [{ key: "native", label: "Net::HTTP", targetId: "ruby" }],
  },
];

// Shiki language mapping
const SHIKI_LANG_MAP: Record<string, string> = {
  shell: "bash",
  javascript: "javascript",
  node: "javascript",
  python: "python",
  php: "php",
  java: "java",
  csharp: "csharp",
  go: "go",
  ruby: "ruby",
};

// Color utility
const getColorClasses = (color: string, _isActive: boolean) => {
  const colorMap: Record<
    string,
    { bg: string; text: string; border: string; glow: string }
  > = {
    emerald: {
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      border: "border-emerald-500/30",
      glow: "shadow-emerald-500/20",
    },
    yellow: {
      bg: "bg-yellow-500/15",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
      glow: "shadow-yellow-500/20",
    },
    green: {
      bg: "bg-green-500/15",
      text: "text-green-400",
      border: "border-green-500/30",
      glow: "shadow-green-500/20",
    },
    blue: {
      bg: "bg-blue-500/15",
      text: "text-blue-400",
      border: "border-blue-500/30",
      glow: "shadow-blue-500/20",
    },
    cyan: {
      bg: "bg-cyan-500/15",
      text: "text-cyan-400",
      border: "border-cyan-500/30",
      glow: "shadow-cyan-500/20",
    },
    orange: {
      bg: "bg-orange-500/15",
      text: "text-orange-400",
      border: "border-orange-500/30",
      glow: "shadow-orange-500/20",
    },
    indigo: {
      bg: "bg-indigo-500/15",
      text: "text-indigo-400",
      border: "border-indigo-500/30",
      glow: "shadow-indigo-500/20",
    },
    purple: {
      bg: "bg-purple-500/15",
      text: "text-purple-400",
      border: "border-purple-500/30",
      glow: "shadow-purple-500/20",
    },
    red: {
      bg: "bg-red-500/15",
      text: "text-red-400",
      border: "border-red-500/30",
      glow: "shadow-red-500/20",
    },
  };
  return colorMap[color] || colorMap.blue;
};

// --- Component ---

const CodeSnippetPanel = () => {
  // State
  const [activeGroupId, setActiveGroupId] = useState("shell");
  const [activeClientKey, setActiveClientKey] = useState("curl");
  const [searchQuery, setSearchQuery] = useState("");

  // Current Selection
  const activeGroup = GROUPS.find((g) => g.id === activeGroupId) || GROUPS[0];
  const activeClient =
    activeGroup.clients.find((c) => c.key === activeClientKey) ||
    activeGroup.clients[0];

  // Filtered groups
  const filteredGroups = searchQuery
    ? GROUPS.filter(
        (g) =>
          g.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          g.clients.some((c) =>
            c.label.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      )
    : GROUPS;

  // Logic State
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hooks
  const { activeRequest } = useRequestSyncStoreState();
  const { getVariablesAsRecord } = useEnvironmentStore();

  // Update active client when group changes if current client not in new group
  useEffect(() => {
    const clientExists = activeGroup.clients.find(
      (c) => c.key === activeClientKey,
    );
    if (!clientExists) {
      setActiveClientKey(activeGroup.clients[0].key);
    }
  }, [activeGroup, activeClientKey]);

  // Generate Snippet
  useEffect(() => {
    const generate = async () => {
      if (!activeRequest?.url) {
        setGeneratedCode("");
        return;
      }

      setIsGenerating(true);
      setError(null);

      try {
        const envVariables = getVariablesAsRecord();
        const finalUrl = substituteVariables(
          activeRequest.url || "",
          envVariables,
        );

        let urlObj: URL;
        try {
          urlObj = new URL(finalUrl);
        } catch {
          try {
            urlObj = new URL(`http://${finalUrl}`);
          } catch {
            throw new Error("Invalid URL");
          }
        }

        activeRequest.parameters
          ?.filter((p) => p.isActive && p.key)
          .forEach((p) => {
            urlObj.searchParams.append(
              substituteVariables(p.key, envVariables),
              substituteVariables(p.value, envVariables),
            );
          });

        const headers: Array<{ name: string; value: string }> = [];
        activeRequest.headers?.forEach((h) => {
          if (h.isActive && h.key) {
            headers.push({
              name: substituteVariables(h.key, envVariables),
              value: substituteVariables(h.value, envVariables),
            });
          }
        });

        // Auth headers
        if (
          activeRequest.auth?.type &&
          activeRequest.auth.type !== "NONE" &&
          activeRequest.auth.data
        ) {
          const authData = activeRequest.auth.data as Record<string, string>;
          switch (activeRequest.auth.type) {
            case "BEARER":
              if (authData.token) {
                headers.push({
                  name: "Authorization",
                  value: `Bearer ${substituteVariables(
                    authData.token,
                    envVariables,
                  )}`,
                });
              }
              break;
            case "BASIC":
              if (authData.username && authData.password) {
                const creds = btoa(
                  `${substituteVariables(
                    authData.username,
                    envVariables,
                  )}:${substituteVariables(authData.password, envVariables)}`,
                );
                headers.push({
                  name: "Authorization",
                  value: `Basic ${creds}`,
                });
              }
              break;
            case "API_KEY":
              if (authData.key && authData.value) {
                const k = substituteVariables(authData.key, envVariables);
                const v = substituteVariables(authData.value, envVariables);
                if (authData.addTo === "header") {
                  headers.push({ name: k, value: v });
                } else {
                  urlObj.searchParams.append(k, v);
                }
              }
              break;
          }
        }

        // Body
        let postData: any = {
          mimeType: "application/json",
        };
        if (
          activeRequest.bodyType === BodyType.JSON &&
          activeRequest.body?.json
        ) {
          postData = {
            mimeType: "application/json",
            text: JSON.stringify(activeRequest.body.json, null, 2),
          };
          if (!headers.find((h) => h.name.toLowerCase() === "content-type")) {
            headers.push({
              name: "Content-Type",
              value: "application/json",
            });
          }
        } else if (
          activeRequest.bodyType === BodyType.RAW &&
          activeRequest.body?.raw
        ) {
          postData = {
            mimeType: "text/plain",
            text: substituteVariables(activeRequest.body.raw, envVariables),
          };
        } else if (
          activeRequest.bodyType === BodyType.X_WWW_FORM_URLENCODED &&
          activeRequest.body?.urlEncoded
        ) {
          const params = activeRequest.body.urlEncoded
            .filter((p) => p.isActive && p.key)
            .map((p) => ({
              name: substituteVariables(p.key, envVariables),
              value: substituteVariables(p.value, envVariables),
            }));
          if (params.length) {
            postData = {
              mimeType: "application/x-www-form-urlencoded",
              params,
            };
          }
        }

        const har = {
          method: activeRequest.method || "GET",
          url: urlObj.toString(),
          httpVersion: "HTTP/1.1",
          headers,
          queryString: [],
          cookies: [],
          headersSize: -1,
          bodySize: -1,
          postData,
        };

        const snippet = new HTTPSnippet(har);
        const codeArray = await snippet.convert(
          activeClient.targetId as any,
          activeClient.key as any,
        );
        const code = Array.isArray(codeArray) ? codeArray[0] : codeArray;

        if (!code) {
          throw new Error("No code generated");
        }
        setGeneratedCode(code);
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Failed to generate code");
        setGeneratedCode("");
      } finally {
        setIsGenerating(false);
      }
    };

    generate();
  }, [activeRequest, activeClient, getVariablesAsRecord]);

  const colorClasses = getColorClasses(activeGroup.color, true);

  return (
    <div className="flex w-full h-full overflow-hidden bg-linear-to-br from-background via-background to-muted/20">
      {/* --- Sidebar --- */}
      <div className="w-[240px] h-full shrink-0 border-r border-border/40 bg-muted/10 backdrop-blur-sm flex flex-col">
        {/* Search */}
        <div className="p-3 border-b  border-border/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
            <Input
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs bg-background/60 border-border/40 focus:border-primary/50 rounded-lg"
            />
          </div>
        </div>

        {/* Language List */}
        <ScrollArea className="flex-1 overflow-y-auto">
          <div className="flex flex-col p-2 gap-0.5  h-fit">
            {filteredGroups.map((group) => {
              const Icon = group.icon;
              const isActive = activeGroupId === group.id;
              const colors = getColorClasses(group.color, isActive);

              return (
                <button
                  type="button"
                  key={group.id}
                  onClick={() => setActiveGroupId(group.id)}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
                    "hover:bg-muted/60",
                    isActive && [
                      colors.bg,
                      "border",
                      colors.border,
                      "shadow-lg",
                      colors.glow,
                    ],
                  )}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center size-7 rounded-md transition-all",
                      isActive
                        ? [colors.bg, colors.text]
                        : "bg-muted/50 text-muted-foreground group-hover:bg-muted",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <span
                    className={cn(
                      "flex-1 text-left font-medium transition-colors",
                      isActive
                        ? colors.text
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {group.label}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-mono px-1.5 py-0.5 rounded transition-all",
                      isActive
                        ? [colors.bg, colors.text]
                        : "bg-muted/30 text-muted-foreground/60",
                    )}
                  >
                    {group.clients.length}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border/30 bg-muted/5">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60">
            <Sparkles className="size-3" />
            <span>Powered by HTTPSnippet</span>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1 bg-background/30 backdrop-blur-3xl flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            {/* Active Language Badge */}
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold",
                colorClasses.bg,
                colorClasses.text,
                "border",
                colorClasses.border,
              )}
            >
              {React.createElement(activeGroup.icon, {
                className: "size-3",
              })}
              {activeGroup.label}
            </div>

            {/* Client Tabs */}
            <Tabs value={activeClientKey} onValueChange={setActiveClientKey}>
              <TabsList className="bg-muted/40 p-1 h-9 gap-0.5 rounded-lg border border-border/30">
                {activeGroup.clients.map((client) => (
                  <TabsTrigger
                    key={client.key}
                    value={client.key}
                    className={cn(
                      "h-7 text-xs px-3 rounded-md transition-all",
                      "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                      "data-[state=active]:border data-[state=active]:border-border/50",
                    )}
                  >
                    {client.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Right side info */}
          {generatedCode && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="font-mono">
                {generatedCode.split("\n").length} lines
              </span>
              <span
                className={cn(
                  "px-2 py-1 rounded-md",
                  colorClasses.bg,
                  colorClasses.text,
                  "font-medium",
                )}
              >
                {SHIKI_LANG_MAP[activeGroup.id] || "text"}
              </span>
            </div>
          )}
        </div>

        {/* Code View */}
        <div className="flex-1 relative min-h-0 bg-zinc-950/50 dark:bg-zinc-950/70">
          {!activeRequest?.url ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-muted/5 border border-border/20">
                <div className={cn("p-4 rounded-xl", colorClasses.bg)}>
                  <Code2 className={cn("size-8", colorClasses.text)} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground/80">
                    Valid Endpoint Required
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a URL in your request to generate code
                  </p>
                </div>
              </div>
            </div>
          ) : isGenerating ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    "p-3 rounded-xl animate-pulse",
                    colorClasses.bg,
                  )}
                >
                  <Loader2
                    className={cn("size-6 animate-spin", colorClasses.text)}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  Generating snippet...
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-destructive/5 border border-destructive/20">
                <div className="p-4 rounded-xl bg-destructive/10">
                  <AlertCircle className="size-8 text-destructive" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-destructive">
                    Generation Failed
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <CodeEditor
              lang={SHIKI_LANG_MAP[activeGroup.id] || "text"}
              copyButton={true}
              header={false}
              writing={false}
              className="w-full h-full rounded-none border-none "
              contentClassName="p-6"
            >
              {generatedCode}
            </CodeEditor>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeSnippetPanel;
