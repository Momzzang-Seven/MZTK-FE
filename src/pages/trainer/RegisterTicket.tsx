import { CommonModal } from "@components/common";
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
    isSubmitDisabled,
    isCheckingStore,
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
    <div className="flex flex-col min-h-screen bg-[#FDFDFD] font-pretendard">
      <RegisterHeader
        title={step === "photo" ? "사진 등록" : "정보 입력"}
        desc={
          step === "photo"
            ? "수업의 분위기를 보여줄 사진을 등록해 주세요."
            : "클래스에 대한 상세 정보를 입력해 주세요."
        }
        onBack={handleBack}
        nextLabel={step === "photo" ? "다음으로" : "등록 완료"}
        onNext={handleNext}
        isNextDisabled={
          step === "photo" ? imagePreviews.length === 0 : isSubmitDisabled
        }
        step={step}
      />

      <div className="flex-1 overflow-y-auto">
        {step === "photo" ? (
          <PhotoStep
            imagePreviews={imagePreviews}
            onImageChange={handleImageChange}
            onRemoveImage={removeImage}
            triggerFileInput={triggerFileInput}
            fileInputRef={fileInputRef}
          />
        ) : (
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
        )}
      </div>

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
