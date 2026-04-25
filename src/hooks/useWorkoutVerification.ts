import { type ChangeEvent, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { imageService } from "@services/image";
import {
  type FailureCode,
  type RejectionReasonCode,
  type SubmitWorkoutVerificationResponse,
  verificationService,
} from "@services/verification";
import { useUserStore } from "@store/userStore";

type WorkoutVerificationMode = "exercise" | "record";

interface UseWorkoutVerificationOptions {
  mode: WorkoutVerificationMode;
  alertNoFileText: string;
}

const PHOTO_REJECTION_MESSAGES: Partial<Record<RejectionReasonCode, string>> = {
  SCREEN_OR_UI: "화면이나 앱 UI가 아닌 실제 운동 사진을 올려 주세요.",
  NO_PERSON_VISIBLE: "운동하는 사람이 보이는 사진을 올려 주세요.",
  EQUIPMENT_ONLY: "기구만 찍힌 사진 말고 운동 장면이 보이는 사진이 필요해요.",
  INSUFFICIENT_WORKOUT_CONTEXT:
    "운동 직후나 운동 중이라는 맥락이 더 잘 보이는 사진을 올려 주세요.",
  LOW_CONFIDENCE: "사진을 명확하게 판별하기 어려워요. 다시 촬영해 주세요.",
  MISSING_EXIF_METADATA: "촬영 정보가 포함된 원본 사진으로 다시 시도해 주세요.",
  EXIF_DATE_MISMATCH: "오늘 촬영한 운동 사진으로 다시 인증해 주세요.",
};

const RECORD_REJECTION_MESSAGES: Partial<Record<RejectionReasonCode, string>> = {
  NOT_WORKOUT_RECORD: "운동 기록 앱 화면이 아닌 것 같아요. 기록 화면을 올려 주세요.",
  DATE_NOT_VISIBLE: "운동 날짜가 선명하게 보이는 기록 화면을 올려 주세요.",
  DATE_MISMATCH: "오늘 운동 기록 화면이 맞는지 다시 확인해 주세요.",
  LOW_CONFIDENCE: "기록 화면을 명확하게 판별하기 어려워요. 다시 캡처해 주세요.",
};

const FAILURE_MESSAGES: Record<FailureCode, string> = {
  EXTERNAL_AI_TIMEOUT: "인증 분석 시간이 초과됐어요. 잠시 후 다시 시도해 주세요.",
  EXTERNAL_AI_UNAVAILABLE: "인증 분석 서비스를 잠시 사용할 수 없어요. 다시 시도해 주세요.",
  EXTERNAL_AI_MALFORMED_RESPONSE:
    "인증 분석 결과를 해석하지 못했어요. 다시 시도해 주세요.",
  AI_RESPONSE_SCHEMA_INVALID:
    "인증 분석 결과 형식이 올바르지 않아요. 다시 시도해 주세요.",
  ORIGINAL_IMAGE_READ_FAILED: "업로드한 이미지를 읽지 못했어요. 다른 이미지로 시도해 주세요.",
  IMAGE_DECODE_FAILED: "이미지 해석에 실패했어요. 다시 업로드해 주세요.",
  ANALYSIS_IMAGE_GENERATION_FAILED:
    "분석용 이미지를 만들지 못했어요. 잠시 후 다시 시도해 주세요.",
};

const DEFAULT_ERROR_MESSAGE =
  "운동 인증 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.";

const getVerificationErrorMessage = (
  mode: WorkoutVerificationMode,
  result: SubmitWorkoutVerificationResponse,
) => {
  if (result.verificationStatus === "REJECTED") {
    const messageMap =
      mode === "record" ? RECORD_REJECTION_MESSAGES : PHOTO_REJECTION_MESSAGES;
    const baseMessage =
      (result.rejectionReasonCode && messageMap[result.rejectionReasonCode]) ||
      "인증 기준에 맞는 이미지를 다시 올려 주세요.";

    return result.rejectionReasonDetail
      ? `${baseMessage} ${result.rejectionReasonDetail}`
      : baseMessage;
  }

  if (result.verificationStatus === "FAILED" && result.failureCode) {
    return FAILURE_MESSAGES[result.failureCode];
  }

  if (
    result.verificationStatus === "VERIFIED" &&
    result.rewardStatus !== "SUCCEEDED"
  ) {
    return "운동 인증은 완료됐지만 보상 반영에 실패했어요. 잠시 후 다시 시도해 주세요.";
  }

  if (
    result.verificationStatus === "PENDING" ||
    result.verificationStatus === "ANALYZING"
  ) {
    return "인증 요청이 접수되었어요. 잠시 후 다시 확인해 주세요.";
  }

  return DEFAULT_ERROR_MESSAGE;
};

const getRequestErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? DEFAULT_ERROR_MESSAGE;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return DEFAULT_ERROR_MESSAGE;
};

export const useWorkoutVerification = ({
  mode,
  alertNoFileText,
}: UseWorkoutVerificationOptions) => {
  const navigate = useNavigate();
  const { applyWorkoutVerificationSuccess } = useUserStore();
  const [step, setStep] = useState<"upload" | "analyzing">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    const nextPreviewUrl = URL.createObjectURL(file);

    setPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return nextPreviewUrl;
    });
    setSelectedFile(file);
    setErrorMessage("");
    setStep("upload");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      window.alert(alertNoFileText);
      return;
    }

    setErrorMessage("");
    setStep("analyzing");

    try {
      const presignedResponse = await imageService.issuePresignedUrls({
        referenceType: "WORKOUT",
        images: [selectedFile.name],
      });
      const uploadTarget = presignedResponse.items[0];

      if (!uploadTarget) {
        throw new Error("업로드 URL을 발급받지 못했습니다.");
      }

      await imageService.uploadFileToPresignedUrl(
        uploadTarget.presignedUrl,
        selectedFile,
      );

      const result =
        mode === "record"
          ? await verificationService.submitWorkoutRecord({
              tmpObjectKey: uploadTarget.tmpObjectKey,
            })
          : await verificationService.submitWorkoutPhoto({
              tmpObjectKey: uploadTarget.tmpObjectKey,
            });

      if (
        result.verificationStatus === "VERIFIED" &&
        result.rewardStatus === "SUCCEEDED"
      ) {
        applyWorkoutVerificationSuccess({
          mode,
          grantedXp: result.grantedXp,
          exerciseDate: result.exerciseDate,
        });
        navigate("/", { replace: true });
        return;
      }

      setErrorMessage(getVerificationErrorMessage(mode, result));
      setStep("upload");
    } catch (error) {
      setErrorMessage(getRequestErrorMessage(error));
      setStep("upload");
    }
  };

  return {
    step,
    previewUrl,
    errorMessage,
    hasSelectedFile: selectedFile !== null,
    handleFileChange,
    handleUpload,
  };
};
