// src/lib/mail.ts
import nodemailer from "nodemailer";
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

export function encryptPassword(password: string, key: Buffer): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decryptPassword(encrypted: string, key: Buffer): string {
  const [ivB64, authTagB64, dataB64] = encrypted.split(":");
  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const encryptedData = Buffer.from(dataB64, "base64");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export type MailSettings = {
  smtp_host: string;
  smtp_port: number;
  smtp_user: string;
  smtp_pass_encrypted: string;
  smtp_from_address: string;
  smtp_from_name: string;
  daily_enabled: boolean;
  daily_hour: number;
  daily_timezone: string;
  email_subject_template: string;
  email_header_html: string;
  email_footer_html: string;
};

export async function sendHtmlEmail(
  settings: MailSettings,
  to: string,
  subject: string,
  htmlBody: string
): Promise<{ sent: boolean; error?: string }> {
  const key = Buffer.from(
    process.env.MAIL_ENCRYPTION_KEY || "",
    "utf8"
  );
  if (key.length !== 32) {
    return { sent: false, error: "MAIL_ENCRYPTION_KEY must be 32 bytes" };
  }

  const password = decryptPassword(settings.smtp_pass_encrypted, key);

  const transporter = nodemailer.createTransport({
    host: settings.smtp_host,
    port: settings.smtp_port,
    secure: settings.smtp_port === 465,
    auth: {
      user: settings.smtp_user,
      pass: password,
    },
  });

  try {
    await transporter.sendMail({
      from: `"${settings.smtp_from_name}" <${settings.smtp_from_address}>`,
      to,
      subject,
      html: htmlBody,
    });
    return { sent: true };
  } catch (e: any) {
    return { sent: false, error: e.message };
  }
}

export function buildDigestHtml(params: {
  headerHtml: string;
  footerHtml: string;
  articles: Array<{
    title: string;
    excerpt: string;
    url: string;
    published_at: string;
    cover_image?: string;
  }>;
}): string {
  const { headerHtml, footerHtml, articles } = params;

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
      return `
        <div style="margin-bottom:32px;">
          ${imgTag}
          <h3 style="margin:0 0 8px;font-size:18px;"><a href="${a.url}" style="color:#1a1a1a;text-decoration:none;">${a.title}</a></h3>
          <p style="margin:0 0 8px;color:#666;font-size:14px;">${date}</p>
          <p style="margin:0;color:#333;font-size:15px;">${a.excerpt}</p>
          <a href="${a.url}" style="display:inline-block;margin-top:12px;font-size:14px;color:#2563eb;text-decoration:none;">Read more →</a>
        </div>
      `;
    })
    .join("<hr style='border:none;border-top:1px solid #eee;margin:24px 0;' />");

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