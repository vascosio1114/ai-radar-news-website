import { renderDigestTemplate } from "./digest-template";

export type ArticleForDigest = {
  title: string;
  excerpt: string;
  url: string;
  published_at: string;
  cover_image?: string;
  email_content?: string; // email-optimized HTML body (preferred)
  content_html?: string;  // stored article HTML (fallback when email_content is absent)
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      case "'": return "&#39;";
      default: return c;
    }
  });
}

export function buildDigestHtml(params: {
  headerHtml: string;
  footerHtml: string;
  articles: ArticleForDigest[];
  emailBodyTemplate?: string;
  dateStr?: string;
  unsubscribeUrl?: string;
  contentMode?: "excerpt" | "full_content";
}): string {
  const { headerHtml, footerHtml, articles, emailBodyTemplate, dateStr, unsubscribeUrl, contentMode = "excerpt" } = params;

  const articleRows = articles
    .map((a) => {
      const imgTag = a.cover_image
        ? `<img src="${a.cover_image}" alt="${a.title}" style="max-width:100%;border-radius:8px;margin-bottom:12px;" />`
        : "";
      const date = new Date(a.published_at).toLocaleDateString("zh-HK", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      let articleBody: string;
      if (contentMode === "full_content" && a.email_content) {
        articleBody = a.email_content;
      } else if (contentMode === "full_content" && (a as any).content_html) {
        // Fallback: use content_html (stored article HTML) when email_content is not set
        articleBody = (a as any).content_html as string;
      } else {
        articleBody = `<p style="margin:0;color:#333;font-size:15px;">${escapeHtml(a.excerpt)}</p>`;
      }

      return `
        <div style="margin-bottom:32px;">
          ${imgTag}
          <h3 style="margin:0 0 8px;font-size:18px;"><a href="${a.url}" style="color:#1a1a1a;text-decoration:none;">${a.title}</a></h3>
          <p style="margin:0 0 8px;color:#666;font-size:14px;">${date}</p>
          ${articleBody}
          <a href="${a.url}" style="display:inline-block;margin-top:12px;font-size:14px;color:#2563eb;text-decoration:none;">Read more →</a>
        </div>
      `;
    })
    .join("<hr style='border:none;border-top:1px solid #eee;margin:24px 0;' />");

  if (emailBodyTemplate) {
    return renderDigestTemplate(emailBodyTemplate, {
      articles: articleRows,
      header: headerHtml,
      footer: footerHtml,
      date: dateStr ?? "",
      unsubscribe_url: unsubscribeUrl ?? "",
    });
  }

  return `
    <!DOCTYPE html>
    <html>
    <body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a;background:#f9f9f9;">
      <div style="background:#fff;border-radius:12px;padding:32px;">
        ${headerHtml}
        ${articleRows}
        ${footerHtml}
      </div>
    </body>
    </html>
  `;
}
