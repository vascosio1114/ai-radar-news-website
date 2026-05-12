import { describe, it, expect } from "vitest";
import { encryptPassword, decryptPassword } from "../mail";

describe("encryptPassword / decryptPassword", () => {
  const key = Buffer.alloc(32, "a".charCodeAt(0));
  const plaintext = "my-gmail-password";

  it("encrypts and decrypts correctly", () => {
    const encrypted = encryptPassword(plaintext, key);
    expect(encrypted).not.toBe(plaintext);
    const decrypted = decryptPassword(encrypted, key);
    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertext each time (random IV)", () => {
    const enc1 = encryptPassword(plaintext, key);
    const enc2 = encryptPassword(plaintext, key);
    expect(enc1).not.toBe(enc2);
  });
});