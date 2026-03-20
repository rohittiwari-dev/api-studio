import { streamText } from "ai";
import { aiModel } from "@/lib/ai";

export const runtime = "edge";

const systemPrompt = `You are an expert API testing assistant built strictly into API Studio — a Postman alternative for developers.

You help users ONLY with:
- Structuring API requests (REST, GraphQL, WebSocket)
- Debugging errors and understanding HTTP status codes
- Writing request headers, parameters, and body payloads
- Understanding authentication methods (Bearer, API Key, OAuth, Basic)
- Explaining response data and API concepts
- Webhooks, Socket.io, and WebSockets functionalities within this app
- Best practices for API design and testing

CRITICAL INSTRUCTION: You MUST strictly refuse to answer any questions or generate code that is outside the scope of API testing, Webhooks, WebSockets, or the API Studio app. If a user asks a general programming question, off-topic subjects, or requests general code generation, politely decline and remind them that you are an API testing assistant. Keep answers concise and developer-focused. Use code blocks for examples.
When showing HTTP examples, use realistic request/response pairs.`;

export async function POST(req: Request) {
  const body = (await req.json()) as any;
  const messages = Array.isArray(body) ? body : body?.messages || [];

  try {
    const result = streamText({
      model: aiModel,
      system: systemPrompt,
      messages: messages,
      maxOutputTokens: 2048,
    });

    const customStream = new ReadableStream({
      async start(controller) {
        const reader = result.textStream.getReader();
        const encoder = new TextEncoder();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(encoder.encode(value));
          }
          controller.close();
        } catch (error: any) {
          console.error(
            "Chat AI stream error:",
            error?.message || "Unknown error",
          );
          const isRateLimit =
            error?.statusCode === 429 ||
            error?.status === 429 ||
            error?.message?.toLowerCase().includes("quota");
          const errorMsg = isRateLimit
            ? "⚠️ AI Quota Exceeded. Please check your Gemini API plan and billing."
            : `⚠️ Sorry, an error occurred with the AI provider: ${error?.message || ""}`;
          controller.enqueue(encoder.encode(errorMsg));
          controller.close();
        }
      },
    });

    return new Response(customStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: any) {
    const isRateLimit =
      error?.statusCode === 429 ||
      error?.status === 429 ||
      error?.message?.toLowerCase().includes("quota");
    if (isRateLimit) {
      return new Response(
        "AI Quota Exceeded. Please check your Gemini API plan and billing.",
        { status: 429 },
      );
    }
    return new Response(error?.message || "Internal Server Error", {
      status: 500,
    });
  }
}
