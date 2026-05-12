import { describe, it, expect } from "vitest";
import { generateUnsubscribeToken, validateUnsubscribeToken } from "../unsubscribe-token";

describe("unsubscribe token", () => {
  it("generates a URL-safe token", () => {
    const token = generateUnsubscribeToken("user@example.com");
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);
    expect(token).not.toContain("@");
  });

  it("round-trips email through generate/validate", () => {
    const token = generateUnsubscribeToken("test@example.com");
    const result = validateUnsubscribeToken(token);
    expect(result?.email).toBe("test@example.com");
  });

  it("returns null for invalid token", () => {
    expect(validateUnsubscribeToken("invalid")).toBeNull();
  });
});