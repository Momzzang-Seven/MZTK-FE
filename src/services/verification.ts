import { api } from "./client";

export type VerificationKind = "WORKOUT_PHOTO" | "WORKOUT_RECORD";
export type VerificationStatus =
  | "PENDING"
  | "ANALYZING"
  | "VERIFIED"
  | "REJECTED"
  | "FAILED";
export type VerificationRewardStatus =
  | "NOT_REQUESTED"
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED";
export type CompletionStatus = "COMPLETED" | "NOT_COMPLETED";
export type CompletedMethod =
  | "LOCATION"
  | "WORKOUT_PHOTO"
  | "WORKOUT_RECORD"
  | "UNKNOWN";
export type RejectionReasonCode =
  | "MISSING_EXIF_METADATA"
  | "EXIF_DATE_MISMATCH"
  | "SCREEN_OR_UI"
  | "NO_PERSON_VISIBLE"
  | "EQUIPMENT_ONLY"
  | "INSUFFICIENT_WORKOUT_CONTEXT"
  | "LOW_CONFIDENCE"
  | "NOT_WORKOUT_RECORD"
  | "DATE_NOT_VISIBLE"
  | "DATE_MISMATCH";
export type FailureCode =
  | "EXTERNAL_AI_TIMEOUT"
  | "EXTERNAL_AI_UNAVAILABLE"
  | "EXTERNAL_AI_MALFORMED_RESPONSE"
  | "AI_RESPONSE_SCHEMA_INVALID"
  | "ORIGINAL_IMAGE_READ_FAILED"
  | "IMAGE_DECODE_FAILED"
  | "ANALYSIS_IMAGE_GENERATION_FAILED";

export interface SubmitWorkoutVerificationRequest {
  tmpObjectKey: string;
}

export interface SubmitWorkoutVerificationResponse {
  verificationId: string;
  verificationKind: VerificationKind;
  verificationStatus: VerificationStatus;
  rewardStatus: VerificationRewardStatus;
  exerciseDate: string | null;
  completionStatus: CompletionStatus;
  grantedXp: number;
  completedMethod: CompletedMethod | null;
  rejectionReasonCode: RejectionReasonCode | null;
  rejectionReasonDetail: string | null;
  failureCode: FailureCode | null;
}

export interface TodayWorkoutCompletionResponse {
  todayCompleted: boolean;
  completedMethod: CompletedMethod | null;
  rewardGrantedToday: boolean;
  grantedXp: number;
  earnedDate: string | null;
  latestVerification: {
    verificationId: string;
    verificationKind: VerificationKind;
    verificationStatus: VerificationStatus;
    rewardStatus: VerificationRewardStatus;
    rejectionReasonCode: RejectionReasonCode | null;
    failureCode: FailureCode | null;
  } | null;
}

export const verificationService = {
  async submitWorkoutPhoto(
    request: SubmitWorkoutVerificationRequest
  ): Promise<SubmitWorkoutVerificationResponse> {
    const response = await api.post("/verification/photo", request);
    return response.data.data;
  },

  async submitWorkoutRecord(
    request: SubmitWorkoutVerificationRequest
  ): Promise<SubmitWorkoutVerificationResponse> {
    const response = await api.post("/verification/record", request);
    return response.data.data;
  },

  async getTodayWorkoutCompletion(): Promise<TodayWorkoutCompletionResponse> {
    const response = await api.get("/verification/today-completion");
    return response.data.data;
  },
};
