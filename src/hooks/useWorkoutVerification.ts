import { type ChangeEvent, useEffect, useState } from "react";
import { imageService } from "@services/image";
import { verificationService } from "@services/verification";
import { useUserStore } from "@store/userStore";
import {
  getWorkoutVerificationErrorMessage,
  getWorkoutVerificationRequestErrorMessage,
  type WorkoutVerificationMode,
} from "@utils/workoutVerificationMessages";
import { getInvalidImageFileMessage } from "@utils";

interface UseWorkoutVerificationOptions {
  mode: WorkoutVerificationMode;
  alertNoFileText: string;
}

export const useWorkoutVerification = ({
  mode,
  alertNoFileText,
}: UseWorkoutVerificationOptions) => {
  const {
    applyWorkoutVerificationSuccess,
    finishAnalysis,
    showSnackbar,
    startAnalysis,
  } = useUserStore();
  const [step, setStep] = useState<"upload" | "analyzing">("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<{
    grantedXp: number;
    exerciseDate: string;
  } | null>(null);

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

    const invalidFileMessage = getInvalidImageFileMessage(file);
    if (invalidFileMessage) {
      setSelectedFile(null);
      setPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      setErrorMessage(invalidFileMessage);
      setStep("upload");
      return;
    }

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
        selectedFile
      );

      startAnalysis(mode);

      const verificationRequest =
        mode === "record"
          ? verificationService.submitWorkoutRecord({
              tmpObjectKey: uploadTarget.tmpObjectKey,
            })
          : verificationService.submitWorkoutPhoto({
              tmpObjectKey: uploadTarget.tmpObjectKey,
            });

      void verificationRequest
        .then((result) => {
          if (
            result.verificationStatus === "VERIFIED" &&
            result.rewardStatus === "SUCCEEDED"
          ) {
            applyWorkoutVerificationSuccess({
              mode,
              grantedXp: result.grantedXp,
              exerciseDate: result.exerciseDate,
            });
            setSuccessData({
              grantedXp: result.grantedXp || 100,
              exerciseDate: result.exerciseDate || "",
            });
            return;
          }

          if (
            result.verificationStatus === "REJECTED" ||
            result.verificationStatus === "FAILED" ||
            (result.verificationStatus === "VERIFIED" &&
              result.rewardStatus === "FAILED")
          ) {
            finishAnalysis();
            showSnackbar(getWorkoutVerificationErrorMessage(mode, result));
          }
        })
        .catch((error) => {
          finishAnalysis();
          showSnackbar(getWorkoutVerificationRequestErrorMessage(error));
        });
    } catch (error) {
      setErrorMessage(getWorkoutVerificationRequestErrorMessage(error));
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
    successData,
  };
};
