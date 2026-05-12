// src/lib/mail.ts
import nodemailer from "nodemailer";
import crypto from "crypto";

export { buildDigestHtml } from "./digest-html";

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
    "hex"
  );
  if (key.length !== 32) {
    return { sent: false, error: "MAIL_ENCRYPTION_KEY must be 32 bytes (64 hex chars)" };
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
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return { sent: false, error: message };
  }
}
