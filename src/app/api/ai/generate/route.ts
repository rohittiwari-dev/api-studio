import { generateText, Output } from "ai";
import { z } from "zod";
import { aiModel } from "@/lib/ai";

export const runtime = "edge";

const paramsSchema = z.object({
  params: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
      description: z.string().optional(),
    }),
  ),
});

const headersSchema = z.object({
  headers: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
      description: z.string().optional(),
    }),
  ),
});

const bodySchema = z.object({
  body: z.string().describe("The request body as a JSON string"),
  contentType: z
    .enum([
      "application/json",
      "application/x-www-form-urlencoded",
      "text/plain",
      "application/xml",
    ])
    .describe("Suggested content type"),
});

const websocketSavedSchema = z.object({
  messages: z
    .array(
      z.object({
        name: z
          .string()
          .describe(
            "Concise predefined label for the message packet (e.g., 'Authenticate', 'Ping')",
          ),
        content: z
          .string()
          .describe(
            "The actual message payload as a properly formatted JSON or plain text string",
          ),
      }),
    )
    .describe("Array of mock WebSocket payloads"),
});

const socketioSavedSchema = z.object({
  messages: z
    .array(
      z.object({
        name: z
          .string()
          .describe(
            "Concise predefined label for the message packet (e.g., 'Broadcast Auth', 'Join Room')",
          ),
        eventName: z.string().describe("The Socket.IO event name to emit"),
        args: z
          .array(
            z.object({
              content: z
                .string()
                .describe(
                  "The argument payload string (properly formatted JSON or plain text)",
                ),
            }),
          )
          .describe("Ordered array of arguments to send with the event"),
      }),
    )
    .describe("Array of mock Socket.IO payloads"),
});

interface GenerateRequest {
  type:
    | "params"
    | "headers"
    | "body"
    | "body_formdata"
    | "saved_messages_websocket"
    | "saved_messages_socketio";
  context: {
    url?: string;
    method?: string;
    description?: string;
    existingValues?: unknown;
  };
}

export async function POST(req: Request) {
  const body = (await req.json()) as GenerateRequest;
  const { type, context } = body;

  const baseContext = `
API Request Context:
- Method: ${context.method || "GET"}
- URL: ${context.url || ""}
${context.description ? `- Description: ${context.description}` : ""}
${context.existingValues ? `- Existing values: ${JSON.stringify(context.existingValues)}` : ""}
  `.trim();

  try {
    if (type === "params") {
      const { output } = await generateText({
        model: aiModel,
        output: Output.object({ schema: paramsSchema }),
        prompt: `${baseContext}

Generate relevant URL query parameters for this API request. Include common useful params based on the URL pattern and method. Return real, practical values not placeholders where possible.`,
      });
      return Response.json({ success: true, data: output });
    }

    if (type === "headers") {
      const { output } = await generateText({
        model: aiModel,
        output: Output.object({ schema: headersSchema }),
        prompt: `${baseContext}

Generate appropriate HTTP request headers for this API request. Include:
- Content-Type if needed
- Accept header
- Authorization header with placeholder if this looks like an authenticated endpoint
- Any other relevant headers based on the URL/method

Return practical default values.`,
      });
      return Response.json({ success: true, data: output });
    }

    if (type === "body") {
      const { output } = await generateText({
        model: aiModel,
        output: Output.object({ schema: bodySchema }),
        prompt: `${baseContext}

Generate a realistic request body for this ${context.method} request. 
- Infer the expected shape from the URL pattern (e.g., /users → user object, /orders → order object)
- Use realistic placeholder values
- Return as a properly formatted JSON string`,
      });
      return Response.json({ success: true, data: output });
    }

    if (type === "body_formdata") {
      const { output } = await generateText({
        model: aiModel,
        output: Output.object({ schema: paramsSchema }),
        prompt: `${baseContext}

Generate an array of key-value pairs representing the fields of a FormData or url-encoded body payload for this API request. 
Provide realistic placeholder form values based on the endpoint context.`,
      });
      return Response.json({ success: true, data: output });
    }

    if (type === "saved_messages_websocket") {
      const { output } = await generateText({
        model: aiModel,
        output: Output.object({ schema: websocketSavedSchema }),
        prompt: `${context.description ? `- Prompt: ${context.description}` : "Generate common mock event templates."}

You are generating a batch set of useful WebSocket message payloads to be rapidly sent by a developer.
Provide a mix of varied templates that perfectly match the user's prompt (e.g., creating 3 distinct authentication envelopes, or 5 fake data streams).
Ensure the 'content' string is incredibly robust and ready to be directly pumped over a WebSocket connection.`,
      });
      return Response.json({ success: true, data: output });
    }

    if (type === "saved_messages_socketio") {
      const { output } = await generateText({
        model: aiModel,
        output: Output.object({ schema: socketioSavedSchema }),
        prompt: `${context.description ? `- Prompt: ${context.description}` : "Generate common mock event templates."}

You are generating a batch set of useful Socket.IO event payloads to be rapidly emitted by a developer.
Provide a mix of varied templates that brilliantly match the user's explicit instructions.
Each payload MUST include a realistic \`eventName\` along with a highly detailed, dynamically typed \`args\` array.
Ensure the 'content' of each specific argument is stringified flawlessly and ready to be parsed or utilized for testing.`,
      });
      return Response.json({ success: true, data: output });
    }

    return Response.json(
      { success: false, error: "Invalid type" },
      { status: 400 },
    );
  } catch (error: any) {
    // Check for rate limiting / quota errors
    const isRateLimit =
      error?.statusCode === 429 ||
      error?.status === 429 ||
      error?.message?.toLowerCase().includes("quota");

    if (isRateLimit) {
      return Response.json(
        {
          success: false,
          error:
            "AI Quota Exceeded. Please check your Gemini API plan and billing.",
        },
        { status: 429 },
      );
    }

    return Response.json(
      { success: false, error: error?.message || "AI generation failed" },
      { status: 500 },
    );
  }
}
