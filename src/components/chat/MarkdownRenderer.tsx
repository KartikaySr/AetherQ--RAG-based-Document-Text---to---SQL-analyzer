"use client";

import type { ComponentPropsWithoutRef } from "react";
import type { ExtraProps } from "react-markdown";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

type MarkdownCodeProps = ComponentPropsWithoutRef<"code"> &
  ExtraProps & {
    /** Set by react-markdown for fenced vs inline code */
    inline?: boolean;
  };

type MarkdownRendererProps = {
  content: string;
};

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Pre-process <redacted> tags into markdown strikethrough so we can style them
  const processedContent = content.replace(/<redacted>([\s\S]*?)<\/redacted>/g, '~~$1~~');

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        // Headings
        h1: ({ children }) => (
          <h1 className="mb-4 text-3xl font-bold leading-tight text-white">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-3 mt-6 text-2xl font-bold leading-tight text-white">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-3 mt-5 text-xl font-semibold text-white">
            {children}
          </h3>
        ),
        h4: ({ children }) => (
          <h4 className="mb-2 mt-4 text-lg font-semibold text-white">
            {children}
          </h4>
        ),
        h5: ({ children }) => (
          <h5 className="mb-2 mt-3 font-semibold text-white">
            {children}
          </h5>
        ),
        h6: ({ children }) => (
          <h6 className="mb-2 mt-3 text-sm font-semibold text-white">
            {children}
          </h6>
        ),

        // Paragraphs
        p: ({ children }) => (
          <p className="mb-4 leading-7 text-white/80">
            {children}
          </p>
        ),

        // Lists
        ul: ({ children }) => (
          <ul className="mb-4 ml-6 space-y-2">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-4 ml-6 space-y-2">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="list-disc text-white/80">
            {children}
          </li>
        ),

        // Code blocks
        code: ({ inline, children, className }: MarkdownCodeProps) => {
          const language = className?.replace("language-", "") || "text";

          if (inline) {
            return (
              <code className="rounded bg-white/10 px-2 py-1 font-mono text-sm text-emerald-300">
                {children}
              </code>
            );
          }

          return (
            <div className="mb-4 overflow-x-auto rounded-xl border border-white/10 bg-black/50">
              <SyntaxHighlighter
                language={language}
                style={atomDark}
                customStyle={{
                  padding: "1rem",
                  margin: 0,
                  backgroundColor: "transparent",
                  fontSize: "0.875rem",
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            </div>
          );
        },

        // Blockquotes
        blockquote: ({ children }) => (
          <blockquote className="mb-4 border-l-4 border-emerald-500 bg-white/5 py-3 pl-4 text-white/70 italic">
            {children}
          </blockquote>
        ),

        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 underline hover:text-emerald-300 transition"
          >
            {children}
          </a>
        ),

        // Horizontal rule
        hr: () => (
          <hr className="my-6 border-white/10" />
        ),

        // Tables
        table: ({ children }) => (
          <div className="mb-4 overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-sm text-white/80">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="border-b border-white/10 bg-white/5">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-white/5">
            {children}
          </tbody>
        ),
        tr: ({ children }) => (
          <tr className="divide-x divide-white/5 hover:bg-white/[0.02]">
            {children}
          </tr>
        ),
        td: ({ children }) => (
          <td className="px-4 py-3">
            {children}
          </td>
        ),
        th: ({ children }) => (
          <th className="px-4 py-3 text-left font-semibold text-white">
            {children}
          </th>
        ),

        // Strong and emphasis
        strong: ({ children }) => (
          <strong className="font-semibold text-white">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-white/90">
            {children}
          </em>
        ),

        // Redacted content (mapped from ~~)
        del: ({ children }) => (
          <span className="relative group cursor-pointer inline-flex mx-1" title="Click or hover to reveal classified data">
            <span className="bg-white/10 text-transparent blur-[4px] group-hover:blur-none group-hover:text-red-400 group-active:blur-none group-active:text-red-400 transition-all duration-300 select-none group-hover:select-auto px-1.5 rounded font-mono text-sm border border-white/5">
              {children}
            </span>
            <span className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 group-active:opacity-0 transition-opacity pointer-events-none">
              <span className="text-[9px] font-bold uppercase tracking-widest text-red-500/80">Redacted</span>
            </span>
          </span>
        ),
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
