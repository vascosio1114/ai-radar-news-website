import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const body = `# ${SITE_NAME}

${SITE_DESCRIPTION}

## Core Pages

- Homepage: ${SITE_URL}/en | ${SITE_URL}/zh
- AI Blog: ${SITE_URL}/en/news | ${SITE_URL}/zh/news
- AI Tools: ${SITE_URL}/en/tools | ${SITE_URL}/zh/tools
- Tutorials: ${SITE_URL}/en/tutorials | ${SITE_URL}/zh/tutorials
- Resources: ${SITE_URL}/en/resources | ${SITE_URL}/zh/resources
- RSS: ${SITE_URL}/rss.xml

## Suggested Summary

Radar AI Studio is an AI intelligence website publishing AI articles, tool directories, tutorials, practical resources, and trend analysis.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
