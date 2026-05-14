import { NextResponse } from "next/server";

import { createAuthErrorResponse, getUserFromRequest } from "@/lib/auth-helpers";
import { GROQ_CHAT_MODEL } from "@/lib/groqModel";

const SYSTEM_BASE =
  "You are AetherQ, an advanced enterprise AI platform created under Mindineers Labs. You answer intelligently, professionally, and conversationally with markdown formatting (headings, bullets, tables when useful). When document retrieval context is provided, ground statements in those excerpts and note when information is missing. When analytics context includes SQL summaries or sample rows, interpret them faithfully without inventing extra numbers.";

export async function POST(req: Request) {
  try {
    const { user } = await getUserFromRequest();
    if (!user) {
      return createAuthErrorResponse();
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "AI assistant is temporarily unavailable." },
        { status: 503 }
      );
    }

    const body = (await req.json()) as {
      message?: string;
      analyticsContext?: string;
      retrievalContext?: string;
    };
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const analyticsContext =
      typeof body.analyticsContext === "string"
        ? body.analyticsContext.slice(0, 14000).trim()
        : "";
    const retrievalContext =
      typeof body.retrievalContext === "string"
        ? body.retrievalContext.slice(0, 14000).trim()
        : "";

    const systemPieces = [SYSTEM_BASE];
    if (analyticsContext) {
      systemPieces.push(
        "## Warehouse analytics context\n" +
          analyticsContext +
          "\nInterpret carefully; totals may be truncated."
      );
    }
    if (retrievalContext) {
      systemPieces.push(
        "## Verified document excerpts\n" +
          retrievalContext +
          "\nCite or quote lightly when leveraging these passages."
      );
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
              },
              body: JSON.stringify({
                model: GROQ_CHAT_MODEL,
                messages: [
                  {
                    role: "system",
                    content: systemPieces.join("\n\n"),
                  },
                  {
                    role: "user",
                    content: message,
                  },
                ],
                temperature: 0.55,
                max_tokens: 1400,
                stream: true,
              }),
            }
          );

          if (!response.ok) {
            throw new Error(`Groq API error: ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error("No response body");
          }

          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6);

                if (data === "[DONE]") {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  continue;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || "";

                  if (content) {
                    const token = content.replace(/\n/g, "\\n");
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content: token })}\n\n`)
                    );
                  }
                } catch {
                  // Skip malformed lines
                }
              }
            }
          }

          controller.close();
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Chat stream error:", error);
          }
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error:
                  "Something went wrong while generating the response. Please try again.",
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "AetherQ AI server encountered an error.",
      },
      { status: 500 }
    );
  }
}
