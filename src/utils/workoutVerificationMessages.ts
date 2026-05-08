import axios from "axios";
import type {
  FailureCode,
  RejectionReasonCode,
  SubmitWorkoutVerificationResponse,
  TodayWorkoutCompletionResponse,
  VerificationKind,
} from "@services/verification";

export type WorkoutVerificationMode = "exercise" | "record";

interface VerificationApiError {
  code?: string;
  message?: string;
}

type LatestWorkoutVerification = NonNullable<
  TodayWorkoutCompletionResponse["latestVerification"]
>;

const PHOTO_REJECTION_MESSAGES: Partial<Record<RejectionReasonCode, string>> = {
  SCREEN_OR_UI: "화면이나 UI가 아닌 실제 운동 사진을 올려 주세요.",
  NO_PERSON_VISIBLE: "운동하는 사람이 보이는 사진을 올려 주세요.",
  EQUIPMENT_ONLY: "기구만 찍힌 사진 말고 운동 장면이 보이는 사진이 필요합니다.",
  INSUFFICIENT_WORKOUT_CONTEXT:
    "운동 직후이거나 운동 중이라는 맥락이 보이는 사진을 올려 주세요.",
  LOW_CONFIDENCE: "사진을 명확하게 분석하기 어려워요. 다시 촬영해 주세요.",
  MISSING_EXIF_METADATA: "촬영 정보가 포함된 원본 사진으로 다시 시도해 주세요.",
  EXIF_DATE_MISMATCH: "오늘 촬영한 운동 사진으로 다시 인증해 주세요.",
};

const RECORD_REJECTION_MESSAGES: Partial<Record<RejectionReasonCode, string>> =
  {
    NOT_WORKOUT_RECORD:
      "운동 기록 화면이 아닌 것 같아요. 기록 화면을 올려 주세요.",
    DATE_NOT_VISIBLE: "운동 날짜가 선명하게 보이는 기록 화면을 올려 주세요.",
    DATE_MISMATCH: "오늘 운동 기록 화면이 맞는지 다시 확인해 주세요.",
    LOW_CONFIDENCE:
      "기록 화면을 명확하게 분석하기 어려워요. 다시 캡처해 주세요.",
  };

const FAILURE_MESSAGES: Record<FailureCode, string> = {
  EXTERNAL_AI_TIMEOUT:
    "인증 분석 시간이 초과되었어요. 잠시 후 다시 시도해 주세요.",
  EXTERNAL_AI_UNAVAILABLE:
    "인증 분석 서비스를 일시적으로 사용할 수 없어요. 다시 시도해 주세요.",
  EXTERNAL_AI_MALFORMED_RESPONSE:
    "인증 분석 결과를 해석하지 못했어요. 다시 시도해 주세요.",
  AI_RESPONSE_SCHEMA_INVALID:
    "인증 분석 결과 형식이 올바르지 않아요. 다시 시도해 주세요.",
  ORIGINAL_IMAGE_READ_FAILED:
    "업로드한 이미지를 읽지 못했어요. 다른 이미지로 시도해 주세요.",
  IMAGE_DECODE_FAILED: "이미지 해석에 실패했어요. 다시 업로드해 주세요.",
  ANALYSIS_IMAGE_GENERATION_FAILED:
    "분석용 이미지를 만들지 못했어요. 잠시 후 다시 시도해 주세요.",
};

const REQUEST_ERROR_MESSAGES: Record<string, string> = {
  VERIFICATION_001: "업로드 정보가 올바르지 않습니다. 다시 업로드해 주세요.",
  VERIFICATION_002:
    "인증에 사용할 수 없는 이미지 형식입니다. 다른 파일로 다시 시도해 주세요.",
  VERIFICATION_003: "업로드한 파일을 찾을 수 없습니다. 다시 업로드해 주세요.",
  VERIFICATION_004: "업로드한 파일에 접근할 수 없습니다. 다시 업로드해 주세요.",
  VERIFICATION_005: "인증 요청 종류가 올바르지 않습니다. 다시 시도해 주세요.",
  VERIFICATION_006: "오늘 운동 인증은 이미 완료되었습니다.",
  VERIFICATION_007: "인증 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
};

const DETAIL_MESSAGE_TRANSLATIONS: Record<string, string> = {
  "EXIF metadata is required":
    "촬영 정보가 포함된 원본 사진으로 다시 시도해 주세요.",
  "EXIF shot date must be today in KST":
    "오늘 촬영한 원본 사진으로 다시 인증해 주세요.",
  "visible date is not today":
    "오늘 날짜가 보이는 기록 화면으로 다시 업로드해 주세요.",
  "visible date does not match today in KST":
    "오늘 날짜가 보이는 기록 화면으로 다시 업로드해 주세요.",
};

const REQUEST_MESSAGE_TRANSLATIONS: Record<string, string> = {
  "Invalid tmp object key":
    "업로드 정보가 올바르지 않습니다. 다시 업로드해 주세요.",
  "Invalid image extension for verification":
    "인증에 사용할 수 없는 이미지 형식입니다. 다른 파일로 다시 시도해 주세요.",
  "Upload not found": "업로드한 파일을 찾을 수 없습니다. 다시 업로드해 주세요.",
  "Upload does not belong to user":
    "업로드한 파일에 접근할 수 없습니다. 다시 업로드해 주세요.",
  "Verification kind does not match existing request":
    "인증 요청 종류가 올바르지 않습니다. 다시 시도해 주세요.",
  "Workout already completed today": "오늘 운동 인증은 이미 완료되었습니다.",
  "Verification not found": "인증 정보를 찾을 수 없습니다. 다시 시도해 주세요.",
};

const DEFAULT_REJECTION_MESSAGE = "인증 기준에 맞는 이미지를 다시 올려 주세요.";
const DEFAULT_ERROR_MESSAGE =
  "운동 인증 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.";

const getModeFromKind = (
  verificationKind: VerificationKind
): WorkoutVerificationMode =>
  verificationKind === "WORKOUT_RECORD" ? "record" : "exercise";

const translateVerificationDetail = (detail: string | null) => {
  if (!detail) {
    return null;
  }

  return DETAIL_MESSAGE_TRANSLATIONS[detail] ?? detail;
};

const translateRequestMessage = (code?: string, message?: string) => {
  if (code && REQUEST_ERROR_MESSAGES[code]) {
    return REQUEST_ERROR_MESSAGES[code];
  }

  if (message && REQUEST_MESSAGE_TRANSLATIONS[message]) {
    return REQUEST_MESSAGE_TRANSLATIONS[message];
  }

  return message ?? null;
};

const getRejectedMessage = (
  mode: WorkoutVerificationMode,
  rejectionReasonCode: RejectionReasonCode | null,
  rejectionReasonDetail: string | null
) => {
  const messageMap =
    mode === "record" ? RECORD_REJECTION_MESSAGES : PHOTO_REJECTION_MESSAGES;
  const baseMessage =
    (rejectionReasonCode && messageMap[rejectionReasonCode]) ||
    DEFAULT_REJECTION_MESSAGE;
  const translatedDetail = translateVerificationDetail(rejectionReasonDetail);

  return translatedDetail && translatedDetail !== baseMessage
    ? `${baseMessage} ${translatedDetail}`
    : baseMessage;
};

export const getWorkoutVerificationErrorMessage = (
  mode: WorkoutVerificationMode,
  result: SubmitWorkoutVerificationResponse
) => {
  if (result.verificationStatus === "REJECTED") {
    return getRejectedMessage(
      mode,
      result.rejectionReasonCode,
      result.rejectionReasonDetail
    );
  }

  if (result.verificationStatus === "FAILED" && result.failureCode) {
    return FAILURE_MESSAGES[result.failureCode] ?? DEFAULT_ERROR_MESSAGE;
  }

  if (
    result.verificationStatus === "VERIFIED" &&
    result.rewardStatus !== "SUCCEEDED"
  ) {
    return "운동 인증은 완료되었지만 보상 반영에 실패했어요. 잠시 후 다시 시도해 주세요.";
  }

  if (
    result.verificationStatus === "PENDING" ||
    result.verificationStatus === "ANALYZING"
  ) {
    return "인증 요청이 접수되었어요. 잠시 후 다시 확인해 주세요.";
  }

  return DEFAULT_ERROR_MESSAGE;
};

export const getWorkoutVerificationLatestErrorMessage = (
  latestVerification: LatestWorkoutVerification
) => {
  const mode = getModeFromKind(latestVerification.verificationKind);

  if (latestVerification.verificationStatus === "REJECTED") {
    return getRejectedMessage(
      mode,
      latestVerification.rejectionReasonCode,
      null
    );
  }

  if (
    latestVerification.verificationStatus === "FAILED" &&
    latestVerification.failureCode
  ) {
    return (
      FAILURE_MESSAGES[latestVerification.failureCode] ?? DEFAULT_ERROR_MESSAGE
    );
  }

  return DEFAULT_ERROR_MESSAGE;
};

export const getWorkoutVerificationRequestErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as VerificationApiError | undefined;
    const translatedMessage = translateRequestMessage(
      payload?.code,
      payload?.message
    );

    return (
      translatedMessage ??
      translateRequestMessage(undefined, error.message) ??
      DEFAULT_ERROR_MESSAGE
    );
  }

  if (error instanceof Error && error.message) {
    return translateRequestMessage(undefined, error.message) ?? error.message;
  }

  return DEFAULT_ERROR_MESSAGE;
};
