import { useState } from "react";
import { CREATE_TICKET_TEXT, EXERCISE_CATEGORIES } from "@constant";
import { calculateEndTime } from "@utils";
import { Plus, X, Copy, Clock, Sparkles, ChevronRight } from "lucide-react";

interface InfoStepProps {
  formData: {
    title: string;
    description: string;
    category: string;
    price: string | number;
    capacity: string | number;
    duration: string;
    supplies: string;
    tags: string[];
    features: string[];
    operatingDays: string[];
    operatingTimes: Record<string, string[]>;
  };
  imagePreviews: string[];
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
}

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

const InfoStep = ({
  formData,
  imagePreviews,
  handleChange,
  handleFeatureChange,
  handleTagChange,
  handleDayToggle,
  handleAddTime,
  handleRemoveTime,
}: InfoStepProps) => {
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

  return (
    <div className="flex flex-col h-full bg-[#FDFDFD] pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700 font-pretendard">
      {/* ── 1. Class Overview ── */}
      <section className="px-5 py-8 flex flex-col gap-6">
        <div className="flex items-center gap-2.5 ml-1">
          <div className="w-1.5 h-4.5 bg-main rounded-full" />
          <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
            클래스 개요
          </h2>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-[32px] p-6 shadow-[0_15px_40px_rgba(0,0,0,0.03)] border border-gray-50 flex gap-5 transition-all focus-within:ring-4 focus-within:ring-main/5 focus-within:border-main/20">
            <div className="w-24 aspect-square rounded-full overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 shadow-inner ring-4 ring-gray-50/50">
              <img
                src={imagePreviews[0]}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.DESC}
              className="flex-1 py-1 text-[14px] font-bold outline-none resize-none leading-relaxed placeholder:text-gray-200 text-gray-700"
              rows={4}
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-[13px] font-black text-gray-400 ml-1">
              클래스 제목 *
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.TITLE}
              className="w-full h-[60px] rounded-[24px] bg-white border border-gray-100 px-6 text-[15px] font-bold text-gray-900 outline-none focus:border-main/40 focus:ring-4 focus:ring-main/5 transition-all shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* ── 2. Settings Card ── */}
      <section className="px-5 py-10 bg-white rounded-t-[40px] border-t border-gray-100 shadow-[0_-12px_40px_rgba(0,0,0,0.03)] flex flex-col gap-10">
        <div className="flex items-center gap-2.5 ml-1">
          <div className="w-1.5 h-4.5 bg-main rounded-full" />
          <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
            상세 설정
          </h2>
        </div>

        <div className="flex flex-col gap-8">
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
                  className="w-full h-[60px] bg-gray-50/50 rounded-[22px] px-6 text-[14px] font-black text-gray-800 outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all appearance-none shadow-sm"
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
                  <ChevronRight size={18} className="rotate-90 text-gray-900" />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <label className="text-[13px] font-black text-gray-400 ml-1">
                1회당 가격 *
              </label>
              <div className="relative">
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.PRICE}
                  className="w-full h-[60px] bg-gray-50/50 rounded-[22px] px-6 text-[15px] font-black text-gray-900 outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all shadow-sm pr-16"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-main font-black text-[10px] tracking-widest bg-main/5 px-2 py-1 rounded-lg">
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
                placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.CAPACITY}
                className="w-full h-[60px] bg-gray-50/50 rounded-[22px] px-6 text-[15px] font-bold text-gray-900 outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all shadow-sm"
              />
            </div>
            <div className="flex flex-col gap-2.5">
              <label className="text-[13px] font-black text-gray-400 ml-1">
                수업 시간 (분) *
              </label>
              <input
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.DURATION}
                className="w-full h-[60px] bg-gray-50/50 rounded-[22px] px-6 text-[15px] font-bold text-gray-900 outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <label className="text-[13px] font-black text-gray-400 ml-1">
              준비물 (선택)
            </label>
            <input
              name="supplies"
              value={formData.supplies}
              onChange={handleChange}
              placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.SUPPLIES}
              className="w-full h-[60px] bg-gray-50/50 rounded-[22px] px-6 text-[14px] font-bold text-gray-800 outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* ── 3. Tags & Features ── */}
      <section className="px-5 py-16 bg-[#FDFDFD] flex flex-col gap-12">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2.5 ml-1">
            <div className="w-1.5 h-4.5 bg-gray-900 rounded-full" />
            <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
              태그 및 특징
            </h2>
          </div>
          <div className="flex gap-3">
            {formData.tags.map((tag: string, index: number) => (
              <div
                key={index}
                className="flex-1 relative flex items-center bg-white rounded-2xl px-4 h-[60px] shadow-sm border border-gray-100 focus-within:border-main/30 transition-all"
              >
                <span className="text-main font-black mr-2 text-sm opacity-50">
                  #
                </span>
                <input
                  value={tag}
                  onChange={(e) => handleTagChange(index, e.target.value)}
                  placeholder={`태그${index + 1}`}
                  className="w-full bg-transparent text-[14px] font-bold outline-none text-gray-700"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <label className="text-[13px] font-black text-gray-400 ml-1">
            프로그램 특징 (최대 3개)
          </label>
          <div className="flex flex-col gap-5">
            {formData.features.map((feature: string, index: number) => (
              <div key={index} className="flex gap-5 items-center group">
                <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shrink-0 shadow-lg shadow-gray-200">
                  <span className="text-white font-black text-[12px]">
                    {index + 1}
                  </span>
                </div>
                <input
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder={
                    index === 0
                      ? CREATE_TICKET_TEXT.PLACEHOLDERS.FEATURE
                      : "추가 특징을 입력하세요"
                  }
                  className="flex-1 bg-transparent border-b border-gray-100 py-3 text-[15px] font-bold text-gray-700 outline-none focus:border-main transition-colors placeholder:text-gray-200"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Schedule Section ── */}
      <section className="px-5 py-16 bg-white rounded-b-[40px] shadow-xl flex flex-col gap-12">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5 ml-1">
              <div className="w-1.5 h-4.5 bg-main rounded-full" />
              <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
                운영 요일 설정
              </h2>
            </div>
            <p className="text-[12px] font-bold text-gray-400 ml-1 leading-relaxed">
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
          <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-top-4 duration-600">
            <div className="flex flex-col gap-2.5 border-t border-gray-50 pt-12">
              <div className="flex items-center gap-2.5 ml-1">
                <Clock size={18} className="text-main" />
                <h3 className="text-[17px] font-black text-gray-900">
                  상세 시간 설정
                </h3>
              </div>
              <p className="text-[12px] font-bold text-gray-400 ml-1 leading-relaxed">
                각 요일별로 수업이 시작되는 시간을 추가해 주세요.
              </p>
            </div>

            {["월", "화", "수", "목", "금", "토", "일"]
              .filter((day) => formData.operatingDays.includes(day))
              .map((day) => (
                <div
                  key={day}
                  className="flex flex-col gap-6 p-7 bg-gray-50/50 rounded-[32px] border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white text-[16px] font-black shadow-lg">
                        {day}
                      </div>
                      <span className="text-[15px] font-black text-gray-800">
                        요일 스케줄
                      </span>
                    </div>

                    {formData.operatingTimes[day].length > 0 &&
                      formData.operatingDays.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleApplyToAll(day)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-[11px] font-black text-gray-500 hover:bg-main/5 hover:text-main hover:border-main/20 transition-all shadow-sm"
                        >
                          <Copy size={13} />
                          전체 적용
                        </button>
                      )}
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex gap-3">
                      <div className="relative flex-1 group">
                        <input
                          type="time"
                          id={`time-${day}`}
                          className="w-full bg-white border border-gray-100 rounded-[20px] h-[56px] px-6 text-[16px] font-black outline-none focus:border-main/40 transition-all pr-14"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPresets(showPresets === day ? null : day)
                          }
                          className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                            showPresets === day
                              ? "bg-main text-white shadow-lg shadow-main/20"
                              : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                          }`}
                        >
                          <Sparkles size={18} />
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
                        className="bg-gray-900 text-white px-8 h-[56px] rounded-[20px] text-[15px] font-black shadow-xl active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Plus size={20} strokeWidth={3} />
                        추가
                      </button>
                    </div>

                    {/* Quick Presets Grid */}
                    {showPresets === day && (
                      <div className="grid grid-cols-4 gap-2.5 p-5 bg-white rounded-[24px] border border-gray-100 animate-in zoom-in-95 duration-300 shadow-2xl shadow-gray-200/50">
                        {PRESET_HOURS.map((hour) => (
                          <button
                            key={hour}
                            type="button"
                            onClick={() => {
                              handleAddTime(day, hour);
                              setShowPresets(null);
                            }}
                            className="h-11 bg-gray-50 hover:bg-main/10 hover:text-main text-gray-500 rounded-xl text-[13px] font-black transition-all border border-transparent hover:border-main/20"
                          >
                            {hour}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {formData.operatingTimes[day].length > 0 && (
                    <div className="flex flex-wrap gap-3 pt-2">
                      {formData.operatingTimes[day].map((time: string) => (
                        <div
                          key={time}
                          className="group relative flex items-center gap-4 bg-white text-gray-800 pl-5 pr-4 py-3.5 rounded-[22px] text-[14px] font-black border border-gray-100 shadow-sm transition-all hover:border-main/20 hover:shadow-md"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-main text-[14px]">
                              {time}
                            </span>
                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tight">
                              ~{" "}
                              {formData.duration
                                ? calculateEndTime(time, formData.duration)
                                : "End"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveTime(day, time)}
                            className="w-7 h-7 flex items-center justify-center rounded-xl bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                          >
                            <X size={15} strokeWidth={3} />
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
  );
};

export default InfoStep;
