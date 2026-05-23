import {
  CREATE_TICKET_TEXT,
  EDIT_TICKET_TEXT,
  EXERCISE_CATEGORIES,
} from "@constant";
import TrainerHeader from "@components/trainer/TrainerHeader";
import { CommonButton, CommonModal } from "@components/common";
import { calculateEndTime } from "@utils";
import { useState } from "react";
import { Plus, X, Copy, Clock, Sparkles, ChevronRight } from "lucide-react";

const PRESET_HOURS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

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

  const [showPresets, setShowPresets] = useState<string | null>(null);

  const handleApplyToAll = (sourceDay: string) => {
    const sourceTimes = formData.operatingTimes[sourceDay];
    if (sourceTimes.length === 0) return;

    formData.operatingDays.forEach((day) => {
      if (day === sourceDay) return;
      // Clear existing and apply new
      const existingTimes = formData.operatingTimes[day];
      existingTimes.forEach((t) => handleRemoveTime(day, t));
      sourceTimes.forEach((t) => handleAddTime(day, t));
    });
  };

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
    <div className="flex flex-col h-full bg-[#FDFDFD] min-h-dvh font-pretendard">
      <TrainerHeader
        title="클래스 수정"
        desc="수정된 정보는 수강생들에게 즉시 반영됩니다."
        showBack
        backTo="/trainer/list"
      />

      <div className="flex-1 overflow-y-auto pb-40 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* 1. Media Section */}
        <section className="px-5 py-8 flex flex-col gap-6">
          <div className="flex items-center gap-2.5 ml-1">
            <div className="w-1.5 h-4.5 bg-main rounded-full" />
            <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
              클래스 미디어
            </h2>
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-1">
            <button
              onClick={triggerFileInput}
              className="w-28 h-28 rounded-[32px] bg-white border-2 border-dashed border-gray-100 flex flex-col items-center justify-center shrink-0 active:scale-95 transition-all group hover:border-main/30 shadow-sm"
            >
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center mb-2 group-hover:bg-amber-50 transition-colors">
                <Plus
                  size={24}
                  className="text-gray-300 group-hover:text-main"
                />
              </div>
              <span className="text-[11px] font-black text-gray-400">
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
                className="relative w-28 h-28 rounded-[32px] overflow-hidden border border-gray-100 shadow-md shrink-0 group"
              >
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {idx === 0 && (
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-gray-900/80 backdrop-blur-md text-white text-[9px] font-black rounded-full uppercase tracking-widest shadow-lg">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 2. Basic Info Section */}
        <section className="px-5 py-8 flex flex-col gap-8 bg-white rounded-t-[40px] border-t border-gray-100 shadow-[0_-12px_40px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2.5 ml-1">
            <div className="w-1.5 h-4.5 bg-main rounded-full" />
            <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
              클래스 정보
            </h2>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2.5">
              <label className="text-[13px] font-black text-gray-400 ml-1">
                클래스 제목 *
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.TITLE}
                className="w-full h-[60px] rounded-[24px] bg-gray-50/50 border border-transparent px-6 text-[15px] font-bold text-gray-900 outline-none focus:border-main/30 focus:bg-white focus:ring-4 focus:ring-main/5 transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-[13px] font-black text-gray-400 ml-1">
                상세 설명 *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.DESC}
                rows={5}
                className="w-full rounded-[28px] bg-gray-50/50 border border-transparent p-6 text-[15px] font-bold text-gray-900 outline-none focus:border-main/30 focus:bg-white focus:ring-4 focus:ring-main/5 transition-all shadow-sm resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2.5">
                <label className="text-[13px] font-black text-gray-400 ml-1">
                  카테고리 *
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full h-[60px] rounded-[24px] bg-gray-50/50 border border-transparent px-6 text-[15px] font-black text-gray-900 outline-none appearance-none focus:border-main/30 focus:bg-white transition-all shadow-sm"
                  >
                    {EXERCISE_CATEGORIES.filter((cat) => cat.key !== "ALL").map(
                      (cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.label}
                        </option>
                      )
                    )}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-30">
                    <ChevronRight
                      size={18}
                      className="rotate-90 text-gray-900"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-[13px] font-black text-gray-400 ml-1">
                  1회 가격 (MZTK) *
                </label>
                <div className="relative">
                  <input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full h-[60px] rounded-[24px] bg-gray-50/50 border border-transparent px-6 text-[16px] font-black text-main outline-none focus:border-main/30 focus:bg-white transition-all shadow-sm pr-16"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-main font-black text-[10px] tracking-widest bg-main/5 px-2 py-1 rounded-lg">
                    MZTK
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2.5">
                <label className="text-[13px] font-black text-gray-400 ml-1">
                  모집 정원 (명) *
                </label>
                <input
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full h-[60px] rounded-[24px] bg-gray-50/50 border border-transparent px-6 text-[15px] font-bold text-gray-900 outline-none focus:border-main/30 focus:bg-white transition-all shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-2.5">
                <label className="text-[13px] font-black text-gray-400 ml-1">
                  진행 시간 (분) *
                </label>
                <input
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="60"
                  className="w-full h-[60px] rounded-[24px] bg-gray-50/50 border border-transparent px-6 text-[15px] font-bold text-gray-900 outline-none focus:border-main/30 focus:bg-white transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <label className="text-[13px] font-black text-gray-400 ml-1">
                {CREATE_TICKET_TEXT.LABELS.SUPPLIES}
              </label>
              <input
                name="supplies"
                value={formData.supplies}
                onChange={handleChange}
                placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.SUPPLIES}
                className="w-full h-[60px] rounded-[24px] bg-gray-50/50 border border-transparent px-6 text-[15px] font-bold text-gray-900 outline-none focus:border-main/30 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>
        </section>

        {/* 3. Features & Tags Section */}
        <section className="px-5 py-12 bg-[#FDFDFD] flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-2.5 ml-1">
              <div className="w-1.5 h-4.5 bg-gray-900 rounded-full" />
              <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
                프로그램 특징
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-4 items-center group">
                  <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center shrink-0 shadow-lg shadow-gray-200">
                    <span className="text-white font-black text-[12px]">
                      {index + 1}
                    </span>
                  </div>
                  <input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder={`특징 ${index + 1}을 입력하세요`}
                    className="flex-1 bg-transparent border-b border-gray-100 py-3 text-[15px] font-bold text-gray-700 outline-none focus:border-main transition-colors placeholder:text-gray-200"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 mt-4">
            <div className="flex items-center gap-2.5 ml-1">
              <div className="w-1.5 h-4.5 bg-gray-900 rounded-full" />
              <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
                검색 태그
              </h2>
            </div>
            <div className="flex gap-3">
              {formData.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex-1 flex items-center h-[56px] bg-white border border-gray-100 rounded-[20px] px-4 shadow-sm group focus-within:border-main/30 transition-all"
                >
                  <span className="text-main font-black text-sm mr-2 opacity-50">
                    #
                  </span>
                  <input
                    value={tag}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    placeholder="태그"
                    className="w-full bg-transparent text-[14px] font-bold outline-none text-gray-700"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Schedule Section */}
        <section className="px-5 py-12 bg-white rounded-b-[40px] shadow-xl flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5 ml-1">
                <div className="w-1.5 h-4.5 bg-main rounded-full" />
                <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
                  운영 요일 설정
                </h2>
              </div>
              <p className="text-[11px] font-bold text-gray-400 ml-1 leading-relaxed">
                {CREATE_TICKET_TEXT.LABELS.OPERATING_DAYS_DESC}
              </p>
            </div>

            <div className="flex justify-between items-center gap-2 px-1">
              {["월", "화", "수", "목", "금", "토", "일"].map((day) => {
                const isSelected = formData.operatingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`w-11 h-11 rounded-full font-black text-[13px] transition-all flex items-center justify-center shadow-sm ${
                      isSelected
                        ? "bg-main text-white scale-110 shadow-lg shadow-main/20"
                        : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {formData.operatingDays.length > 0 && (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-top-4 duration-600">
              <div className="flex flex-col gap-2 border-t border-gray-50 pt-10">
                <div className="flex items-center gap-2 ml-1">
                  <Clock size={16} className="text-main" />
                  <h3 className="text-[16px] font-black text-gray-900">
                    상세 시간 설정
                  </h3>
                </div>
                <p className="text-[11px] font-bold text-gray-400 ml-1 leading-relaxed">
                  각 요일별로 수업이 시작되는 시간을 추가해 주세요.
                </p>
              </div>

              {["월", "화", "수", "목", "금", "토", "일"]
                .filter((day) => formData.operatingDays.includes(day))
                .map((day) => (
                  <div
                    key={day}
                    className="flex flex-col gap-5 p-6 bg-gray-50/50 rounded-[32px] border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white text-[15px] font-black shadow-lg">
                          {day}
                        </div>
                        <span className="text-[14px] font-black text-gray-800">
                          요일 스케줄
                        </span>
                      </div>

                      {formData.operatingTimes[day].length > 0 &&
                        formData.operatingDays.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleApplyToAll(day)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-black text-gray-500 hover:bg-main/5 hover:text-main hover:border-main/20 transition-all shadow-sm"
                          >
                            <Copy size={12} />
                            모든 요일에 적용
                          </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1 group">
                          <input
                            type="time"
                            id={`time-${day}`}
                            className="w-full bg-white border border-gray-100 rounded-2xl h-[52px] px-5 text-[15px] font-black outline-none focus:border-main/40 transition-all pr-12"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPresets(showPresets === day ? null : day)
                            }
                            className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                              showPresets === day
                                ? "bg-main text-white"
                                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                            }`}
                          >
                            <Sparkles size={16} />
                          </button>
                        </div>
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
                          className="bg-gray-900 text-white px-6 h-[52px] rounded-2xl text-[14px] font-black shadow-lg active:scale-95 transition-all flex items-center gap-2"
                        >
                          <Plus size={18} strokeWidth={3} />
                          추가
                        </button>
                      </div>

                      {/* Quick Presets Grid */}
                      {showPresets === day && (
                        <div className="grid grid-cols-4 gap-2 p-4 bg-white rounded-2xl border border-gray-100 animate-in zoom-in-95 duration-300 shadow-xl shadow-gray-100/50">
                          {PRESET_HOURS.map((hour) => (
                            <button
                              key={hour}
                              type="button"
                              onClick={() => {
                                handleAddTime(day, hour);
                                setShowPresets(null);
                              }}
                              className="h-10 bg-gray-50 hover:bg-main/10 hover:text-main text-gray-500 rounded-xl text-[12px] font-black transition-all border border-transparent hover:border-main/20"
                            >
                              {hour}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {formData.operatingTimes[day].length > 0 && (
                      <div className="flex flex-wrap gap-2.5 pt-2">
                        {formData.operatingTimes[day].map((time: string) => (
                          <div
                            key={time}
                            className="group relative flex items-center gap-3 bg-white text-gray-800 pl-4 pr-3 py-3 rounded-2xl text-[13px] font-black border border-gray-100 shadow-sm transition-all hover:border-main/20 hover:shadow-md"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="text-main text-[13px]">
                                {time}
                              </span>
                              <span className="text-[9px] text-gray-300 font-bold uppercase">
                                ~{" "}
                                {formData.duration
                                  ? calculateEndTime(time, formData.duration)
                                  : "End"}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveTime(day, time)}
                              className="w-6 h-6 flex items-center justify-center rounded-xl bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                            >
                              <X size={14} strokeWidth={3} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] bg-white/95 backdrop-blur-xl border-t border-gray-100 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <CommonButton
          label={isSubmitting ? "저장 중..." : texts.SUBMIT}
          onClick={handleSubmit}
          disabled={isSubmitDisabled || isSubmitting}
          className="h-[64px] rounded-[24px] shadow-xl shadow-main/20 font-black text-[17px] tracking-tight active:scale-[0.98] transition-all"
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
