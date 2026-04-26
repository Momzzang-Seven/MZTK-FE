import { RecordHeader } from "@components/record/RecordHeader";
import { PhotoUploader } from "@components/common/PhotoUploader";
import { RecordAnalyzing } from "@components/record/RecordAnalyzing";
import { CommonButton } from "@components/common";
import { RECORD_TEXT } from "@constant/record";
import { useWorkoutVerification } from "@hooks/useWorkoutVerification";

const RecordAuth = () => {
  const {
    step,
    previewUrl,
    errorMessage,
    hasSelectedFile,
    handleFileChange,
    handleUpload,
  } = useWorkoutVerification({
    mode: "record",
    alertNoFileText: RECORD_TEXT.ALERT_NO_FILE,
  });

  return (
    <div className="flex flex-col h-full bg-white px-5 pt-6 pb-20 overflow-y-auto min-h-screen">
      <RecordHeader />

      {step === "upload" && (
        <>
          <PhotoUploader
            previewUrl={previewUrl}
            onFileChange={handleFileChange}
            guideTitle={RECORD_TEXT.GUIDE_TITLE}
            guideDesc={RECORD_TEXT.GUIDE_DESC}
            uploadNoImageText={RECORD_TEXT.UPLOAD_NO_IMAGE}
            uploadSizeHintText={RECORD_TEXT.UPLOAD_SIZE_HINT}
          />

          {errorMessage && (
            <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-500">
              {errorMessage}
            </p>
          )}

          <CommonButton
            label={RECORD_TEXT.BTN_REGISTER}
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

      {step === "analyzing" && <RecordAnalyzing />}
    </div>
  );
};

export default RecordAuth;
