import {
  IconLoader2,
  IconPlugConnected,
  IconPlugConnectedX,
} from "@tabler/icons-react";
import { SaveIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EnvironmentVariableInput } from "@/components/ui/environment-variable-input";
import { InputGroup } from "@/components/ui/input-group";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { substituteVariables } from "@/lib/utils/substituteVariables";
import useEnvironmentStore from "@/modules/apis/environment/store/environment.store";
import { updateRequestAction } from "../actions";
import { useUpsertRequest } from "../hooks/queries";
import useRequestSyncStoreState from "../hooks/requestSyncStore";
import useSocketIOStore from "../store/socketio.store";
import HeaderComponent from "./api-request-components/header-component";
import ParameterComponent from "./api-request-components/parameter-component";
import SocketIOEventsManager, {
  type SocketIOEvent,
} from "./shared/SocketIOEventsManager";
import SocketIOMessageComposer, {
  type SocketIOArg,
} from "./shared/SocketIOMessageComposer";
import SocketIOMessageLog from "./shared/SocketIOMessageLog";
import SocketIOSavedArgs, {
  type SavedSocketIOMessage,
} from "./shared/SocketIOSavedArgs";

const SocketIORequestComponent = () => {
  const { activeRequest, updateRequest, getRequestById } =
    useRequestSyncStoreState();
  const { getVariablesAsRecord } = useEnvironmentStore();
  const {
    connect,
    disconnect,
    emit,
    messages,
    connectionStatus,
    clearMessages,
  } = useSocketIOStore();

  // Message composer state
  const [args, setArgs] = useState<SocketIOArg[]>([
    { id: crypto.randomUUID(), content: "", format: "text" },
  ]);
  const [eventName, setEventName] = useState("message");
  const [ack, setAck] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("message");

  // Events state - stored in body.socketio_events
  const request = activeRequest ? getRequestById(activeRequest.id) : null;
  const getEventsFromBody = useCallback((body: any): SocketIOEvent[] => {
    if (!body) {
      return [];
    }
    // Handle both object and potential legacy array format
    if (
      typeof body === "object" &&
      !Array.isArray(body) &&
      body.socketio_events
    ) {
      return Array.isArray(body.socketio_events) ? body.socketio_events : [];
    }
    return [];
  }, []);

  const [events, setEvents] = useState<SocketIOEvent[]>(() =>
    getEventsFromBody(request?.body),
  );

  const requestId = activeRequest?.id || "";
  const status = connectionStatus[requestId] || "disconnected";
  const requestMessages = messages[requestId] || [];

  // Sync events when request body changes
  const requestBody = request?.body;
  useEffect(() => {
    const eventsData = getEventsFromBody(requestBody);
    setEvents(eventsData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getEventsFromBody, requestBody]);

  // Use the upsert mutation hook for saving
  const upsertMutation = useUpsertRequest(activeRequest?.workspaceId || "", {
    onSuccess: () => {
      // Store already updated optimistically
    },
    onError: (error) => {
      console.error("Failed to save request", error);
      // Revert optimistic update on error
      if (activeRequest?.id) {
        updateRequest(activeRequest.id, { unsaved: true });
      }
    },
  });

  const handleConnect = () => {
    if (status === "connected") {
      disconnect(requestId);
    } else {
      if (activeRequest?.url) {
        const envVariables = getVariablesAsRecord();

        // Substitute variables in URL
        const url = substituteVariables(activeRequest.url, envVariables);

        // Substitute variables in parameters
        const parameters = activeRequest.parameters?.map((p: any) => ({
          ...p,
          key: substituteVariables(p.key || "", envVariables),
          value: substituteVariables(p.value || "", envVariables),
        }));

        // Substitute variables in headers
        const headers = activeRequest.headers?.map((h: any) => ({
          ...h,
          key: substituteVariables(h.key || "", envVariables),
          value: substituteVariables(h.value || "", envVariables),
        }));

        // Get listening events
        const listeningEvents = events
          .filter((e) => e.listening)
          .map((e) => e.name);

        connect(requestId, url, {
          query: parameters
            ?.filter((p: any) => p.isActive !== false && p.key)
            .reduce((acc: any, p: any) => {
              acc[p.key] = p.value;
              return acc;
            }, {}),
          extraHeaders: headers
            ?.filter((h: any) => h.isActive !== false && h.key)
            .reduce((acc: any, h: any) => {
              acc[h.key] = h.value;
              return acc;
            }, {}),
          events: listeningEvents,
        });
      }
    }
  };

  const handleSendMessage = (
    eventName: string,
    args: SocketIOArg[],
    _ack: boolean,
  ) => {
    if (status !== "connected") {
      return;
    }

    const envVariables = getVariablesAsRecord();

    // Process args
    const processedArgs = args.map((arg) => {
      const substitutedContent = substituteVariables(arg.content, envVariables);

      if (arg.format === "json") {
        try {
          return JSON.parse(substitutedContent);
        } catch {
          return substitutedContent;
        }
      }
      return substitutedContent;
    });

    emit(requestId, eventName || "message", ...processedArgs);
  };

  // Handle saving a message to savedMessages (uses existing DB field)
  const handleSaveMessage = useCallback(
    (name: string, eventName: string, args: SocketIOArg[], ack: boolean) => {
      if (!activeRequest?.id) {
        return;
      }

      const savedMessages = (activeRequest as any).savedMessages || [];
      const newMessage = {
        id: crypto.randomUUID(),
        name,
        eventName,
        args: args.map((arg) => ({ ...arg })),
        ack,
        format: "json", // For compatibility with WebSocketSavedMessages
        content: JSON.stringify(args), // Store args as JSON content for preview
        createdAt: Date.now(),
      };

      const updatedMessages = [...savedMessages, newMessage];

      updateRequest(activeRequest.id, {
        savedMessages: updatedMessages,
        unsaved: true,
      });
      updateRequestAction(activeRequest.id, {
        savedMessages: updatedMessages,
      });
    },
    [activeRequest, updateRequest],
  );

  // Handle selecting a saved message
  const handleSelectSavedMessage = useCallback(
    (message: SavedSocketIOMessage) => {
      if (message.eventName) {
        setEventName(message.eventName);
      }
      if (message.args && Array.isArray(message.args)) {
        setArgs(
          message.args.map((arg: any) => ({
            ...arg,
            id: crypto.randomUUID(),
          })),
        );
      }
      if (typeof message.ack === "boolean") {
        setAck(message.ack);
      }
    },
    [],
  );

  const handleEventsChange = (newEvents: SocketIOEvent[]) => {
    setEvents(newEvents);

    // Store events in body.socketio_events
    if (activeRequest?.id) {
      const currentBody = (activeRequest.body as any) || {};
      const newBody = {
        ...(typeof currentBody === "object" && !Array.isArray(currentBody)
          ? currentBody
          : {}),
        socketio_events: newEvents,
      };

      updateRequest(activeRequest.id, {
        body: newBody,
        unsaved: true,
      });
      updateRequestAction(activeRequest.id, { body: newBody });
    }
  };

  const handleSave = useCallback(() => {
    if (!activeRequest?.id) {
      return;
    }

    // Optimistically update store immediately
    updateRequest(activeRequest.id, {
      unsaved: false,
      type: "SOCKET_IO" as any,
    });

    // Store events in body.socketio_events
    const currentBody = (activeRequest.body as any) || {};
    const bodyWithEvents = {
      ...(typeof currentBody === "object" && !Array.isArray(currentBody)
        ? currentBody
        : {}),
      socketio_events: events,
    };

    upsertMutation.mutate({
      requestId: activeRequest.id,
      name: activeRequest.name || "Untitled Socket.IO",
      url: activeRequest.url || "",
      workspaceId: activeRequest.workspaceId,
      collectionId: activeRequest.collectionId,
      headers: activeRequest.headers,
      parameters: activeRequest.parameters,
      body: bodyWithEvents,
      savedMessages: (activeRequest as any).savedMessages || [],
      type: "SOCKET_IO",
    } as any);
  }, [activeRequest, events, upsertMutation, updateRequest]);

  // Keyboard shortcut for Ctrl+S to save
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSave]);

  return (
    <div className="flex h-full w-full flex-col backdrop-blur-md">
      {/* Premium URL Bar */}
      <div className="flex w-full items-center border-t-0! gap-3 px-4 py-3 border-b border-indigo-500/15 glass-subtle">
        {/* Protocol Selector */}
        <Select
          defaultValue="HTTP"
          onValueChange={(value) => console.log(value)}
        >
          <SelectTrigger
            className={cn(
              "w-fit min-w-20 h-9",
              "cursor-pointer rounded-lg",
              "bg-linear-to-br from-indigo-500/20 to-violet-500/20",
              "border border-indigo-500/30",
              "font-bold text-indigo-600 dark:text-indigo-400",
              "hover:from-indigo-500/30 hover:to-violet-500/30 hover:border-indigo-500/40",
              "focus:ring-2 focus:ring-indigo-500/40",
              "transition-all duration-200",
              "shadow-md shadow-indigo-500/10",
            )}
          >
            <SelectValue placeholder="Protocol" />
          </SelectTrigger>
          <SelectContent className="rounded-lg p-1.5 shadow-2xl shadow-indigo-500/20 bg-popover/98 backdrop-blur-xl border border-indigo-500/20">
            <SelectItem
              value="HTTP"
              className="cursor-pointer rounded-md text-xs font-semibold px-3 py-2.5 focus:bg-indigo-500/15 focus:text-indigo-600 dark:focus:text-indigo-400 transition-colors"
            >
              HTTP
            </SelectItem>
            <SelectItem
              value="HTTPS"
              className="cursor-pointer rounded-md text-xs font-semibold px-3 py-2.5 focus:bg-indigo-500/15 focus:text-indigo-600 dark:focus:text-indigo-400 transition-colors"
            >
              HTTPS
            </SelectItem>
          </SelectContent>
        </Select>

        {/* URL Input */}
        <InputGroup className="flex-1">
          <EnvironmentVariableInput
            id="url"
            placeholder="http://localhost:3000 (use {{variable}} for env vars)"
            value={activeRequest?.url || ""}
            onChange={(value) => {
              if (activeRequest?.id) {
                updateRequest(activeRequest.id, {
                  url: value,
                  unsaved: true,
                });
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleConnect();
              }
            }}
            className="flex-1 h-9 rounded-lg border-indigo-500/20 focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/40 transition-all duration-200"
          />
        </InputGroup>

        {/* Connection Status Indicator */}
        {status === "connecting" && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-linear-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 shadow-md shadow-amber-500/10">
            <div className="size-2.5 rounded-full bg-linear-to-br from-amber-400 to-orange-500 animate-pulse shadow-lg shadow-amber-500/50" />
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
              Connecting
            </span>
          </div>
        )}

        {/* Connect/Disconnect Button */}
        <Button
          type="button"
          className={cn(
            "h-9 px-5 rounded-lg font-bold text-sm",
            "transition-all duration-200 active:scale-[0.97]",
            "shadow-lg",
            status === "connected"
              ? "bg-linear-to-r from-rose-500 via-pink-500 to-rose-600 text-white hover:from-rose-600 hover:via-pink-600 hover:to-rose-700 shadow-rose-500/30"
              : "bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white hover:from-emerald-600 hover:via-teal-600 hover:to-emerald-700 shadow-emerald-500/30",
          )}
          onClick={handleConnect}
        >
          {status === "connected" ? (
            <>
              <IconPlugConnectedX className="size-4 mr-2" />
              Disconnect
            </>
          ) : (
            <>
              <IconPlugConnected className="size-4 mr-2" />
              Connect
            </>
          )}
        </Button>

        {/* Save Button */}
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 px-4 rounded-lg font-medium text-sm",
            "border-border/60 hover:bg-muted/50 hover:border-border",
            "transition-all duration-200 active:scale-[0.98]",
          )}
          onClick={handleSave}
          disabled={upsertMutation.isPending}
        >
          {upsertMutation.isPending ? (
            <IconLoader2 className="size-4 mr-2 animate-spin" />
          ) : (
            <SaveIcon className="size-4 mr-2" />
          )}
          {upsertMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <div className="px-4 py-2 border-b border-border">
          <TabsList className="h-9 gap-1 p-1 rounded-lg bg-muted">
            <TabsTrigger
              value="message"
              className={cn(
                "h-7 px-4 rounded-md text-xs font-medium cursor-pointer",
                "transition-all",
                "data-[state=active]:bg-indigo-500/20 dark:data-[state=active]:bg-indigo-500/25 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/40",
                "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent",
              )}
            >
              Message
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className={cn(
                "h-7 px-4 rounded-md text-xs font-medium cursor-pointer",
                "transition-all",
                "data-[state=active]:bg-indigo-500/20 dark:data-[state=active]:bg-indigo-500/25 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/40",
                "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent",
              )}
            >
              Events
            </TabsTrigger>
            <TabsTrigger
              value="params"
              className={cn(
                "h-7 px-4 rounded-md text-xs font-medium cursor-pointer",
                "transition-all",
                "data-[state=active]:bg-indigo-500/20 dark:data-[state=active]:bg-indigo-500/25 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/40",
                "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent",
              )}
            >
              Params
            </TabsTrigger>
            <TabsTrigger
              value="headers"
              className={cn(
                "h-7 px-4 rounded-md text-xs font-medium cursor-pointer",
                "transition-all",
                "data-[state=active]:bg-indigo-500/20 dark:data-[state=active]:bg-indigo-500/25 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-300 data-[state=active]:border data-[state=active]:border-indigo-500/40",
                "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent",
              )}
            >
              Headers
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Message Tab */}
        <TabsContent value="message" className="flex-1 flex overflow-hidden">
          <ResizablePanelGroup
            orientation="horizontal"
            className="h-full w-full"
          >
            <ResizablePanel defaultSize={"75%"} minSize={"2%"}>
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel
                  defaultSize={"60%"}
                  minSize={"2%"}
                  className="flex flex-col"
                >
                  <SocketIOMessageLog
                    messages={requestMessages}
                    onClear={() => clearMessages(requestId)}
                  />
                </ResizablePanel>
                <ResizableHandle
                  withHandle
                  className="bg-border/30 hover:bg-primary/20 transition-colors"
                />
                <ResizablePanel
                  defaultSize={"40%"}
                  minSize={"2%"}
                  className="flex flex-col p-3 bg-muted/10"
                >
                  <SocketIOMessageComposer
                    args={args}
                    onArgsChange={setArgs}
                    eventName={eventName}
                    onEventNameChange={setEventName}
                    ack={ack}
                    onAckChange={setAck}
                    onSend={handleSendMessage}
                    onSave={handleSaveMessage}
                    disabled={status !== "connected"}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle
              withHandle
              className="bg-border/30 hover:bg-primary/20 transition-colors"
            />
            <ResizablePanel
              defaultSize={"25%"}
              minSize={"2%"}
              maxSize={"30%"}
              className="bg-muted/5"
            >
              <SocketIOSavedArgs
                requestId={requestId}
                onSelect={handleSelectSavedMessage}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="flex-1 overflow-hidden">
          <SocketIOEventsManager
            events={events}
            onEventsChange={handleEventsChange}
          />
        </TabsContent>

        {/* Params Tab */}
        <TabsContent value="params" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Query Parameters
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Add parameters to the Socket.IO connection
                </p>
              </div>
            </div>
            <ParameterComponent />
          </div>
        </TabsContent>

        {/* Headers Tab */}
        <TabsContent value="headers" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Extra Headers
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Add custom headers to the Socket.IO connection
                </p>
              </div>
            </div>
            <HeaderComponent />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocketIORequestComponent;
