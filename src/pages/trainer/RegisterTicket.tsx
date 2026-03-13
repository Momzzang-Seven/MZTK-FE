import { useRegisterTicket } from "@hooks/trainer/useRegisterTicket";
import RegisterHeader from "@components/trainer/register/RegisterHeader";
import PhotoStep from "@components/trainer/register/PhotoStep";
import InfoStep from "@components/trainer/register/InfoStep";

import { CommonButton } from "@components/common";

const RegisterTicket = () => {
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
        isSubmitDisabled
    } = useRegisterTicket();

    return (
        <div className="flex flex-col h-full bg-white min-h-screen">
            {step === "photo" && (
                <div className="flex flex-col flex-1 overflow-y-auto">
                    <RegisterHeader 
                        title="새 클래스 등록" 
                        onBack={handleBack} 
                        nextLabel="다음" 
                        onNext={handleNext}
                        isNextDisabled={imagePreviews.length === 0}
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
                    <div className="flex flex-col flex-1 overflow-y-auto">
                        <RegisterHeader 
                            title="상세 정보" 
                            onBack={handleBack} 
                        />
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
                    {/* 하단 고정 등록 버튼 */}
                    <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)] sticky bottom-0 z-50">
                        <CommonButton
                            label="등록하기"
                            className="h-[60px] rounded-2xl title shadow-sm active:opacity-90 transition-all font-bold"
                            onClick={handleSubmit}
                            disabled={isSubmitDisabled}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default RegisterTicket;
