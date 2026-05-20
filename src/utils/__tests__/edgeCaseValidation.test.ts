import { describe, expect, it } from "vitest";
import {
  containsUnsafeMarkup,
  isValidKoreanPhoneNumber,
  isValidTokenAmount,
  isWeakPin,
  normalizeNonZeroAddress,
  normalizeOptionalHttpUrl,
  parsePositiveIntegerInput,
  sanitizeTags,
} from "../edgeCaseValidation";

describe("edgeCaseValidation", () => {
  it("rejects rewritten numeric edge cases", () => {
    expect(parsePositiveIntegerInput("999")).toBe(999);
    expect(parsePositiveIntegerInput("-999")).toBeNull();
    expect(parsePositiveIntegerInput("12.5")).toBeNull();
    expect(parsePositiveIntegerInput("0")).toBeNull();
    expect(parsePositiveIntegerInput("1e2")).toBeNull();
  });

  it("validates phone numbers without accepting partial numbers", () => {
    expect(isValidKoreanPhoneNumber("010-1234-5678")).toBe(true);
    expect(isValidKoreanPhoneNumber("02-1234-5678")).toBe(true);
    expect(isValidKoreanPhoneNumber("010")).toBe(false);
    expect(isValidKoreanPhoneNumber("010-1234-5")).toBe(false);
  });

  it("normalizes safe URLs and rejects unsafe protocols", () => {
    expect(normalizeOptionalHttpUrl("example.com")).toBe(
      "https://example.com/"
    );
    expect(() =>
      normalizeOptionalHttpUrl("ftp://example.com/<script>")
    ).toThrow();
    expect(() => normalizeOptionalHttpUrl("javascript:alert(1)")).toThrow();
  });

  it("rejects unsafe token transfer values", () => {
    expect(isValidTokenAmount("1", 10)).toBe(true);
    expect(isValidTokenAmount("1e2", 1000)).toBe(false);
    expect(isValidTokenAmount("0.0000000000000000001", 10)).toBe(false);
    expect(isValidTokenAmount("0", 10)).toBe(false);
    expect(
      normalizeNonZeroAddress("0x0000000000000000000000000000000000000000")
    ).toBeNull();
  });

  it("rejects weak PINs and script-like tags", () => {
    expect(isWeakPin("000000")).toBe(true);
    expect(isWeakPin("123456")).toBe(true);
    expect(isWeakPin("135790")).toBe(false);
    expect(containsUnsafeMarkup("<script>alert(1)</script>")).toBe(true);
    expect(sanitizeTags(["ok", "x".repeat(31), "<script>"])).toEqual(["ok"]);
  });
});
