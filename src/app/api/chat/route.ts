import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { HfInference } from "@huggingface/inference";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export const maxDuration = 60; // Max duration for edge/serverless functions

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    // Allow guest mode - do not block on missing session

    const { message, analyticsContext, retrievalContext, model = "openai/gpt-oss-20b" } = await req.json();

    let systemPrompt = `You are AetherQ Intelligence, an elite enterprise AI assistant and highly articulate strategic advisor.
You provide exceptionally detailed, comprehensive, and insightful responses. 
Speak with absolute confidence, eloquence, and precision, using sophisticated vocabulary and nuanced reasoning.
Always structure your answers rigorously using Markdown (e.g., layered bullet points, bold emphasis, well-organized headers, and tables where applicable) to make complex data incredibly easy to digest and visually impressive.
Your tone should be authoritative, analytical, and luxurious—akin to a senior partner at a top-tier management consultancy (like McKinsey or BCG). Do not apologize unnecessarily.
If contexts are provided, seamlessly synthesize and integrate them without explicitly stating "based on the context provided".`;

    if (analyticsContext || retrievalContext) {
      systemPrompt += `\n\nUse the following contexts to inform your response. If the context does not have the answer, state that you are answering based on general knowledge.\n`;
      if (analyticsContext) {
        systemPrompt += `\n[ANALYTICS CONTEXT]\n${analyticsContext}\n`;
      }
      if (retrievalContext) {
        systemPrompt += `\n[RETRIEVAL CONTEXT]\n${retrievalContext}\n`;
      }
    }

    const result = streamText({
      model: groq(model),
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            if (chunk) {
              const data = JSON.stringify({ content: chunk });
              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            }
          }
          controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (err: any) {
          const errorData = JSON.stringify({ error: err.message });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
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
  } catch (error: any) {
    console.error("Chat API Error:", error);
    return new Response(error.message || "Something went wrong", {
      status: 500,
    });
  }
}
