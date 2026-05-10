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
              <code className="rounded bg-white/10 px-2 py-1 font-mono text-sm text-cyan-300">
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
          <blockquote className="mb-4 border-l-4 border-cyan-500 bg-white/5 py-3 pl-4 text-white/70 italic">
            {children}
          </blockquote>
        ),

        // Links
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 underline hover:text-cyan-300 transition"
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
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
