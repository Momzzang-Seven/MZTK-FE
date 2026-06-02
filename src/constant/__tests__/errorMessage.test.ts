import { describe, expect, it } from "vitest";

import {
  getKoreanErrorMessage,
  getKoreanErrorMessageFromError,
} from "../errorMessage";

describe("getKoreanErrorMessage", () => {
  it("translates marketplace Web3 disabled errors", () => {
    const message = getKoreanErrorMessage(
      "MARKETPLACE_033",
      "Marketplace Web3 execution is disabled"
    );

    expect(message).toContain("마켓플레이스 결제 기능");
    expect(message).not.toContain("Marketplace Web3 execution is disabled");
  });

  it("translates marketplace escrow deadline errors", () => {
    const message = getKoreanErrorMessage(
      "MARKETPLACE_038",
      "Reservation completion window does not fit before the marketplace escrow deadline"
    );

    expect(message).toContain("예약 가능한 결제 기한");
    expect(message).not.toContain("Reservation completion window");
  });

  it("does not expose unknown plain English server messages", () => {
    const message = getKoreanErrorMessage(null, "Unexpected internal failure");

    expect(message).toBe(
      "요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
    );
  });

  it("uses the provided fallback when an error has no server message", () => {
    expect(getKoreanErrorMessageFromError({}, "로그인에 실패했습니다.")).toBe(
      "로그인에 실패했습니다."
    );
  });
});
