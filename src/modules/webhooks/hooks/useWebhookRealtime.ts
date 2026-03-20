"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import useWebhookStore from "../store/webhook.store";
import type {
  WebhookEvent,
  WebhookRealtimeEvent,
} from "../types/webhook.types";
import { webhookKeys } from "./queries";

interface UseWebhookRealtimeOptions {
  workspaceId: string;
  enabled?: boolean;
  onEvent?: (event: WebhookRealtimeEvent) => void;
}

/**
 * Hook for realtime webhook event updates via SSE
 */
export function useWebhookRealtime({
  workspaceId,
  enabled = true,
  onEvent,
}: UseWebhookRealtimeOptions) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectRef = useRef<(() => void) | null>(null);
  const queryClient = useQueryClient();

  const { addEvent, setConnected, activeWebhook } = useWebhookStore();

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data) as
          | WebhookRealtimeEvent
          | { type: string };

        // Handle heartbeat
        if (data.type === "heartbeat" || data.type === "connected") {
          return;
        }

        const realtimeEvent = data as WebhookRealtimeEvent;

        // Handle new webhook event
        if (realtimeEvent.type === "NEW_EVENT") {
          const webhookEvent = realtimeEvent.data as WebhookEvent;

          // Add to store if it's for the active webhook
          if (activeWebhook?.id === realtimeEvent.webhookId) {
            addEvent(webhookEvent);
          }

          // Invalidate queries
          queryClient.invalidateQueries({
            queryKey: webhookKeys.eventList(realtimeEvent.webhookId),
          });
          queryClient.invalidateQueries({
            queryKey: webhookKeys.eventCount(realtimeEvent.webhookId),
          });
        }

        // Call custom event handler
        onEvent?.(realtimeEvent);
      } catch (error) {
        console.error("Failed to parse SSE message:", error);
      }
    },
    [addEvent, activeWebhook, queryClient, onEvent],
  );

  const connect = useCallback(() => {
    if (!workspaceId || !enabled) {
      return;
    }

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Create new SSE connection
    const eventSource = new EventSource(
      `/api/webhooks/events?workspaceId=${workspaceId}`,
    );

    eventSource.onopen = () => {
      setConnected(true);
      console.log("[Webhook SSE] Connected");
    };

    eventSource.onmessage = handleMessage;

    eventSource.onerror = (error) => {
      console.error("[Webhook SSE] Error:", error);
      setConnected(false);

      // Attempt to reconnect after 5 seconds
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("[Webhook SSE] Attempting to reconnect...");
        connectRef.current?.();
      }, 5000);
    };

    eventSourceRef.current = eventSource;
  }, [workspaceId, enabled, handleMessage, setConnected]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setConnected(false);
  }, [setConnected]);

  useEffect(() => {
    if (enabled && workspaceId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, workspaceId, connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected: useWebhookStore((state) => state.isConnected),
  };
}

export default useWebhookRealtime;
