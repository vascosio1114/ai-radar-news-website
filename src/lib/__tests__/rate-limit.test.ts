import { describe, it, expect } from "vitest";
import { checkRateLimit } from "../rate-limit";

describe("rate limiter", () => {
  it("allows first request", () => {
    const result = checkRateLimit("192.168.1.1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it("blocks after 5 requests in window", () => {
    const ip = "10.0.0.1";
    for (let i = 0; i < 5; i++) checkRateLimit(ip);
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(false);
  });
});
