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
 * UI Style: Luxury Minimalist (Refined)
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
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
    variant?: "error" | "success" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    desc: "",
  });

  const texts =
    mode === "create"
      ? CREATE_TICKET_TEXT
      : { ...CREATE_TICKET_TEXT, ...EDIT_TICKET_TEXT };

  const handleSubmit = async () => {
    if (formData.operatingDays.length === 0) {
      setModalState({
        isOpen: true,
        title: "운영 요일 미선택",
        desc: "최소 하나 이상의 운영 요일을 선택해 주세요.",
        variant: "error",
      });
      return;
    }

    const hasNoTimeRegistered = formData.operatingDays.some(
      (day: string) => formData.operatingTimes[day].length === 0
    );
    if (hasNoTimeRegistered) {
      setModalState({
        isOpen: true,
        title: "시간 미입력",
        desc: "선택한 운영 요일의 클래스 시작 시간을 추가해 주세요.",
        variant: "error",
      });
      return;
    }

    try {
      await onSubmit();
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setModalState({
        isOpen: true,
        title: mode === "create" ? "등록 실패" : "수정 실패",
        desc:
          err?.response?.data?.message ||
          err?.message ||
          "서버 요청 중 오류가 발생했습니다.",
        variant: "error",
      });
    }
  };

  // Custom Image Change Handler with Modal instead of alert
  const onImageChangeWrapper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imagePreviews.length + files.length > 5) {
      setModalState({
        isOpen: true,
        title: "이미지 개수 초과",
        desc: "클래스 이미지는 최대 5장까지 등록 가능합니다.",
        variant: "warning",
      });
      return;
    }
    handleImageChange(e);
  };

  return (
    <div className="flex flex-col h-full bg-[#FDFDFD] min-h-screen">
      <TrainerHeader title={texts.TITLE} showBack />

      <div className="flex-1 overflow-y-auto pb-32 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* 1. Media Section */}
        <section className="px-5 py-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 bg-main rounded-full" />
            <h2 className="text-[15px] font-black text-gray-900 tracking-tight">
              클래스 미디어
            </h2>
          </div>

          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            <button
              onClick={triggerFileInput}
              className="w-24 h-24 rounded-[22px] bg-white border-2 border-dashed border-gray-100 flex flex-col items-center justify-center shrink-0 active:scale-95 transition-all group hover:border-main/30"
            >
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mb-1.5 group-hover:bg-amber-50">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#D1D5DB"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:stroke-main"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <span className="text-[10px] font-black text-gray-400">
                {imagePreviews.length} / 5
              </span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImageChangeWrapper}
                accept="image/*"
                multiple
                className="hidden"
              />
            </button>

            {imagePreviews.map((preview, idx) => (
              <div
                key={idx}
                className="relative w-24 h-24 rounded-[22px] overflow-hidden border border-gray-100 shadow-sm shrink-0"
              >
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                {idx === 0 && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-main text-white text-[8px] font-black rounded-full uppercase tracking-widest">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 2. Basic Info Section */}
        <section className="px-5 py-6 flex flex-col gap-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 bg-main rounded-full" />
            <h2 className="text-[15px] font-black text-gray-900 tracking-tight">
              클래스 정보
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-black text-gray-400 ml-1">
              제목
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.TITLE}
              className="w-full h-14 rounded-[20px] bg-white border border-gray-100 px-5 text-[15px] font-bold text-gray-900 outline-none focus:border-main/30 shadow-sm transition-all"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-black text-gray-400 ml-1">
              설명
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.DESC}
              rows={4}
              className="w-full rounded-[20px] bg-white border border-gray-100 p-5 text-[15px] font-bold text-gray-900 outline-none focus:border-main/30 shadow-sm transition-all resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-black text-gray-400 ml-1">
                카테고리
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full h-14 rounded-[20px] bg-white border border-gray-100 px-5 text-[15px] font-bold text-gray-900 outline-none appearance-none"
              >
                {EXERCISE_CATEGORIES.filter((cat) => cat.key !== "ALL").map(
                  (cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-black text-gray-400 ml-1">
                가격 (MZTK)
              </label>
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                className="w-full h-14 rounded-[20px] bg-white border border-gray-100 px-5 text-[15px] font-black text-main outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-black text-gray-400 ml-1">
                최대 인원
              </label>
              <input
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="0"
                className="w-full h-14 rounded-[20px] bg-white border border-gray-100 px-5 text-[15px] font-bold text-gray-900 outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-black text-gray-400 ml-1">
                진행 시간 (분)
              </label>
              <input
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="60"
                className="w-full h-14 rounded-[20px] bg-white border border-gray-100 px-5 text-[15px] font-bold text-gray-900 outline-none"
              />
            </div>
          </div>
        </section>

        {/* 3. Features & Tags Section */}
        <section className="px-5 py-6 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-4 bg-main rounded-full" />
              <h2 className="text-[15px] font-black text-gray-900 tracking-tight">
                프로그램 특징
              </h2>
            </div>
            <div className="flex flex-col gap-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="relative">
                  <input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`특징 ${index + 1}`}
                    className="w-full h-12 bg-white border-b border-gray-100 px-1 text-[14px] font-bold text-gray-800 outline-none focus:border-main/40 transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-4 bg-main rounded-full" />
              <h2 className="text-[15px] font-black text-gray-900 tracking-tight">
                검색 태그
              </h2>
            </div>
            <div className="flex gap-2">
              {formData.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex-1 flex items-center h-12 bg-white border border-gray-100 rounded-xl px-3 group focus-within:border-main/30 transition-all"
                >
                  <span className="text-main font-black text-sm mr-1.5 opacity-40">
                    #
                  </span>
                  <input
                    value={tag}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    placeholder="태그"
                    className="w-full bg-transparent text-[13px] font-bold outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Schedule Section */}
        <section className="px-5 py-6 flex flex-col gap-6 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-4 bg-main rounded-full" />
            <h2 className="text-[15px] font-black text-gray-900 tracking-tight">
              스케줄 관리
            </h2>
          </div>

          <div className="flex justify-between items-center gap-2 px-1">
            {["월", "화", "수", "목", "금", "토", "일"].map((day) => {
              const isSelected = formData.operatingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`w-10 h-10 rounded-full font-black text-[13px] transition-all flex items-center justify-center shadow-sm ${isSelected ? "bg-main text-white scale-110" : "bg-white text-gray-300"}`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {formData.operatingDays.map((day) => (
            <div
              key={day}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm animate-in zoom-in-95 duration-300"
            >
              <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-3">
                <span className="text-[14px] font-black text-gray-800">
                  {day}요일 클래스
                </span>
                <div className="flex gap-2">
                  <input
                    type="time"
                    id={`time-${day}`}
                    className="bg-gray-50 border-none rounded-lg px-2 py-1.5 text-xs font-bold outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById(
                        `time-${day}`
                      ) as HTMLInputElement;
                      if (input?.value) {
                        handleAddTime(day, input.value);
                        input.value = "";
                      }
                    }}
                    className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[11px] font-black btn-press"
                  >
                    추가
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.operatingTimes[day].length === 0 ? (
                  <p className="text-[11px] text-gray-300 font-bold py-1">
                    추가된 시간이 없습니다.
                  </p>
                ) : (
                  formData.operatingTimes[day].map((time) => (
                    <div
                      key={time}
                      className="flex items-center gap-2 bg-amber-50 text-main px-3 py-1.5 rounded-xl text-[12px] font-black border border-main/10 group"
                    >
                      <span>
                        {time}{" "}
                        {formData.duration &&
                          `~ ${calculateEndTime(time, formData.duration)}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(day, time)}
                        className="hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] p-5 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
        <CommonButton
          label={isSubmitting ? "저장 중..." : texts.SUBMIT}
          onClick={handleSubmit}
          disabled={isSubmitDisabled || isSubmitting}
          className="h-[60px] rounded-[22px] shadow-lg shadow-main/10 font-black text-[16px]"
        />
      </div>

      {/* Integrated Modals */}
      {modalState.isOpen && (
        <CommonModal
          variant={modalState.variant}
          title={modalState.title}
          desc={modalState.desc}
          confirmLabel="확인"
          onConfirmClick={() => setModalState({ ...modalState, isOpen: false })}
        />
      )}
    </div>
  );
};

export default TicketForm;
