import { describe, it, expect } from "vitest";
import type {
  ModerationStatus,
  PublicationStatus,
  Web3Execution,
  Web3IntentStatus,
} from "@types";
import { getPostStatus, statusStyleMap } from "../parsePostFields";

const createWeb3Execution = (
  resourceStatus: Web3Execution["resource"]["status"] = "COMPLETED",
  intentStatus: Web3IntentStatus = "CONFIRMED"
): Web3Execution => ({
  resource: {
    type: "QUESTION",
    id: "question-1",
    status: resourceStatus,
  },
  actionType: "QNA_QUESTION_CREATE",
  executionIntent: {
    id: "intent-1",
    status: intentStatus,
    expiresAt: "2026-06-02T00:00:00Z",
  },
  execution: {
    mode: "EIP7702",
    signCount: 2,
  },
  signRequest: null,
});

const getStatus = (
  publicationStatus: PublicationStatus,
  moderationStatus: ModerationStatus,
  isSolved: boolean,
  commentCount: number,
  web3Execution = createWeb3Execution()
) =>
  getPostStatus(
    publicationStatus,
    moderationStatus,
    isSolved,
    commentCount,
    web3Execution
  );

describe("getQuestionStatus utils", () => {
  describe("getStatus", () => {
    it('moderationStatus가 BLOCKED이면 "blocked"를 반환한다', () => {
      expect(getStatus("VISIBLE", "BLOCKED", false, 0)).toBe("blocked");
      expect(getStatus("VISIBLE", "BLOCKED", true, 5)).toBe("blocked");
    });

    it('publicationStatus가 PENDING이면 "pending"을 반환한다', () => {
      expect(getStatus("PENDING", "NORMAL", false, 0)).toBe("pending");
      expect(getStatus("PENDING", "NORMAL", true, 5)).toBe("pending");
    });

    it('publicationStatus가 FAILED이면 "failed"를 반환한다', () => {
      expect(getStatus("FAILED", "NORMAL", false, 0)).toBe("failed");
      expect(getStatus("FAILED", "NORMAL", true, 5)).toBe("failed");
    });

    it('publicationStatus가 VISIBLE이고 isSolved가 true이면 "completed"를 반환한다', () => {
      expect(getStatus("VISIBLE", "NORMAL", true, 0)).toBe("completed");
      expect(getStatus("VISIBLE", "NORMAL", true, 5)).toBe("completed");
    });

    it('publicationStatus가 VISIBLE이고 isSolved가 false이고 commentCount가 0이면 "waiting"을 반환한다', () => {
      expect(getStatus("VISIBLE", "NORMAL", false, 0)).toBe("waiting");
    });

    it('publicationStatus가 VISIBLE이고 isSolved가 false이고 commentCount가 1 이상이면 "answering"을 반환한다', () => {
      expect(getStatus("VISIBLE", "NORMAL", false, 1)).toBe("answering");
      expect(getStatus("VISIBLE", "NORMAL", false, 5)).toBe("answering");
      expect(getStatus("VISIBLE", "NORMAL", false, 100)).toBe("answering");
    });

    it('서명이 필요한 Web3 상태이면 "need_signature"를 반환한다', () => {
      expect(
        getStatus(
          "PENDING",
          "NORMAL",
          false,
          0,
          createWeb3Execution("PENDING_EXECUTION")
        )
      ).toBe("need_signature");
      expect(
        getStatus(
          "VISIBLE",
          "NORMAL",
          true,
          0,
          createWeb3Execution("COMPLETED", "AWAITING_SIGNATURE")
        )
      ).toBe("need_signature");
    });

    it("모든 가능한 상태를 반환한다", () => {
      const statuses = [
        getStatus("VISIBLE", "BLOCKED", false, 0),
        getStatus("PENDING", "NORMAL", false, 0),
        getStatus("FAILED", "NORMAL", false, 0),
        getStatus("VISIBLE", "NORMAL", true, 0),
        getStatus("VISIBLE", "NORMAL", false, 0),
        getStatus("VISIBLE", "NORMAL", false, 1),
        getStatus(
          "PENDING",
          "NORMAL",
          false,
          0,
          createWeb3Execution("PENDING_EXECUTION")
        ),
      ];

      expect(statuses).toContain("blocked");
      expect(statuses).toContain("pending");
      expect(statuses).toContain("failed");
      expect(statuses).toContain("completed");
      expect(statuses).toContain("waiting");
      expect(statuses).toContain("answering");
      expect(statuses).toContain("need_signature");
    });
  });

  describe("statusStyleMap", () => {
    it("waiting 상태의 스타일을 정의한다", () => {
      expect(statusStyleMap.waiting).toEqual({
        label: "답변대기",
        bg: "bg-[#F59E0B]",
      });
    });

    it("answering 상태의 스타일을 정의한다", () => {
      expect(statusStyleMap.answering).toEqual({
        label: "답변중",
        bg: "bg-[#9CA3AF]",
      });
    });

    it("completed 상태의 스타일을 정의한다", () => {
      expect(statusStyleMap.completed).toEqual({
        label: "채택완료",
        bg: "bg-[#27DDA1]",
      });
    });

    it("pending 상태의 스타일을 정의한다", () => {
      expect(statusStyleMap.pending).toEqual({
        label: "처리 중",
        bg: "bg-[#9CA3AF]",
      });
    });

    it("failed 상태의 스타일을 정의한다", () => {
      expect(statusStyleMap.failed).toEqual({
        label: "실패",
        bg: "bg-[#EF4444]",
      });
    });

    it("blocked 상태의 스타일을 정의한다", () => {
      expect(statusStyleMap.blocked).toEqual({
        label: "차단됨",
        bg: "bg-[#1F2937]",
      });
    });

    it("unknown 상태의 스타일을 정의한다", () => {
      expect(statusStyleMap.unknown).toEqual({
        label: "상태 확인중",
        bg: "bg-[#E5E7EB]",
      });
    });

    it("need_signature 상태의 스타일을 정의한다", () => {
      expect(statusStyleMap.need_signature).toEqual({
        label: "서명 필요",
        bg: "bg-[#F59E0B]",
      });
    });

    it("모든 상태에 label과 bg 속성이 있다", () => {
      Object.values(statusStyleMap).forEach((style) => {
        expect(style).toHaveProperty("label");
        expect(style).toHaveProperty("bg");
        expect(typeof style.label).toBe("string");
        expect(typeof style.bg).toBe("string");
      });
    });

    it("8개의 상태를 정의한다", () => {
      expect(Object.keys(statusStyleMap)).toHaveLength(8);
    });
  });
});
