"use client";

import DOMPurify from "isomorphic-dompurify";

interface HtmlRendererProps {
  content: string;
}

export default function HtmlRenderer({ content }: HtmlRendererProps) {
  const sanitized = DOMPurify.sanitize(content);
  return (
    <div className="prose prose-ink dark:prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: sanitized }} />
    </div>
  );
}
