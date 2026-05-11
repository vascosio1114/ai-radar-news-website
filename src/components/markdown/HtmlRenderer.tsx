"use client";

interface HtmlRendererProps {
  content: string;
}

export default function HtmlRenderer({ content }: HtmlRendererProps) {
  return (
    <div className="prose prose-ink dark:prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}
