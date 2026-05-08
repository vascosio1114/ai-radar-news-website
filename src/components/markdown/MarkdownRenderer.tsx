"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

const components: Components = {
  // Style code blocks
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const isInline = !match && !className;

    if (isInline) {
      return (
        <code
          className="rounded bg-ink-200 px-1.5 py-0.5 font-mono text-sm text-accent-700 dark:bg-ink-800 dark:text-accent-300"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },

  // Style blockquotes
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-accent-500 pl-4 italic text-ink-600 dark:text-ink-300">
        {children}
      </blockquote>
    );
  },

  // Style tables
  table({ children }) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-ink-200 dark:divide-ink-700">
          {children}
        </table>
      </div>
    );
  },

  th({ children }) {
    return (
      <th className="px-4 py-2 text-left text-sm font-semibold text-ink-700 dark:text-ink-200">
        {children}
      </th>
    );
  },

  td({ children }) {
    return (
      <td className="px-4 py-2 text-sm text-ink-600 dark:text-ink-300">
        {children}
      </td>
    );
  },

  // Style links
  a({ href, children }) {
    return (
      <a
        href={href}
        className="text-accent-600 underline hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  },

  // Style horizontal rule
  hr() {
    return <hr className="my-8 border-ink-200 dark:border-ink-700" />;
  },
};

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-ink dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [
            rehypePrettyCode,
            {
              theme: "github-dark",
              keepBackground: true,
            },
          ],
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}