import { describe, expect, it } from "vitest";
import { containsHan, hanRatio } from "../pipeline/draft-validation";

describe("pipeline draft language validation helpers", () => {
  it("detects Han characters", () => {
    expect(containsHan("AI safety update")).toBe(false);
    expect(containsHan("AI 安全更新")).toBe(true);
  });

  it("calculates Han character ratio", () => {
    expect(hanRatio("English only")).toBe(0);
    expect(hanRatio("中文")).toBe(1);
    expect(hanRatio("AI 中文")).toBeCloseTo(0.5);
  });
});
