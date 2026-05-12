import crypto from "crypto";

const TOKEN_SECRET = process.env.MAIL_ENCRYPTION_KEY || "dev-secret-32-chars-xxxxxxxxxxxxxxxx";

export function generateUnsubscribeToken(email: string): string {
  const timestamp = Date.now().toString(36);
  const payload = `${email}:${timestamp}`;
  const hmac = crypto.createHmac("sha256", TOKEN_SECRET);
  const signature = hmac.update(payload).digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export interface UnsubscribePayload {
  email: string;
  iat: number;
}

export function validateUnsubscribeToken(token: string): UnsubscribePayload | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [email, timestampStr, signature] = parts;
    const payload = `${email}:${timestampStr}`;
    const expectedHmac = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
    if (signature !== expectedHmac) return null;
    const iat = parseInt(timestampStr, 36);
    // Expire after 30 days
    if (Date.now() - iat > 30 * 24 * 60 * 60 * 1000) return null;
    return { email, iat };
  } catch {
    return null;
  }
}