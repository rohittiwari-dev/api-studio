import { streamText } from "ai";
import { aiModel } from "@/lib/ai";

export const runtime = "edge";

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, type, prompt } = body as {
    messages: any[];
    type: "websocket" | "socketio";
    prompt?: string;
  };

  if (!messages || !Array.isArray(messages)) {
    return new Response("Missing or invalid messages array", { status: 400 });
  }

  // Format messages for the prompt
  // For large arrays, we should probably cap it to avoid breaking token limits
  const recentMessages = messages.slice(-100); // Analyze up to 100 most recent events

  const formattedLog = recentMessages
    .map((msg: any) => {
      const time = new Date(msg.timestamp).toISOString();
      let header = `[${time}] ${msg.direction?.toUpperCase()}`;
      if (msg.eventName) header += ` (Event: ${msg.eventName})`;
      if (msg.format) header += ` [${msg.format}]`;

      let content =
        typeof msg.content === "string"
          ? msg.content
          : JSON.stringify(msg.content);
      if (content.length > 500)
        content = `${content.slice(0, 500)}... (truncated)`;

      return `${header}\n${content}`;
    })
    .join("\n\n");

  const systemPrompt = `You are an expert API testing assistant analyzing a sequential log of ${
    type === "websocket" ? "WebSocket" : "Socket.IO"
  } messages.

The user wants to analyze this traffic flow. They may be looking for RPC correlations, racing conditions, authentication packet drops, missing ACKs, or general transaction flow readability.

Target user question/prompt to answer:
"${prompt || "Analyze the general message flow for any errors or noticeable request/response RPC patterns."}"

CRITICAL INSTRUCTIONS:
- Be EXTREMELY concise and ultra-brief. 
- Output 3 to 5 bullet points pinpointing exact packet flows (referencing timestamps or event names).
- If the user asks for RPC flow, map out which request corresponds to which response.
- Do NOT output verbose paragraphs. Keep everything strictly bulleted and fast to read.
- Use emojis like 📤 (sent), 📥 (received), ⚠️ (warning), ❌ (error).

Traffic Log (${recentMessages.length} latest messages):
\`\`\`
${formattedLog}
\`\`\`
`;

  try {
    const result = streamText({
      model: aiModel,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "Please provide the flow analysis now.",
        },
      ],
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
            "AI Flow Analysis stream error:",
            error?.message || "Unknown error",
          );
          const isRateLimit =
            error?.statusCode === 429 ||
            error?.status === 429 ||
            error?.message?.toLowerCase().includes("quota");
          const errorMsg = isRateLimit
            ? "⚠️ **AI Quota Exceeded.** Please check your Gemini API plan and billing."
            : `⚠️ Error occurred with the AI provider: ${error?.message || ""}`;
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
        "⚠️ **AI Quota Exceeded.** Please check your Gemini API plan and billing.",
        { status: 429 },
      );
    }
    return new Response(`Error: ${error?.message}`, { status: 500 });
  }
}
