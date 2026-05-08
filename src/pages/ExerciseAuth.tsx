import AuthPageShell from "@components/common/AuthPageShell";
import { PhotoUploader } from "@components/common/PhotoUploader";
import { ExerciseAnalyzing } from "@components/exercise/ExerciseAnalyzing";
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

  const icon = (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#FAB12F"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );

  if (step === "analyzing") {
    return <ExerciseAnalyzing />;
  }

  return (
    <AuthPageShell
      badge="STEP 2 · 운동 사진 인증"
      title={EXERCISE_TEXT.TITLE}
      subtitle="운동 중인 사진을 업로드하면 AI가 자동으로 분석해요"
      icon={icon}
      iconBg="bg-yellow-50"
    >
      <PhotoUploader
        previewUrl={previewUrl}
        onFileChange={handleFileChange}
        guideTitle={EXERCISE_TEXT.GUIDE_TITLE}
        guideDesc={EXERCISE_TEXT.GUIDE_DESC}
        uploadNoImageText={EXERCISE_TEXT.UPLOAD_NO_IMAGE}
        uploadSizeHintText={EXERCISE_TEXT.UPLOAD_SIZE_HINT}
      />

      {errorMessage && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-[20px] px-4 py-3.5">
          <div className="w-7 h-7 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EF4444"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
            </svg>
          </div>
          <p className="text-red-600 text-[13px] font-bold">{errorMessage}</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!hasSelectedFile}
        className={`btn-press w-full py-4 rounded-[20px] font-black text-[16px] border-none transition-all ${
          hasSelectedFile
            ? "bg-main text-white shadow-xl shadow-main/25"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {EXERCISE_TEXT.BTN_REGISTER}
      </button>
    </AuthPageShell>
  );
};

export default ExerciseAuth;
