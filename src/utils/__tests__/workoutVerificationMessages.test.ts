import { describe, expect, it } from "vitest";
import type {
  FailureCode,
  RejectionReasonCode,
  SubmitWorkoutVerificationResponse,
} from "@services/verification";
import {
  getWorkoutVerificationErrorMessage,
  getWorkoutVerificationLatestErrorMessage,
} from "@utils/workoutVerificationMessages";

const baseRejectedResult = (
  rejectionReasonCode: RejectionReasonCode,
  rejectionReasonDetail: string | null = null
): SubmitWorkoutVerificationResponse => ({
  verificationId: "verification-test",
  verificationKind: "WORKOUT_PHOTO",
  verificationStatus: "REJECTED",
  rewardStatus: "NOT_REQUESTED",
  exerciseDate: null,
  completionStatus: "NOT_COMPLETED",
  grantedXp: 0,
  completedMethod: null,
  rejectionReasonCode,
  rejectionReasonDetail,
  failureCode: null,
});

const baseFailedResult = (
  failureCode: FailureCode
): SubmitWorkoutVerificationResponse => ({
  verificationId: "verification-test",
  verificationKind: "WORKOUT_PHOTO",
  verificationStatus: "FAILED",
  rewardStatus: "FAILED",
  exerciseDate: null,
  completionStatus: "NOT_COMPLETED",
  grantedXp: 0,
  completedMethod: null,
  rejectionReasonCode: null,
  rejectionReasonDetail: null,
  failureCode,
});

describe("workoutVerificationMessages", () => {
  it.each([
    ["SCREEN_OR_UI", "화면이나 UI가 아닌 실제 운동 사진을 올려 주세요."],
    ["NO_PERSON_VISIBLE", "운동하는 사람이 보이는 사진을 올려 주세요."],
    [
      "EQUIPMENT_ONLY",
      "기구만 찍힌 사진 말고 운동 장면이 보이는 사진이 필요합니다.",
    ],
    [
      "INSUFFICIENT_WORKOUT_CONTEXT",
      "운동 직후이거나 운동 중이라는 맥락이 보이는 사진을 올려 주세요.",
    ],
    [
      "LOW_CONFIDENCE",
      "사진을 명확하게 분석하기 어려워요. 다시 촬영해 주세요.",
    ],
    [
      "MISSING_EXIF_METADATA",
      "촬영 정보가 포함된 원본 사진으로 다시 시도해 주세요.",
    ],
    ["EXIF_DATE_MISMATCH", "오늘 촬영한 운동 사진으로 다시 인증해 주세요."],
  ] satisfies Array<[RejectionReasonCode, string]>)(
    "shows the photo rejection message for %s",
    (code, message) => {
      expect(
        getWorkoutVerificationErrorMessage("exercise", baseRejectedResult(code))
      ).toBe(message);
    }
  );

  it.each([
    [
      "NOT_WORKOUT_RECORD",
      "운동 기록 화면이 아닌 것 같아요. 기록 화면을 올려 주세요.",
    ],
    [
      "DATE_NOT_VISIBLE",
      "운동 날짜가 선명하게 보이는 기록 화면을 올려 주세요.",
    ],
    ["DATE_MISMATCH", "오늘 운동 기록 화면이 맞는지 다시 확인해 주세요."],
    [
      "LOW_CONFIDENCE",
      "기록 화면을 명확하게 분석하기 어려워요. 다시 캡처해 주세요.",
    ],
  ] satisfies Array<[RejectionReasonCode, string]>)(
    "shows the record rejection message for %s",
    (code, message) => {
      expect(
        getWorkoutVerificationErrorMessage("record", baseRejectedResult(code))
      ).toBe(message);
    }
  );

  it("appends translated rejection detail when it adds new information", () => {
    expect(
      getWorkoutVerificationErrorMessage(
        "record",
        baseRejectedResult("DATE_MISMATCH", "visible date is not today")
      )
    ).toBe(
      "오늘 운동 기록 화면이 맞는지 다시 확인해 주세요. 오늘 날짜가 보이는 기록 화면으로 다시 업로드해 주세요."
    );
  });

  it.each([
    [
      "EXTERNAL_AI_TIMEOUT",
      "인증 분석 시간이 초과되었어요. 잠시 후 다시 시도해 주세요.",
    ],
    [
      "EXTERNAL_AI_UNAVAILABLE",
      "인증 분석 서비스를 일시적으로 사용할 수 없어요. 다시 시도해 주세요.",
    ],
    [
      "EXTERNAL_AI_MALFORMED_RESPONSE",
      "인증 분석 결과를 해석하지 못했어요. 다시 시도해 주세요.",
    ],
    [
      "AI_RESPONSE_SCHEMA_INVALID",
      "인증 분석 결과 형식이 올바르지 않아요. 다시 시도해 주세요.",
    ],
    [
      "ORIGINAL_IMAGE_READ_FAILED",
      "업로드한 이미지를 읽지 못했어요. 다른 이미지로 시도해 주세요.",
    ],
    ["IMAGE_DECODE_FAILED", "이미지 해석에 실패했어요. 다시 업로드해 주세요."],
    [
      "ANALYSIS_IMAGE_GENERATION_FAILED",
      "분석용 이미지를 만들지 못했어요. 잠시 후 다시 시도해 주세요.",
    ],
  ] satisfies Array<[FailureCode, string]>)(
    "shows the system failure message for %s",
    (code, message) => {
      expect(
        getWorkoutVerificationErrorMessage("exercise", baseFailedResult(code))
      ).toBe(message);
    }
  );

  it("shows the latest rejected verification message from polling", () => {
    expect(
      getWorkoutVerificationLatestErrorMessage({
        verificationId: "verification-test",
        verificationKind: "WORKOUT_RECORD",
        verificationStatus: "REJECTED",
        rewardStatus: "NOT_REQUESTED",
        rejectionReasonCode: "DATE_NOT_VISIBLE",
        failureCode: null,
      })
    ).toBe("운동 날짜가 선명하게 보이는 기록 화면을 올려 주세요.");
  });
});
