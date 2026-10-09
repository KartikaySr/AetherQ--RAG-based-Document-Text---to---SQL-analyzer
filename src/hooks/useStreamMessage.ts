"use client";

import { useCallback, useEffect, useRef } from "react";

type StreamChunk = { content?: string; chunks?: string; error?: string };

type StreamOptions = {
  onChunk: (chunk: StreamChunk) => void;
  onComplete: () => void;
  onError: (error: Error) => void;
};

function parseSseLine(line: string): StreamChunk | "[DONE]" | Error | null {
  if (!line.startsWith("data: ")) return null;
  const data = line.slice(6).trim();
  if (!data) return null;
  if (data === "[DONE]") return "[DONE]";

  try {
    const parsed = JSON.parse(data) as StreamChunk;
    if (parsed.error !== undefined && String(parsed.error).length > 0) {
      return new Error(String(parsed.error));
    }
    if (
      parsed.content !== undefined ||
      parsed.chunks !== undefined
    ) {
      return parsed;
    }
    return null;
  } catch {
    // Ignore malformed SSE JSON lines
    return null;
  }
}

export function useStreamMessage() {
  const activeRequest = useRef<AbortController | null>(null);
  useEffect(() => () => activeRequest.current?.abort(), []);
  const stream = useCallback(
    async (url: string, body: object, options: StreamOptions) => {
      activeRequest.current?.abort();
      const controller = new AbortController();
      activeRequest.current = controller;
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

      const processLines = (lines: string[]) => {
        if (terminal) return;
        let aggregatedContent = "";
        let latestChunksStr: string | undefined = undefined;
        let completeCalled = false;
        let errorToEmit: Error | null = null;

        for (const line of lines) {
          if (!line.trim()) continue;
          const parsed = parseSseLine(line);

          if (parsed === "[DONE]") {
            completeCalled = true;
            break;
          } else if (parsed instanceof Error) {
            errorToEmit = parsed;
            break;
          } else if (parsed) {
            if (parsed.content) aggregatedContent += parsed.content;
            if (parsed.chunks) latestChunksStr = parsed.chunks;
          }
        }

        if (aggregatedContent || latestChunksStr) {
          options.onChunk({
            content: aggregatedContent || undefined,
            chunks: latestChunksStr,
          });
        }

        if (errorToEmit) {
          fail(errorToEmit);
        } else if (completeCalled) {
          complete();
        }
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          signal: controller.signal,
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

        while (!terminal) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          processLines(lines);
        }

        if (!terminal && buffer.trim()) {
          processLines(buffer.split("\n"));
        }

        if (!terminal) fail(new Error("The response ended early. Please retry."));
        await reader.cancel();
      } catch (error) {
        if (controller.signal.aborted) return;
        fail(error instanceof Error ? error : new Error(String(error)));
      }
    },
    []
  );

  return { stream };
}
