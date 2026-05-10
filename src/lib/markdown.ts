export interface TocItem {
  id: string;
  text: string;
  level: number; // 2 for ##, 3 for ###
}

/**
 * Parses markdown content and extracts headings as TocItem[].
 */
export function parseMarkdownHeadings(content: string): TocItem[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm;
  const items: TocItem[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

    items.push({ id, text, level });
  }

  return items;
}