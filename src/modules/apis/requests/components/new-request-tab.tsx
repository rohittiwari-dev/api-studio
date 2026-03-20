import { createId } from "@paralleldrive/cuid2";
import { ArrowRight, Code2, Sparkles } from "lucide-react";
import { IconSocketIO, IconWebSocket } from "@/assets/app-icons";
import { cn } from "@/lib/utils";
import useWorkspaceState from "@/modules/workspace/store";
import useRequestSyncStoreState from "../hooks/requestSyncStore";

const requestTypes = [
  {
    type: "API" as const,
    title: "HTTP Request",
    description: "REST API, or any HTTP endpoint",
    icon: Code2,
    gradient: "from-violet-500/10 via-purple-500/5 to-fuchsia-500/10",
    iconBg: "bg-violet-500/10 border-violet-500/20",
    iconColor: "text-violet-500",
    hoverBorder: "hover:border-violet-500/40",
    accentColor: "group-hover:text-violet-500",
  },
  {
    type: "WEBSOCKET" as const,
    title: "WebSocket",
    description: "Real-time bidirectional communication",
    icon: IconWebSocket,
    gradient: "from-emerald-500/10 via-teal-500/5 to-cyan-500/10",
    iconBg: "bg-emerald-500/10 border-emerald-500/20",
    iconColor: "text-emerald-500",
    hoverBorder: "hover:border-emerald-500/40",
    accentColor: "group-hover:text-emerald-500",
  },
  {
    type: "SOCKET_IO" as const,
    title: "Socket.IO",
    description: "Event-driven real-time engine",
    icon: IconSocketIO,
    gradient: "from-amber-500/10 via-orange-500/5 to-yellow-500/10",
    iconBg: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-500",
    hoverBorder: "hover:border-amber-500/40",
    accentColor: "group-hover:text-amber-500",
  },
];

const NewRequestTabContent = () => {
  const { openRequest, activeRequest } = useRequestSyncStoreState();
  const { activeWorkspace } = useWorkspaceState();
  const workspaceId = activeWorkspace?.id || "";

  const handleCreateRequest = (type: "API" | "WEBSOCKET" | "SOCKET_IO") => {
    const newId = activeRequest?.id || createId();

    const requestData = {
      id: newId,
      name: "New Request",
      description: "",
      method: type === "API" ? ("GET" as const) : null,
      url: "",
      type: type,
      headers: [],
      parameters: [],
      body: {
        raw: "",
        formData: [],
        urlEncoded: [],
        file: null,
        json: {},
      },
      bodyType: "NONE" as const,
      auth: { type: "NONE" as const },
      messageType: type !== "API" ? ("CONNECTION" as const) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
      workspaceId: workspaceId,
      collectionId: null,
      savedMessages: [],
      sortOrder: 0,
      unsaved: true,
    };

    openRequest(requestData);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-8 py-12 bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="text-center mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-medium mb-4">
          <Sparkles className="size-3.5" />
          New Request
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          What would you like to build?
        </h1>
        <p className="text-sm text-muted-foreground max-w-md">
          Choose a request type to get started. You can always change it later.
        </p>
      </div>

      {/* Request Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
        {requestTypes.map((item) => {
          const Icon = item.icon;
          return (
            <button
              type="button"
              key={item.type}
              onClick={() => handleCreateRequest(item.type)}
              className={cn(
                "group relative flex flex-col items-start p-5 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm",
                "transition-all duration-300 ease-out cursor-pointer text-left",
                "hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1",
                item.hoverBorder,
              )}
            >
              {/* Gradient overlay */}
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  item.gradient,
                )}
              />

              {/* Content */}
              <div className="relative z-10 w-full">
                {/* Icon */}
                <div
                  className={cn(
                    "size-12 rounded-xl border flex items-center justify-center mb-4 transition-all duration-300",
                    item.iconBg,
                    "group-hover:scale-110 group-hover:shadow-sm",
                  )}
                >
                  <Icon className={cn("size-6", item.iconColor)} />
                </div>

                {/* Title */}
                <h3
                  className={cn(
                    "text-base font-semibold text-foreground mb-1 transition-colors duration-300",
                    item.accentColor,
                  )}
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  {item.description}
                </p>

                {/* Action hint */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 group-hover:text-foreground transition-colors duration-300">
                  <span>Create</span>
                  <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform duration-300" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer hint */}
      <div className="mt-10 text-center">
        <p className="text-xs text-muted-foreground/50">
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/50 text-[10px] font-mono">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/50 text-[10px] font-mono">
            N
          </kbd>{" "}
          for quick access
        </p>
      </div>
    </div>
  );
};

export default NewRequestTabContent;
