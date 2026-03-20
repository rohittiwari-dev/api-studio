import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import redis, { publisher, WEBHOOK_CHANNEL_PREFIX } from "@/lib/redis";
import type { WebhookRealtimeEvent } from "@/modules/webhooks/types/webhook.types";

// Configuration
const MAX_EVENTS_PER_HOOK = 100; // Maximum stored events per hookId in Redis
const EVENT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days TTL for Redis cache

interface WebhookEventData {
  id: string;
  hookId: string;
  timestamp: string;
  method: string;
  url: string;
  pathname: string;
  searchParams: Record<string, string>;
  headers: Record<string, string>;
  body: unknown;
  bodyRaw: string | null;
  contentType: string | null;
  ip: string | null;
  userAgent: string | null;
  size: number;
}

// Context parameter type for dynamic routes
type RouteContext = {
  params: Promise<{ hookId: string }>;
};

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods":
    "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Expose-Headers": "X-Webhook-Event-Id, X-Webhook-Hook-Id",
};

/**
 * Add CORS headers to response
 */
function addCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

/**
 * Parse request body based on content type
 */
async function parseBody(
  req: NextRequest,
): Promise<{ parsed: unknown; raw: string | null }> {
  const contentType = req.headers.get("content-type") || "";

  try {
    const text = await req.text();

    if (!text) {
      return { parsed: null, raw: null };
    }

    // Try JSON parsing
    if (contentType.includes("application/json")) {
      try {
        return { parsed: JSON.parse(text), raw: text };
      } catch {
        return { parsed: text, raw: text };
      }
    }

    // Form URL encoded
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const params = new URLSearchParams(text);
      const parsed: Record<string, string> = {};
      params.forEach((value, key) => {
        parsed[key] = value;
      });
      return { parsed, raw: text };
    }

    // XML/HTML
    if (contentType.includes("xml") || contentType.includes("html")) {
      return { parsed: text, raw: text };
    }

    // Default: try JSON, fallback to text
    try {
      return { parsed: JSON.parse(text), raw: text };
    } catch {
      return { parsed: text, raw: text };
    }
  } catch {
    return { parsed: null, raw: null };
  }
}

/**
 * Extract headers as a plain object
 */
function extractHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Extract search params as a plain object
 */
function extractSearchParams(
  searchParams: URLSearchParams,
): Record<string, string> {
  const result: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Generate a unique event ID
 */
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Store webhook event in Redis (cache) and PostgreSQL (persistence)
 */
async function storeWebhookEvent(
  event: WebhookEventData,
  webhook?: any,
): Promise<string | null> {
  const listKey = `webhook:${event.hookId}:events`;
  const eventKey = `webhook:${event.hookId}:event:${event.id}`;

  // Store in Redis cache
  await redis.setex(eventKey, EVENT_TTL_SECONDS, JSON.stringify(event));
  await redis.lpush(listKey, event.id);
  await redis.ltrim(listKey, 0, MAX_EVENTS_PER_HOOK - 1);
  await redis.expire(listKey, EVENT_TTL_SECONDS);

  // Find webhook by URL if not provided
  const dbWebhook =
    webhook ||
    (await db.webhook.findUnique({
      where: { url: event.hookId },
    }));

  if (!dbWebhook) {
    // Webhook not registered, still accept the event in Redis only
    return null;
  }

  // Store in PostgreSQL for persistence
  const dbEvent = await db.webhookEvent.create({
    data: {
      webhookId: dbWebhook.id,
      method: event.method,
      headers: event.headers,
      body: event.body as object,
      bodyRaw: event.bodyRaw,
      searchParams: event.searchParams,
      ip: event.ip,
      userAgent: event.userAgent,
      contentType: event.contentType,
      size: event.size,
    },
  });

  // Publish realtime event via Redis pub/sub
  const realtimeEvent: WebhookRealtimeEvent = {
    type: "NEW_EVENT",
    workspaceId: dbWebhook.workspaceId,
    webhookId: dbWebhook.id,
    data: {
      id: dbEvent.id,
      webhookId: dbWebhook.id,
      method: event.method,
      headers: event.headers,
      body: event.body,
      bodyRaw: event.bodyRaw,
      searchParams: event.searchParams,
      ip: event.ip,
      userAgent: event.userAgent,
      contentType: event.contentType,
      size: event.size,
      createdAt: dbEvent.createdAt,
    },
  };

  await publisher.publish(
    `${WEBHOOK_CHANNEL_PREFIX}${dbWebhook.workspaceId}`,
    JSON.stringify(realtimeEvent),
  );

  return dbEvent.id;
}

/**
 * Get all webhook events for a hookId from Redis cache
 */
async function getWebhookEvents(hookId: string): Promise<WebhookEventData[]> {
  const listKey = `webhook:${hookId}:events`;
  const eventIds = await redis.lrange(listKey, 0, -1);

  if (!eventIds.length) {
    return [];
  }

  const events: WebhookEventData[] = [];
  for (const eventId of eventIds) {
    const eventKey = `webhook:${hookId}:event:${eventId}`;
    const eventData = await redis.get(eventKey);
    if (eventData) {
      events.push(JSON.parse(eventData) as WebhookEventData);
    }
  }

  return events;
}

/**
 * Clear all webhook events for a hookId from Redis
 */
async function clearWebhookEventsRedis(hookId: string): Promise<number> {
  const listKey = `webhook:${hookId}:events`;
  const eventIds = await redis.lrange(listKey, 0, -1);

  let deleted = 0;
  for (const eventId of eventIds) {
    const eventKey = `webhook:${hookId}:event:${eventId}`;
    deleted += await redis.del(eventKey);
  }
  await redis.del(listKey);

  return deleted;
}

/**
 * Handle incoming webhook - common handler for all methods
 */
async function handleWebhook(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { hookId } = await context.params;
    const { parsed: body, raw: bodyRaw } = await parseBody(req);

    const headers = extractHeaders(req.headers);
    const searchParams = extractSearchParams(req.nextUrl.searchParams);

    const event: WebhookEventData = {
      id: generateEventId(),
      hookId,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      pathname: req.nextUrl.pathname,
      searchParams,
      headers,
      body,
      bodyRaw,
      contentType: req.headers.get("content-type"),
      ip:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        null,
      userAgent: req.headers.get("user-agent"),
      size: bodyRaw?.length || 0,
    };

    // Fetch webhook to check for custom response config
    const webhook = (await db.webhook.findUnique({
      where: { url: hookId },
    })) as any;

    // Store the event (pass webhook to avoid re-fetch)
    const dbEventId = await storeWebhookEvent(event, webhook);

    // Check for custom response configuration
    if (webhook?.responseConfig) {
      const config = webhook.responseConfig as any;
      const status = config.status || 200;
      const body = config.body || "";
      const contentType = config.contentType || "text/plain";
      const headers = config.headers || {};

      const response = new NextResponse(body, {
        status,
        headers: {
          "Content-Type": contentType,
          "X-Webhook-Event-Id": dbEventId || event.id,
          "X-Webhook-Hook-Id": hookId,
          ...headers,
        },
      });
      return addCorsHeaders(response);
    }

    // Return success response with CORS headers
    const response = NextResponse.json(
      {
        success: true,
        message: "Webhook received",
        eventId: dbEventId || event.id,
        hookId,
        timestamp: event.timestamp,
      },
      {
        status: 200,
        headers: {
          "X-Webhook-Event-Id": dbEventId || event.id,
          "X-Webhook-Hook-Id": hookId,
        },
      },
    );

    return addCorsHeaders(response);
  } catch (error) {
    console.error("Webhook handler error:", error);
    const response = NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
    return addCorsHeaders(response);
  }
}

/**
 * GET - Record GET webhook event OR retrieve stored events
 * Use ?events=true to retrieve stored events, otherwise GET is recorded as webhook event
 */
export async function GET(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { hookId } = await context.params;
    const shouldGetEvents = req.nextUrl.searchParams.get("events") === "true";

    // If ?events=true, return stored events
    if (shouldGetEvents) {
      const events = await getWebhookEvents(hookId);

      const response = NextResponse.json({
        success: true,
        hookId,
        count: events.length,
        events,
      });

      return addCorsHeaders(response);
    }

    // Otherwise, record as incoming webhook
    return handleWebhook(req, context);
  } catch (error) {
    console.error("GET webhook error:", error);
    const response = NextResponse.json(
      {
        success: false,
        error: "Failed to process request",
      },
      { status: 500 },
    );
    return addCorsHeaders(response);
  }
}

/**
 * POST - Receive webhook event
 */
export async function POST(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return handleWebhook(req, context);
}

/**
 * PUT - Receive webhook event
 */
export async function PUT(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return handleWebhook(req, context);
}

/**
 * PATCH - Receive webhook event
 */
export async function PATCH(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return handleWebhook(req, context);
}

/**
 * DELETE - Clear webhook events OR receive webhook event
 * If query param ?clear=true, clears all events. Otherwise, treats as incoming webhook.
 */
export async function DELETE(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  try {
    const { hookId } = await context.params;
    const shouldClear = req.nextUrl.searchParams.get("clear") === "true";

    if (shouldClear) {
      const deleted = await clearWebhookEventsRedis(hookId);
      const response = NextResponse.json({
        success: true,
        message: "Webhook events cleared",
        hookId,
        deleted,
      });
      return addCorsHeaders(response);
    }

    // Otherwise, treat as incoming webhook
    return handleWebhook(req, context);
  } catch (error) {
    console.error("DELETE webhook error:", error);
    const response = NextResponse.json(
      {
        success: false,
        error: "Failed to process request",
      },
      { status: 500 },
    );
    return addCorsHeaders(response);
  }
}

/**
 * OPTIONS - Receive webhook event (also handles CORS preflight logically via handleWebhook)
 */
export async function OPTIONS(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return handleWebhook(req, context);
}

/**
 * HEAD - Receive webhook event
 */
export async function HEAD(
  req: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  return handleWebhook(req, context);
}
