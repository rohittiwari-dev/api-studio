import { io, type Socket } from "socket.io-client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type LogMessage = {
  id: string;
  timestamp: number;
  direction: "sent" | "received" | "error" | "system";
  content: string;
  eventName?: string;
};

interface SocketIOConnectionOptions {
  query?: Record<string, string>;
  extraHeaders?: Record<string, string>;
  events?: string[];
}

interface SocketIOState {
  connections: Record<string, Socket>;
  messages: Record<string, LogMessage[]>;
  connectionStatus: Record<
    string,
    "connected" | "disconnected" | "connecting" | "error"
  >;
  connectionOptions: Record<string, SocketIOConnectionOptions>;

  connect: (
    requestId: string,
    url: string,
    options?: SocketIOConnectionOptions,
  ) => void;
  disconnect: (requestId: string) => void;
  emit: (requestId: string, eventName: string, ...args: any[]) => void;
  clearMessages: (requestId: string) => void;
}

const useSocketIOStore = create<SocketIOState>()(
  devtools((set, get) => ({
    connections: {},
    messages: {},
    connectionStatus: {},
    connectionOptions: {},

    connect: (requestId, url, options = {}) => {
      const { connections } = get();
      if (connections[requestId]) {
        connections[requestId].disconnect();
      }

      try {
        set((state) => ({
          connectionStatus: {
            ...state.connectionStatus,
            [requestId]: "connecting",
          },
          connectionOptions: {
            ...state.connectionOptions,
            [requestId]: options,
          },
        }));

        const socket = io(url, {
          transports: ["websocket"],
          autoConnect: false,
          query: options.query,
          extraHeaders: options.extraHeaders,
        });

        socket.connect();

        socket.on("connect", () => {
          set((state) => ({
            connectionStatus: {
              ...state.connectionStatus,
              [requestId]: "connected",
            },
            messages: {
              ...state.messages,
              [requestId]: [
                ...(state.messages[requestId] || []),
                {
                  id: crypto.randomUUID(),
                  timestamp: Date.now(),
                  direction: "system",
                  content: `Connected to ${url}`,
                },
              ],
            },
          }));

          // Register event listeners for specified events
          const events = options.events || [];
          events.forEach((eventName) => {
            socket.on(eventName, (...args: any[]) => {
              set((state) => ({
                messages: {
                  ...state.messages,
                  [requestId]: [
                    ...(state.messages[requestId] || []),
                    {
                      id: crypto.randomUUID(),
                      timestamp: Date.now(),
                      direction: "received",
                      eventName,
                      content:
                        args.length === 1
                          ? typeof args[0] === "string"
                            ? args[0]
                            : JSON.stringify(args[0], null, 2)
                          : JSON.stringify(args, null, 2),
                    },
                  ],
                },
              }));
            });
          });
        });

        socket.on("disconnect", () => {
          set((state) => ({
            connectionStatus: {
              ...state.connectionStatus,
              [requestId]: "disconnected",
            },
            messages: {
              ...state.messages,
              [requestId]: [
                ...(state.messages[requestId] || []),
                {
                  id: crypto.randomUUID(),
                  timestamp: Date.now(),
                  direction: "system",
                  content: "Disconnected",
                },
              ],
            },
          }));
        });

        socket.on("connect_error", (error) => {
          const isLocal = /^(https?:\/\/)?(localhost|127\.0\.0\.1|::1)/i.test(
            url,
          );
          const errorMsg = isLocal
            ? `Connection failed: ${error.message}. Ensure your local server at ${url} is running, has Socket.IO enabled, and allows CORS from this origin.`
            : error.message;

          set((state) => ({
            connectionStatus: {
              ...state.connectionStatus,
              [requestId]: "error",
            },
            messages: {
              ...state.messages,
              [requestId]: [
                ...(state.messages[requestId] || []),
                {
                  id: crypto.randomUUID(),
                  timestamp: Date.now(),
                  direction: "error",
                  content: errorMsg,
                },
              ],
            },
          }));
        });

        // Catch-all listener for any event (for events not explicitly registered)
        socket.onAny((eventName, ...args) => {
          // Skip if this event was already registered
          const registeredEvents = options.events || [];
          if (registeredEvents.includes(eventName)) {
            return;
          }

          set((state) => ({
            messages: {
              ...state.messages,
              [requestId]: [
                ...(state.messages[requestId] || []),
                {
                  id: crypto.randomUUID(),
                  timestamp: Date.now(),
                  direction: "received",
                  eventName,
                  content:
                    args.length === 1
                      ? typeof args[0] === "string"
                        ? args[0]
                        : JSON.stringify(args[0], null, 2)
                      : JSON.stringify(args, null, 2),
                },
              ],
            },
          }));
        });

        set((state) => ({
          connections: { ...state.connections, [requestId]: socket },
        }));
      } catch (error) {
        set((state) => ({
          connectionStatus: {
            ...state.connectionStatus,
            [requestId]: "error",
          },
          messages: {
            ...state.messages,
            [requestId]: [
              ...(state.messages[requestId] || []),
              {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                direction: "error",
                content:
                  error instanceof Error ? error.message : "Failed to connect",
              },
            ],
          },
        }));
      }
    },

    disconnect: (requestId) => {
      const { connections } = get();
      if (connections[requestId]) {
        connections[requestId].disconnect();
      }
    },

    emit: (requestId, eventName, ...args) => {
      const { connections } = get();
      const socket = connections[requestId];

      if (socket?.connected) {
        socket.emit(eventName, ...args);
        set((state) => ({
          messages: {
            ...state.messages,
            [requestId]: [
              ...(state.messages[requestId] || []),
              {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                direction: "sent",
                eventName,
                content:
                  args.length === 1
                    ? typeof args[0] === "string"
                      ? args[0]
                      : JSON.stringify(args[0], null, 2)
                    : JSON.stringify(args, null, 2),
              },
            ],
          },
        }));
      } else {
        set((state) => ({
          messages: {
            ...state.messages,
            [requestId]: [
              ...(state.messages[requestId] || []),
              {
                id: crypto.randomUUID(),
                timestamp: Date.now(),
                direction: "error",
                content: "Cannot emit event: Socket is not connected",
              },
            ],
          },
        }));
      }
    },

    clearMessages: (requestId) => {
      set((state) => ({
        messages: { ...state.messages, [requestId]: [] },
      }));
    },
  })),
);

export default useSocketIOStore;
