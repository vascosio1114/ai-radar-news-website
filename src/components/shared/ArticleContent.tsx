"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { Clipboard, Check } from "lucide-react";
import { useState } from "react";
import type { Components } from "react-markdown";

interface ArticleContentProps {
  content: string;
}

function CodeBlock({ children, className, ...props }: React.ComponentPropsWithoutRef<"code">) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const isInline = !match && !className;

  if (isInline) {
    return (
      <code className="rounded bg-ink-200 px-1.5 py-0.5 font-mono text-sm text-accent-700 dark:bg-ink-800 dark:text-accent-300" {...props}>
        {children}
      </code>
    );
  }

  const code = String(children).replace(/\n$/, "");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100 bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-ink-100"
        aria-label="Copy code"
      >
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Clipboard className="h-4 w-4" />}
      </button>
      <code className={className} {...props}>
        {children}
      </code>
    </div>
  );
}

const components: Components = {
  code({ className, children, ...props }) {
    return <CodeBlock className={className} {...props}>{children}</CodeBlock>;
  },

  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-accent-500 pl-4 italic text-ink-600 dark:text-ink-300">
        {children}
      </blockquote>
    );
  },

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

  hr() {
    return <hr className="my-8 border-ink-200 dark:border-ink-700" />;
  },
};

export default function ArticleContent({ content }: ArticleContentProps) {
  return (
    <div className="prose prose-ink dark:prose-invert max-w-none">
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          rehypeSlug,
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
      </Markdown>
    </div>
  );
}