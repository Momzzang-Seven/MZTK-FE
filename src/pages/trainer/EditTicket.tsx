import { useState } from "react";
import { CREATE_TICKET_TEXT, EDIT_TICKET_TEXT, EXERCISE_CATEGORIES } from "@constant";
import TrainerHeader from "@components/trainer/TrainerHeader";
import { CommonButton, CommonModal } from "@components/common";
import { useEditTicket } from "@hooks/trainer/useEditTicket";
import { calculateEndTime } from "@utils";

const EditTicket = () => {
    const {
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
        isSubmitDisabled
    } = useEditTicket();

    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async () => {
        if (formData.operatingDays.length === 0) {
            setErrorMessage("최소 하나 이상의 운영 요일을 선택해 주세요.");
            setShowErrorModal(true);
            return;
        }

        const hasNoTimeRegistered = formData.operatingDays.some(day => formData.operatingTimes[day].length === 0);
        if (hasNoTimeRegistered) {
            setErrorMessage("선택한 운영 요일의 클래스 시작 시간을 추가해 주세요.");
            setShowErrorModal(true);
            return;
        }

        try {
            // [TODO] 실제 서버 API 연동 구현
            alert("클래스가 성공적으로 수정되었습니다!");
            window.location.href = "/trainer";
        } catch (error: any) {
            const backendErrorMessage = error?.response?.data?.message || error?.message || "서버 요청 중 오류가 발생했습니다. 다시 시도해주세요.";
            setErrorMessage(backendErrorMessage);
            setShowErrorModal(true);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white min-h-screen">
            <TrainerHeader title={EDIT_TICKET_TEXT.TITLE} showBack />

            <div className="flex-1 px-5 py-6 flex flex-col gap-6 overflow-y-auto pb-32">
                {/* 1. 기본 정보 섹션 */}
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.TITLE}</label>
                        <input
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.TITLE}
                            className="w-full bg-grey-pale rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.CATEGORY}</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full bg-grey-pale rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20 appearance-none bg-[url('https://cdn0.iconfinder.com/data/icons/user-interface-2062/24/arrow_drop_down-512.png')] bg-[length:24px] bg-[right:12px_center] bg-no-repeat"
                        >
                            {EXERCISE_CATEGORIES.filter(cat => cat !== "전체").map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.PRICE}</label>
                            <input
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.PRICE}
                                className="w-full bg-grey-pale rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.CAPACITY}</label>
                            <input
                                name="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={handleChange}
                                placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.CAPACITY}
                                className="w-full bg-grey-pale rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. 상세 설명 섹션 */}
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.DESC}</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.DESC}
                            className="w-full bg-grey-pale rounded-xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20 resize-none leading-relaxed"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">해시태그 (최대 3개)</label>
                        <div className="flex gap-2">
                            {formData.tags.map((tag, index) => (
                                <div key={index} className="flex-1 flex items-center relative gap-1 bg-grey-pale rounded-xl px-3 py-3.5 focus-within:ring-2 focus-within:ring-main/20">
                                    <span className="text-main font-bold">#</span>
                                    <input
                                        value={tag}
                                        onChange={(e) => handleTagChange(index, e.target.value)}
                                        placeholder={`태그${index + 1}`}
                                        className="w-full bg-transparent text-sm outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.FEATURES}</label>
                        <div className="flex flex-col gap-2">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex gap-3 items-center">
                                    <span className="text-main font-bold w-4">{index + 1}.</span>
                                    <input
                                        value={feature}
                                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                                        placeholder={index === 0 ? CREATE_TICKET_TEXT.PLACEHOLDERS.FEATURE : ""}
                                        className="flex-1 bg-grey-pale rounded-xl py-3.5 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.DURATION}</label>
                            <input
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.DURATION}
                                className="w-full bg-grey-pale rounded-xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.SUPPLIES}</label>
                            <input
                                name="supplies"
                                value={formData.supplies}
                                onChange={handleChange}
                                placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.SUPPLIES}
                                className="w-full bg-grey-pale rounded-xl py-4 px-4 text-sm outline-none focus:ring-2 focus:ring-main/20"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. 스케줄 섹션 */}
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold text-gray-700">{CREATE_TICKET_TEXT.LABELS.OPERATING_DAYS}</label>
                        <div className="flex justify-between gap-1.5">
                            {['월', '화', '수', '목', '금', '토', '일'].map((day) => {
                                const isSelected = formData.operatingDays.includes(day);
                                return (
                                    <button
                                        key={day}
                                        onClick={() => handleDayToggle(day)}
                                        className={`w-10 h-10 rounded-full font-bold text-[14px] transition-all flex items-center justify-center ${isSelected ? 'bg-gray-300 text-gray-800 shadow-inner' : 'bg-gray-100 text-gray-500'}`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {formData.operatingDays.length > 0 && (
                        <div className="flex flex-col gap-4">
                            {['월', '화', '수', '목', '금', '토', '일'].filter(day => formData.operatingDays.includes(day)).map((day) => (
                                <div key={day} className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="text-[15px] font-bold text-gray-800 w-8">{day}</div>
                                        <div className="flex flex-1 gap-2">
                                            <input
                                                type="time"
                                                id={`time-${day}`}
                                                className="flex-1 bg-white border border-gray-200 rounded-xl py-2.5 px-3 text-sm font-medium outline-none focus:border-main/50"
                                            />
                                            <button
                                                onClick={() => {
                                                    const input = document.getElementById(`time-${day}`) as HTMLInputElement;
                                                    if (input && input.value) {
                                                        handleAddTime(day, input.value);
                                                        input.value = "";
                                                    }
                                                }}
                                                className="bg-main text-white px-4 py-2.5 rounded-xl text-[13px] font-bold shadow-sm active:opacity-90 transition-all"
                                            >
                                                추가
                                            </button>
                                        </div>
                                    </div>

                                    {formData.operatingTimes[day].length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-1.5 pl-11">
                                            {formData.operatingTimes[day].map((time) => (
                                                <div key={time} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-[13px] shadow-sm">
                                                    <span className="font-bold">
                                                        {formData.duration ? `${time} ~ ${calculateEndTime(time, formData.duration)}` : time}
                                                    </span>
                                                    <button onClick={() => handleRemoveTime(day, time)} className="text-gray-400 font-bold p-0.5 ml-0.5">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. 이미지 업로드 섹션 - 5구 그리드 방식 */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-sm font-bold text-gray-800">{CREATE_TICKET_TEXT.LABELS.IMAGE}</label>
                        <span className="text-xs text-gray-400 font-bold bg-gray-50 px-2 py-0.5 rounded-md">
                            최대 5장
                        </span>
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        multiple
                        className="hidden"
                    />

                    <div className="grid grid-cols-3 gap-3 px-1">
                        {[0, 1, 2, 3, 4].map((index) => {
                            const hasImage = index < imagePreviews.length;
                            const isNextSlot = index === imagePreviews.length;

                            if (hasImage) {
                                return (
                                    <div key={index} className="aspect-square relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                                        <img src={imagePreviews[index]} alt={`preview-${index}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-[12px] active:bg-main/80"
                                        >
                                            ✕
                                        </button>
                                        {index === 0 && (
                                            <div className="absolute bottom-0 left-0 right-0 bg-main text-[10px] font-bold text-white text-center py-1">
                                                대표
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            if (isNextSlot) {
                                return (
                                    <button
                                        key={index}
                                        onClick={triggerFileInput}
                                        className="aspect-square bg-grey-pale rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-main/40 transition-all active:scale-[0.96]"
                                    >
                                        <img src="/icon/camera.svg" alt="camera" className="w-6 h-6 opacity-40 mb-1" />
                                        <span className="text-[10px] font-bold text-gray-400">사진 추가</span>
                                        <span className="text-[10px] font-bold text-main/50 mt-0.5">{index + 1}/5</span>
                                    </button>
                                );
                            }

                            return (
                                <div
                                    key={index}
                                    className="aspect-square bg-gray-50/50 rounded-2xl flex items-center justify-center border-[1.5px] border-gray-100"
                                >
                                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-white shadow-sm">
                <CommonButton
                    label={EDIT_TICKET_TEXT.SUBMIT}
                    className="h-[60px] rounded-2xl"
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                />
            </div>

            {showErrorModal && (
                <CommonModal
                    title="수정 실패"
                    desc={errorMessage}
                    confirmLabel="확인"
                    onConfirmClick={() => setShowErrorModal(false)}
                />
            )}
        </div>
    );
};

export default EditTicket;
