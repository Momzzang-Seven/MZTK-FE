import { ExerciseHeader } from "@components/exercise/ExerciseHeader";
import { PhotoUploader } from "@components/common/PhotoUploader";
import { ExerciseAnalyzing } from "@components/exercise/ExerciseAnalyzing";
import { CommonButton } from "@components/common";
import { EXERCISE_TEXT } from "@constant/exercise";
import { useWorkoutVerification } from "@hooks/useWorkoutVerification";

const ExerciseAuth = () => {
  const {
    step,
    previewUrl,
    errorMessage,
    hasSelectedFile,
    handleFileChange,
    handleUpload,
  } = useWorkoutVerification({
    mode: "exercise",
    alertNoFileText: EXERCISE_TEXT.ALERT_NO_FILE,
  });

  return (
    <div className="flex flex-col h-full bg-white px-5 pt-6 pb-20 overflow-y-auto min-h-screen">
      <ExerciseHeader />

      {step === "upload" && (
        <>
          <PhotoUploader
            previewUrl={previewUrl}
            onFileChange={handleFileChange}
            guideTitle={EXERCISE_TEXT.GUIDE_TITLE}
            guideDesc={EXERCISE_TEXT.GUIDE_DESC}
            uploadNoImageText={EXERCISE_TEXT.UPLOAD_NO_IMAGE}
            uploadSizeHintText={EXERCISE_TEXT.UPLOAD_SIZE_HINT}
          />

          {errorMessage && (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-500">
              {errorMessage}
            </p>
          )}

          <CommonButton
            label={EXERCISE_TEXT.BTN_REGISTER}
            onClick={handleUpload}
            disabled={!hasSelectedFile}
            bgColor="bg-white"
            textColor={hasSelectedFile ? "text-main" : "text-gray-300"}
            border={
              hasSelectedFile
                ? "border-2 border-main"
                : "border-2 border-gray-300 cursor-not-allowed"
            }
            className={`font-bold py-4 rounded-2xl text-xl transition-all shadow-none ${
              hasSelectedFile ? "shadow-md active:scale-95" : ""
            }`}
          />
        </>
      )}

      {step === "analyzing" && <ExerciseAnalyzing />}
    </div>
  );
};

export default ExerciseAuth;
