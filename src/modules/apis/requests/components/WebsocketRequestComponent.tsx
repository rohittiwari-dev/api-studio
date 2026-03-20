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
import useWebsocketStore from "../store/websocket.store";
import ParameterComponent from "./api-request-components/parameter-component";
import WebSocketMessageComposer, {
  type MessageFormat as ComposerFormat,
} from "./shared/WebSocketMessageComposer";
import WebSocketMessageLog from "./shared/WebSocketMessageLog";
import WebSocketSavedMessages, {
  type SavedMessage,
} from "./shared/WebSocketSavedMessages";

const WebsocketRequestComponent = () => {
  const { activeRequest, updateRequest } = useRequestSyncStoreState();
  const { getVariablesAsRecord } = useEnvironmentStore();
  const {
    connect,
    disconnect,
    sendMessage,
    messages,
    connectionStatus,
    clearMessages,
  } = useWebsocketStore();

  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("message");
  const requestId = activeRequest?.id || "";
  const status = connectionStatus[requestId] || "disconnected";
  const requestMessages = messages[requestId] || [];

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
        const parameters = activeRequest.parameters?.map((p) => ({
          ...p,
          key: substituteVariables(p.key || "", envVariables),
          value: substituteVariables(p.value || "", envVariables),
        }));

        // Substitute variables in headers
        const headers = activeRequest.headers?.map((h) => ({
          ...h,
          key: substituteVariables(h.key || "", envVariables),
          value: substituteVariables(h.value || "", envVariables),
        }));

        connect(requestId, { url, parameters, headers });
      }
    }
  };

  const handleSendMessage = (message: string, format: ComposerFormat) => {
    if (message && status === "connected") {
      const envVariables = getVariablesAsRecord();
      const substitutedMessage = substituteVariables(message, envVariables);
      sendMessage(requestId, substitutedMessage, format);
    }
  };

  const handleSaveMessage = (
    name: string,
    content: string,
    format: ComposerFormat,
  ) => {
    if (!activeRequest?.id) {
      return;
    }
    const savedMessages = activeRequest.savedMessages || [];
    const newMessage: SavedMessage = {
      id: crypto.randomUUID(),
      name,
      content,
      format,
      createdAt: Date.now(),
    };
    const updatedMessages = [...savedMessages, newMessage];

    // Optimistic update
    updateRequest(activeRequest.id, {
      savedMessages: updatedMessages,
    });

    // Backend update
    updateRequestAction(activeRequest.id, {
      savedMessages: updatedMessages,
    });
  };

  const handleSelectSavedMessage = (msg: SavedMessage) => {
    setMessageInput(msg.content);
  };

  const handleSave = useCallback(() => {
    if (!activeRequest?.id) {
      return;
    }

    // Optimistically update store immediately
    updateRequest(activeRequest.id, {
      unsaved: false,
      type: "WEBSOCKET" as any,
    });

    upsertMutation.mutate({
      requestId: activeRequest.id,
      name: activeRequest.name || "Untitled WebSocket",
      url: activeRequest.url || "",
      workspaceId: activeRequest.workspaceId,
      collectionId: activeRequest.collectionId,
      headers: activeRequest.headers,
      parameters: activeRequest.parameters,
      savedMessages: activeRequest.savedMessages || [],
      type: "WEBSOCKET",
    });
  }, [activeRequest, updateRequest, upsertMutation]);

  // Keyboard shortcut for Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  return (
    <div className="flex h-full w-full flex-col backdrop-blur-md ">
      {/* Premium URL Bar */}
      <div className="flex w-full items-center border-t-0! gap-3 px-4 py-3 border-b border-violet-500/15 glass-subtle">
        {/* Protocol Selector */}
        <Select defaultValue="WS" onValueChange={(value) => console.log(value)}>
          <SelectTrigger
            className={cn(
              "w-20 h-9",
              "cursor-pointer rounded-lg",
              "bg-linear-to-br from-violet-500/20 to-indigo-500/20",
              "border border-violet-500/30",
              "font-bold text-violet-600 dark:text-violet-400",
              "hover:from-violet-500/30 hover:to-indigo-500/30 hover:border-violet-500/40",
              "focus:ring-2 focus:ring-violet-500/40",
              "transition-all duration-200",
              "shadow-md shadow-violet-500/10",
            )}
          >
            <SelectValue placeholder="Protocol" />
          </SelectTrigger>
          <SelectContent className="rounded-lg p-1.5 shadow-2xl shadow-violet-500/20 bg-popover/98 backdrop-blur-xl border border-violet-500/20">
            <SelectItem
              value="WSS"
              className="cursor-pointer rounded-md text-xs font-semibold px-3 py-2.5 focus:bg-violet-500/15 focus:text-violet-600 dark:focus:text-violet-400 transition-colors"
            >
              WSS
            </SelectItem>
            <SelectItem
              value="WS"
              className="cursor-pointer rounded-md text-xs font-semibold px-3 py-2.5 focus:bg-violet-500/15 focus:text-violet-600 dark:focus:text-violet-400 transition-colors"
            >
              WS
            </SelectItem>
          </SelectContent>
        </Select>

        {/* URL Input */}
        <InputGroup className="flex-1">
          <EnvironmentVariableInput
            id="url"
            placeholder="wss://example.com/socket (use {{variable}} for env vars)"
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
            className="flex-1 h-9 rounded-lg border-violet-500/20 focus-visible:ring-2 focus-visible:ring-violet-500/40 focus-visible:border-violet-500/40 transition-all duration-200"
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
                "data-[state=active]:bg-violet-500/20 dark:data-[state=active]:bg-violet-500/25 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-300 data-[state=active]:border data-[state=active]:border-violet-500/40",
                "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent",
              )}
            >
              Message
            </TabsTrigger>
            <TabsTrigger
              value="params"
              className={cn(
                "h-7 px-4 rounded-md text-xs font-medium cursor-pointer",
                "transition-all",
                "data-[state=active]:bg-violet-500/20 dark:data-[state=active]:bg-violet-500/25 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-300 data-[state=active]:border data-[state=active]:border-violet-500/40",
                "data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:bg-accent",
              )}
            >
              Parameters
            </TabsTrigger>
          </TabsList>
        </div>

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
                  <WebSocketMessageLog
                    messages={requestMessages}
                    onClear={() => clearMessages(requestId)}
                    requestId={requestId}
                  />
                </ResizablePanel>
                <ResizableHandle
                  withHandle
                  className="bg-border/30 hover:bg-primary/20 transition-colors"
                />
                <ResizablePanel
                  defaultSize={"30%"}
                  minSize={"2%"}
                  className="flex flex-col p-3 bg-muted/10"
                >
                  <WebSocketMessageComposer
                    value={messageInput}
                    onChange={setMessageInput}
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
              <WebSocketSavedMessages
                requestId={requestId}
                type="WEBSOCKET"
                onSelect={handleSelectSavedMessage}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>

        <TabsContent value="params" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Query Parameters
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Add parameters to the WebSocket URL
                </p>
              </div>
            </div>
            <ParameterComponent />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebsocketRequestComponent;
