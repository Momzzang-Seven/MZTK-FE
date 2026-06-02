import AuthPageShell from "@components/common/AuthPageShell";
import { PhotoUploader } from "@components/common/PhotoUploader";
import { RecordAnalyzing } from "@components/record/RecordAnalyzing";
import { RECORD_TEXT } from "@constant/record";
import { useWorkoutVerification } from "@hooks/useWorkoutVerification";
import { AuthSuccessOverlay } from "@components/common/AuthSuccessOverlay";
import { useNavigate } from "react-router-dom";

const RecordAuth = () => {
  const {
    step,
    previewUrl,
    errorMessage,
    hasSelectedFile,
    acceptedFileTypes,
    handleFileChange,
    handleUpload,
    successData,
  } = useWorkoutVerification({
    mode: "record",
    alertNoFileText: RECORD_TEXT.ALERT_NO_FILE,
  });

  const navigate = useNavigate();

  if (successData) {
    return (
      <AuthSuccessOverlay
        title="운동 기록 인증 성공!"
        subTitle="AI가 운동 기록 캡처본을 성공적으로 분석했습니다"
        rewardXp={successData.grantedXp}
        onClose={() => navigate("/", { replace: true })}
      />
    );
  }

  const icon = (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F59E0B"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
      <path d="M9 8h6" />
    </svg>
  );

  if (step === "analyzing") {
    return <RecordAnalyzing />;
  }

  return (
    <AuthPageShell
      badge="STEP 3 · 운동 기록 인증"
      title={RECORD_TEXT.TITLE}
      subtitle="헬스장 앱의 운동 기록 캡처 화면을 업로드해요"
      icon={icon}
      iconBg="bg-amber-50"
    >
      <PhotoUploader
        previewUrl={previewUrl}
        onFileChange={handleFileChange}
        guideTitle={RECORD_TEXT.GUIDE_TITLE}
        guideDesc={RECORD_TEXT.GUIDE_DESC}
        uploadNoImageText={RECORD_TEXT.UPLOAD_NO_IMAGE}
        uploadSizeHintText={RECORD_TEXT.UPLOAD_SIZE_HINT}
        acceptedFileTypes={acceptedFileTypes}
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
        {RECORD_TEXT.BTN_REGISTER}
      </button>
    </AuthPageShell>
  );
};

export default RecordAuth;
