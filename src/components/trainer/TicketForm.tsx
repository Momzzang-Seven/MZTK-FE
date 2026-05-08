import {
  CREATE_TICKET_TEXT,
  EDIT_TICKET_TEXT,
  EXERCISE_CATEGORIES,
} from "@constant";
import TrainerHeader from "@components/trainer/TrainerHeader";
import { CommonButton, CommonModal } from "@components/common";
import { calculateEndTime } from "@utils";
import { useState } from "react";

interface TicketFormData {
  title: string;
  category: string;
  price: string | number;
  capacity: string | number;
  description: string;
  tags: string[];
  features: string[];
  duration: string;
  supplies: string;
  operatingDays: string[];
  operatingTimes: Record<string, string[]>;
}

interface TicketFormProps {
  mode: "create" | "edit";
  formData: TicketFormData;
  imagePreviews: string[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleFeatureChange: (index: number, value: string) => void;
  handleTagChange: (index: number, value: string) => void;
  handleDayToggle: (day: string) => void;
  handleAddTime: (day: string, time: string) => void;
  handleRemoveTime: (day: string, timeToRemove: string) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  triggerFileInput: () => void;
  isSubmitDisabled: boolean;
  onSubmit: () => Promise<void> | void;
  isSubmitting?: boolean;
}

/**
 * 클래스 등록/수정 공통 폼 컴포넌트
 * UI Style: RegisterTicket의 InfoStep 스타일을 그대로 이식
 */
const TicketForm = ({
  mode,
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
  triggerFileInput,
  isSubmitDisabled,
  onSubmit,
  isSubmitting = false,
}: TicketFormProps) => {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const texts =
    mode === "create"
      ? CREATE_TICKET_TEXT
      : { ...CREATE_TICKET_TEXT, ...EDIT_TICKET_TEXT };

  const handleSubmit = async () => {
    if (formData.operatingDays.length === 0) {
      setErrorMessage("최소 하나 이상의 운영 요일을 선택해 주세요.");
      setShowErrorModal(true);
      return;
    }

    const hasNoTimeRegistered = formData.operatingDays.some(
      (day: string) => formData.operatingTimes[day].length === 0
    );
    if (hasNoTimeRegistered) {
      setErrorMessage("선택한 운영 요일의 클래스 시작 시간을 추가해 주세요.");
      setShowErrorModal(true);
      return;
    }

    try {
      await onSubmit();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const backendErrorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "서버 요청 중 오류가 발생했습니다. 다시 시도해주세요.";
      setErrorMessage(backendErrorMessage);
      setShowErrorModal(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white pb-20 animate-in fade-in duration-500">
      <TrainerHeader title={texts.TITLE} showBack />

      <div className="flex-1 overflow-y-auto">
        {/* 1. Instagram Style Top Section (Thumbnail + Description) */}
        <div className="flex px-4 py-5 gap-4 border-b border-gray-100">
          <button
            onClick={triggerFileInput}
            className="w-24 aspect-square rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 shadow-sm relative group"
          >
            {imagePreviews.length > 0 ? (
              <>
                <img
                  src={imagePreviews[0]}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-[10px] text-white font-bold font-main">
                    변경
                  </span>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                <img
                  src="/icon/camera.svg"
                  alt="camera"
                  className="w-6 h-6 mb-1"
                />
                <span className="text-[10px] font-bold">사진</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
            />
          </button>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.DESC}
            className="flex-1 py-1 text-[15px] outline-none resize-none leading-relaxed placeholder:text-gray-300"
            rows={4}
          />
        </div>

        <div className="flex flex-col">
          {/* 2. 기본 정보 섹션 - Grids & Labels */}
          <div className="px-5 py-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                {CREATE_TICKET_TEXT.LABELS.TITLE}
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.TITLE}
                className="w-full bg-gray-50 rounded-xl py-4 px-4 text-[15px] outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all shadow-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                  {CREATE_TICKET_TEXT.LABELS.CATEGORY}
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-gray-50 rounded-xl py-4 px-4 text-[15px] outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all shadow-sm appearance-none"
                >
                  {EXERCISE_CATEGORIES.filter((cat) => cat !== "전체").map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                  {CREATE_TICKET_TEXT.LABELS.PRICE}
                </label>
                <div className="relative">
                  <input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.PRICE}
                    className="w-full bg-gray-50 rounded-xl py-4 px-4 text-[15px] outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all shadow-sm pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-main font-bold text-xs">
                    MZTK
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                  {CREATE_TICKET_TEXT.LABELS.CAPACITY}
                </label>
                <input
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.CAPACITY}
                  className="w-full bg-gray-50 rounded-xl py-4 px-4 text-[15px] outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                  {CREATE_TICKET_TEXT.LABELS.DURATION}
                </label>
                <input
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.DURATION}
                  className="w-full bg-gray-50 rounded-xl py-4 px-4 text-[15px] outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                {CREATE_TICKET_TEXT.LABELS.SUPPLIES}
              </label>
              <input
                name="supplies"
                value={formData.supplies}
                onChange={handleChange}
                placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.SUPPLIES}
                className="w-full bg-gray-50 rounded-xl py-4 px-4 text-[15px] outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          {/* 3. 해시태그 섹션 - Gray Background */}
          <div className="bg-gray-50 px-5 py-6 flex flex-col gap-4">
            <label className="text-[13px] font-bold text-gray-500">
              해시태그 (최대 3개)
            </label>
            <div className="flex gap-2">
              {formData.tags.map((tag: string, index: number) => (
                <div
                  key={index}
                  className="flex-1 relative flex items-center bg-white rounded-xl px-3 py-3 shadow-sm border border-gray-100 focus-within:border-main/30 transition-all"
                >
                  <span className="text-main font-bold mr-1">#</span>
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

          {/* 4. 프로그램 특징 섹션 */}
          <div className="px-5 py-8 flex flex-col gap-5">
            <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">
              {CREATE_TICKET_TEXT.LABELS.FEATURES}
            </label>
            <div className="flex flex-col gap-3">
              {formData.features.map((feature: string, index: number) => (
                <div key={index} className="flex gap-3 items-center group">
                  <span className="text-main font-black text-lg w-6 opacity-40 group-focus-within:opacity-100 transition-opacity">
                    {index + 1}
                  </span>
                  <input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={
                      index === 0 ? CREATE_TICKET_TEXT.PLACEHOLDERS.FEATURE : ""
                    }
                    className="flex-1 bg-white border-b border-gray-100 py-3 text-[15px] outline-none focus:border-main transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 5. 스케줄 섹션 - Gray Background */}
          <div className="bg-gray-50 px-5 py-8 flex flex-col gap-8 pb-32">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                  {CREATE_TICKET_TEXT.LABELS.OPERATING_DAYS}
                </label>
                <p className="text-[11px] text-gray-400">
                  {CREATE_TICKET_TEXT.LABELS.OPERATING_DAYS_DESC}
                </p>
              </div>
              <div className="flex justify-between items-center gap-2">
                {["월", "화", "수", "목", "금", "토", "일"].map((day) => {
                  const isSelected = formData.operatingDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`w-10 h-10 rounded-full font-bold text-sm transition-all flex items-center justify-center shadow-sm ${isSelected ? "bg-main text-white scale-110" : "bg-white text-gray-400 hover:bg-gray-100"}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.operatingDays.length > 0 && (
              <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-top duration-300">
                <div className="flex flex-col gap-1 border-t border-gray-200 pt-6">
                  <label className="text-[13px] font-bold text-gray-500 uppercase tracking-wider">
                    {CREATE_TICKET_TEXT.LABELS.OPERATING_HOURS}
                  </label>
                  <p className="text-[11px] text-gray-400">
                    {CREATE_TICKET_TEXT.LABELS.OPERATING_HOURS_DESC}
                  </p>
                </div>

                {["월", "화", "수", "목", "금", "토", "일"]
                  .filter((day) => formData.operatingDays.includes(day))
                  .map((day) => (
                    <div
                      key={day}
                      className="flex flex-col gap-3 p-4 bg-white rounded-2xl shadow-sm border border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-base font-black text-gray-800 w-6">
                          {day}
                        </div>
                        <div className="flex flex-1 gap-2">
                          <input
                            type="time"
                            id={`time-${day}`}
                            className="flex-1 bg-gray-50 border border-transparent rounded-xl py-2.5 px-3 text-sm font-medium outline-none focus:bg-white focus:border-main/20"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                `time-${day}`
                              ) as HTMLInputElement;
                              if (input && input.value) {
                                handleAddTime(day, input.value);
                                input.value = "";
                              }
                            }}
                            className="bg-main text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-main/20 active:scale-95 transition-all"
                          >
                            추가
                          </button>
                        </div>
                      </div>

                      {formData.operatingTimes[day].length > 0 && (
                        <div className="flex flex-wrap gap-2 pl-10">
                          {formData.operatingTimes[day].map((time: string) => (
                            <div
                              key={time}
                              className="flex items-center gap-1.5 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-[12px] font-bold border border-gray-100 group"
                            >
                              <span>
                                {formData.duration
                                  ? `${time} ~ ${calculateEndTime(time, formData.duration)}`
                                  : time}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveTime(day, time)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 버튼 섹션 - Sticky */}
      <div className="p-5 border-t border-gray-100 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.02)] fixed bottom-[82px] left-0 right-0 z-50 w-full max-w-[420px] mx-auto">
        <CommonButton
          label={isSubmitting ? "저장 중..." : texts.SUBMIT}
          className="h-[60px] rounded-2xl title shadow-sm active:scale-95 transition-all font-bold"
          onClick={handleSubmit}
          disabled={isSubmitDisabled || isSubmitting}
        />
      </div>

      {/* Error Modal */}
      {showErrorModal && (
        <CommonModal
          title={mode === "create" ? "등록 실패" : "수정 실패"}
          desc={errorMessage}
          confirmLabel="확인"
          onConfirmClick={() => setShowErrorModal(false)}
        />
      )}
    </div>
  );
};

export default TicketForm;
