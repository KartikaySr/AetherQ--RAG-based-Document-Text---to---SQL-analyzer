import { NextRequest } from "next/server";
import Groq from "groq-sdk";

import { GROQ_CHAT_MODEL } from "@/lib/groqModel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured.");
  }

  return new Groq({ apiKey });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      message,
      analyticsContext,
      retrievalContext,
    }: {
      message?: string;
      analyticsContext?: string;
      retrievalContext?: string;
    } = body;

    if (!message || !message.trim()) {
      return new Response(
        JSON.stringify({
          error: "Message is required",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    let systemPrompt = `
You are AetherQ, an enterprise AI intelligence system built by Mindineers Labs.

Your responsibilities:
- Answer professionally and clearly
- Help with analytics, enterprise reasoning, and documents
- Use provided SQL and retrieval context when available
- Keep answers concise but intelligent
- Format responses in markdown
`;

    if (analyticsContext) {
      systemPrompt += `

SQL ANALYTICS CONTEXT:
${analyticsContext}
`;
    }

    if (retrievalContext) {
      systemPrompt += `

DOCUMENT RETRIEVAL CONTEXT:
${retrievalContext}
`;
    }

    const completion = await getGroqClient().chat.completions.create({
      model: GROQ_CHAT_MODEL,
      temperature: 0.7,
      max_tokens: 2048,
      stream: true,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const content =
              chunk.choices?.[0]?.delta?.content || "";

            if (content) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({
                    content,
                  })}\n\n`
                )
              );
            }
          }

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                done: true,
              })}\n\n`
            )
          );

          controller.close();
        } catch (streamError) {
          console.error("Streaming error:", streamError);

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: "Streaming failed",
              })}\n\n`
            )
          );

          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("CHAT API ERROR:", error);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
