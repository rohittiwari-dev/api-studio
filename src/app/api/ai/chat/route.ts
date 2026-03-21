import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { z } from "zod";
import { aiModel } from "@/lib/ai";
import { getRequestById } from "@/modules/apis/requests/server/request";

const systemPrompt = `You are an expert API testing assistant built strictly into API Studio — a Postman alternative for developers.

You help users ONLY with:
- Structuring API requests (REST, GraphQL, WebSocket, Socket.io)
- Debugging errors and understanding HTTP status codes
- Writing request headers, parameters, and body payloads
- Understanding authentication methods (Bearer, API Key, OAuth, Basic)
- Explaining response data and API concepts
- Webhooks, Socket.io, and WebSockets functionalities within this app
- Best practices for API design and testing

CRITICAL INSTRUCTION: You MUST strictly refuse to answer any questions or generate code that is outside the scope of API testing, Webhooks, WebSockets, or the API Studio app. Keep answers concise and developer-focused. Use code blocks for examples.

You have access to TOOLS. When a user asks you to:
- "create a request" → call the createRequest tool
- "add headers/params" → call the updateRequestParams tool  
- "create an environment variable" → call the createEnvironmentVariable tool
- "create a cookie" → call the createCookie tool
- "analyze/debug my request" → call the analyzeRequest tool with the request ID
Always prefer using tools over describing what to do.`;

export async function POST(req: Request) {
  const body = (await req.json()) as {
    messages: UIMessage[];
    workspaceId?: string;
    activeRequestId?: string;
  };

  const messages = body?.messages || [];
  const workspaceId = body?.workspaceId;
  const activeRequestId = body?.activeRequestId;

  const contextNote = `\n\nCurrent workspace context:\n- Workspace ID: ${workspaceId || "None"}\n- Active Request ID: ${activeRequestId || "None"}`;

  try {
    const result = streamText({
      model: aiModel,
      system: systemPrompt + contextNote,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 2048,
      tools: {
        // ── Server-side tool: has execute, runs on server ──────────────
        analyzeRequest: {
          description:
            "Fetch a specific request from the database by its ID to analyze its URL, method, headers, body, and auth configuration.",
          inputSchema: z.object({
            requestId: z
              .string()
              .describe("The ID of the request to fetch and analyze"),
          }),
          execute: async ({ requestId }: { requestId: string }) => {
            if (!workspaceId) {
              return {
                error: "No workspace context. Please open a workspace first.",
              };
            }
            try {
              const request = await getRequestById(requestId, workspaceId);
              if (!request)
                return { error: `Request with ID "${requestId}" not found.` };
              return {
                success: true,
                request: JSON.parse(JSON.stringify(request)),
              };
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Unknown error";
              return { error: `Failed to fetch request: ${msg}` };
            }
          },
        },

        // ── Client-side tools: no execute → UI handles side-effects ────
        createRequest: {
          description:
            "Create a new API request, WebSocket, or Socket.io connection in the workspace UI.",
          inputSchema: z.object({
            name: z.string().describe("Name of the request"),
            type: z
              .enum(["API", "WEBSOCKET", "SOCKET_IO"])
              .describe("Protocol type"),
            method: z
              .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
              .optional()
              .describe("HTTP method (only for API type)"),
            url: z.string().describe("URL or endpoint to connect to"),
            headers: z
              .array(
                z.object({
                  key: z.string(),
                  value: z.string(),
                  isActive: z.boolean().default(true),
                }),
              )
              .optional()
              .describe("Request headers"),
            parameters: z
              .array(
                z.object({
                  key: z.string(),
                  value: z.string(),
                  type: z.enum(["query", "path"]).default("query"),
                  isActive: z.boolean().default(true),
                }),
              )
              .optional()
              .describe("Query or path parameters"),
            bodyType: z
              .enum([
                "NONE",
                "JSON",
                "FORM_DATA",
                "URL_ENCODED",
                "RAW",
                "BINARY",
              ])
              .optional()
              .describe("Body content type"),
            bodyContent: z
              .string()
              .optional()
              .describe("Body content as a string"),
          }),
        },

        updateRequestParams: {
          description:
            "Add or update headers and query/path parameters on an existing request in the UI.",
          inputSchema: z.object({
            requestId: z.string().describe("The ID of the request to update"),
            headers: z
              .array(z.object({ key: z.string(), value: z.string() }))
              .default([])
              .describe("Headers to add"),
            parameters: z
              .array(
                z.object({
                  key: z.string(),
                  value: z.string(),
                  type: z.enum(["query", "path"]).default("query"),
                }),
              )
              .default([])
              .describe("Parameters to add"),
          }),
        },

        createEnvironmentVariable: {
          description:
            "Add a new environment variable to the user's active environment.",
          inputSchema: z.object({
            key: z.string().describe("Variable key/name"),
            value: z.string().describe("Variable value"),
            type: z
              .enum(["default", "secret"])
              .default("default")
              .describe("default = plain text, secret = masked"),
          }),
        },

        createCookie: {
          description:
            "Create a new cookie entry for a specific domain in the cookie manager.",
          inputSchema: z.object({
            domain: z
              .string()
              .describe("Domain the cookie applies to (e.g. api.example.com)"),
            name: z.string().describe("Cookie name/key"),
            value: z.string().describe("Cookie value"),
            path: z.string().default("/").describe("Cookie path"),
            secure: z
              .boolean()
              .default(false)
              .describe("Whether cookie is Secure-only"),
          }),
        },
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error: unknown) {
    const err = error as any;
    const isRateLimit =
      err?.statusCode === 429 ||
      err?.status === 429 ||
      err?.message?.toLowerCase()?.includes("quota");
    if (isRateLimit) {
      return new Response(
        "AI Quota Exceeded. Please check your Gemini API plan and billing.",
        { status: 429 },
      );
    }
    return new Response(err?.message || "Internal Server Error", {
      status: 500,
    });
  }
}
