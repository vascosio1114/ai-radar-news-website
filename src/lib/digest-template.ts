export type DigestPlaceholders = {
  articles: string;
  header: string;
  footer: string;
  date: string;
  unsubscribe_url: string;
};

export function renderDigestTemplate(
  template: string,
  placeholders: DigestPlaceholders
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return (placeholders as Record<string, string>)[key] ?? match;
  });
}