import { CommonButton } from "@components/common";
import InfoStep from "@components/trainer/register/InfoStep";
import PhotoStep from "@components/trainer/register/PhotoStep";
import RegisterHeader from "@components/trainer/register/RegisterHeader";
import { useNavigate } from "react-router-dom";
import { useRegisterTicket } from "@hooks/trainer/useRegisterTicket";

const RegisterTicket = () => {
  const navigate = useNavigate();
  const {
    step,
    formData,
    imagePreviews,
    fileInputRef,
    handleChange,
    handleFeatureChange,
    handleTagChange,
    handleDayToggle,
    handleAddTime,
    handleRemoveTime,
    handleImageChange,
    removeImage,
    triggerFileInput,
    handleNext,
    handleBack,
    handleSubmit,
    isSubmitDisabled,
    isCheckingStore,
    isSubmitting,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
  } = useRegisterTicket();

  if (isCheckingStore) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDFDFD] text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-main/20 border-t-main rounded-full animate-spin" />
          <p className="text-[13px] font-black text-gray-400">
            매장 정보를 확인하는 중입니다...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white min-h-screen">
      {step === "photo" && (
        <div className="flex flex-col flex-1 overflow-y-auto bg-[#FDFDFD]">
          <RegisterHeader
            title="클래스 등록"
            onBack={handleBack}
            nextLabel="다음"
            onNext={handleNext}
            isNextDisabled={imagePreviews.length === 0}
            step="photo"
          />
          <PhotoStep
            imagePreviews={imagePreviews}
            onImageChange={handleImageChange}
            onRemoveImage={removeImage}
            triggerFileInput={triggerFileInput}
            fileInputRef={fileInputRef}
          />
        </div>
      )}

      {step === "info" && (
        <>
          <div className="flex flex-col flex-1 overflow-y-auto bg-[#F9FAFB]">
            <RegisterHeader title="상세 정보" onBack={handleBack} step="info" />
            <InfoStep
              formData={formData}
              imagePreviews={imagePreviews}
              handleChange={handleChange}
              handleFeatureChange={handleFeatureChange}
              handleTagChange={handleTagChange}
              handleDayToggle={handleDayToggle}
              handleAddTime={handleAddTime}
              handleRemoveTime={handleRemoveTime}
            />
          </div>
          <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)] sticky bottom-0 z-50">
            <CommonButton
              label={isSubmitting ? "등록 중..." : "등록하기"}
              className="h-[60px] rounded-[22px] shadow-lg shadow-main/10 active:opacity-90 transition-all font-black text-[16px]"
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
            />
          </div>
        </>
      )}

      {isSuccessModalOpen && (
        <CommonModal
          title="등록 완료"
          desc="멋진 클래스가 성공적으로 등록되었습니다!<br/>지금 바로 목록에서 확인해 보세요."
          confirmLabel="목록으로 이동"
          onConfirmClick={() => {
            setIsSuccessModalOpen(false);
            navigate("/trainer/list");
          }}
        />
      )}
    </div>
  );
};

export default RegisterTicket;
