import { describe, it, expect } from "vitest";
import { buildConfirmationHtml, buildUnsubscribeHtml } from "../email-templates";

describe("email templates", () => {
  it("buildConfirmationHtml contains confirm link", () => {
    const html = buildConfirmationHtml({ confirmUrl: "https://ai-radar.com/api/confirm/abc123", lang: "zh" });
    expect(html).toContain("abc123");
  });

  it("buildUnsubscribeHtml contains unsub link", () => {
    const html = buildUnsubscribeHtml({ unsubscribeUrl: "https://ai-radar.com/api/unsubscribe/xyz", lang: "zh" });
    expect(html).toContain("xyz");
  });
});