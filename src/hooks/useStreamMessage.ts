"use client";

import { useCallback } from "react";

type StreamChunk = { content?: string; chunks?: string; error?: string };

type StreamOptions = {
  onChunk: (chunk: StreamChunk) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
};

function consumeSseLine(
  line: string,
  options: StreamOptions,
  markComplete: () => void,
  markFailed: (err: Error) => void
): void {
  if (!line.startsWith("data: ")) return;

  const data = line.slice(6).trim();

  if (!data || data === "[DONE]") {
    if (data === "[DONE]") markComplete();
    return;
  }

  try {
    const parsed = JSON.parse(data) as StreamChunk;
    if (
      parsed.error !== undefined ||
      parsed.content !== undefined ||
      parsed.chunks !== undefined
    ) {
      if (parsed.error !== undefined && String(parsed.error).length > 0) {
        markFailed(new Error(String(parsed.error)));
        return;
      }
      options.onChunk(parsed);
    }
  } catch {
    // Ignore malformed SSE JSON lines
  }
}

export function useStreamMessage() {
  const stream = useCallback(
    async (url: string, body: object, options: StreamOptions) => {
      let terminal = false;
      const complete = () => {
        if (terminal) return;
        terminal = true;
        options.onComplete();
      };
      const fail = (err: Error) => {
        if (terminal) return;
        terminal = true;
        options.onError(err);
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`
          );
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
            consumeSseLine(line, options, complete, fail);
            if (terminal) break;
          }
          if (terminal) break;
        }

        if (!terminal && buffer.trim()) {
          for (const line of buffer.split("\n")) {
            if (line.trim()) consumeSseLine(line, options, complete, fail);
            if (terminal) break;
          }
        }

        if (!terminal) complete();
      } catch (error) {
        fail(error instanceof Error ? error : new Error(String(error)));
      }
    },
    []
  );

  return { stream };
}
