import { CREATE_TICKET_TEXT, EXERCISE_CATEGORIES } from "@constant";
import { calculateEndTime } from "@utils";

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
  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] pb-32 animate-in slide-in-from-right duration-700">
      {/* ── 1. Class Overview ── */}
      <section className="px-5 py-8 flex flex-col gap-6">
        <div className="flex items-center gap-2.5 ml-1">
          <div className="w-1.5 h-4.5 bg-main rounded-full" />
          <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
            클래스 개요
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-100 flex gap-4">
            <div className="w-24 aspect-square rounded-[20px] overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100 shadow-inner">
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
              className="flex-1 py-1 text-[14px] font-bold outline-none resize-none leading-relaxed placeholder:text-gray-300 text-gray-700"
              rows={4}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-black text-gray-400 ml-1">
              클래스 제목 *
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.TITLE}
              className="w-full h-[56px] rounded-2xl bg-white border border-gray-100 px-5 text-[15px] font-bold text-gray-900 outline-none focus:border-main focus:ring-4 focus:ring-main/5 transition-all shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* ── 2. Settings Card ── */}
      <section className="px-5 py-6 bg-white rounded-t-[32px] border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.02)] flex flex-col gap-8">
        <div className="flex items-center gap-2.5 ml-1 mt-2">
          <div className="w-1.5 h-4.5 bg-main rounded-full" />
          <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
            상세 설정
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-black text-gray-400 ml-1">
              카테고리 *
            </label>
            <div className="relative">
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full h-[56px] bg-gray-50/50 rounded-2xl px-5 text-[14px] font-black text-gray-800 outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all appearance-none"
              >
                {EXERCISE_CATEGORIES.filter((cat) => cat.key !== "ALL").map(
                  (cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  )
                )}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-black text-gray-400 ml-1">
              1회당 가격 *
            </label>
            <div className="relative">
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.PRICE}
                className="w-full h-[56px] bg-gray-50/50 rounded-2xl px-5 text-[14px] font-black text-gray-800 outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-main font-black text-[10px] tracking-widest bg-amber-50 px-1.5 py-0.5 rounded-lg">
                MZTK
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-black text-gray-400 ml-1">
              모집 정원 (명) *
            </label>
            <input
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
              placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.CAPACITY}
              className="w-full h-[56px] bg-gray-50/50 rounded-2xl px-5 text-[14px] font-black text-gray-800 outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-black text-gray-400 ml-1">
              수업 시간 *
            </label>
            <input
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.DURATION}
              className="w-full h-[56px] bg-gray-50/50 rounded-2xl px-5 text-[14px] font-black text-gray-800 outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[12px] font-black text-gray-400 ml-1">
            준비물 (선택)
          </label>
          <input
            name="supplies"
            value={formData.supplies}
            onChange={handleChange}
            placeholder={CREATE_TICKET_TEXT.PLACEHOLDERS.SUPPLIES}
            className="w-full h-[56px] bg-gray-50/50 rounded-2xl px-5 text-[14px] font-black text-gray-800 outline-none border border-transparent focus:border-main/30 focus:bg-white transition-all"
          />
        </div>
      </section>

      {/* ── 3. Tags & Features ── */}
      <section className="px-5 py-10 bg-[#FDFDFD] flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5 ml-1">
            <div className="w-1.5 h-4.5 bg-gray-900 rounded-full" />
            <h2 className="text-[16px] font-black text-gray-900 tracking-tight">
              태그 및 특징
            </h2>
          </div>
          <div className="flex gap-2">
            {formData.tags.map((tag: string, index: number) => (
              <div
                key={index}
                className="flex-1 relative flex items-center bg-white rounded-2xl px-3 h-[52px] shadow-sm border border-gray-100 focus-within:border-main/30 transition-all"
              >
                <span className="text-main font-black mr-1 text-sm">#</span>
                <input
                  value={tag}
                  onChange={(e) => handleTagChange(index, e.target.value)}
                  placeholder={`태그${index + 1}`}
                  className="w-full bg-transparent text-[13px] font-bold outline-none text-gray-700"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-2">
          <label className="text-[13px] font-black text-gray-400 ml-1">
            프로그램 특징 (선택)
          </label>
          <div className="flex flex-col gap-3">
            {formData.features.map((feature: string, index: number) => (
              <div key={index} className="flex gap-4 items-center group">
                <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <span className="text-main font-black text-[12px]">
                    {index + 1}
                  </span>
                </div>
                <input
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  placeholder={
                    index === 0 ? CREATE_TICKET_TEXT.PLACEHOLDERS.FEATURE : ""
                  }
                  className="flex-1 bg-transparent border-b border-gray-100 py-3 text-[14px] font-bold text-gray-700 outline-none focus:border-main transition-colors"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Schedule Section ── */}
      <section className="px-5 py-10 bg-white rounded-b-[32px] shadow-lg flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 ml-1">
              <div className="w-1.5 h-4.5 bg-main rounded-full" />
              <h2 className="text-[17px] font-black text-gray-900 tracking-tight">
                운영 스케줄
              </h2>
            </div>
            <p className="text-[11px] font-bold text-gray-400 ml-1">
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
                  className={`w-11 h-11 rounded-full font-black text-sm transition-all flex items-center justify-center shadow-sm ${isSelected ? "bg-main text-white scale-110 shadow-lg shadow-main/20" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {formData.operatingDays.length > 0 && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col gap-1 border-t border-gray-50 pt-8">
              <h3 className="text-[15px] font-black text-gray-800 ml-1">
                상세 시간 설정
              </h3>
              <p className="text-[11px] font-bold text-gray-400 ml-1">
                {CREATE_TICKET_TEXT.LABELS.OPERATING_HOURS_DESC}
              </p>
            </div>

            {["월", "화", "수", "목", "금", "토", "일"]
              .filter((day) => formData.operatingDays.includes(day))
              .map((day) => (
                <div
                  key={day}
                  className="flex flex-col gap-4 p-5 bg-[#F9FAFB] rounded-3xl border border-gray-100"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-gray-900 flex items-center justify-center text-white text-sm font-black shadow-lg">
                      {day}
                    </div>
                    <div className="flex flex-1 gap-2">
                      <input
                        type="time"
                        id={`time-${day}`}
                        className="flex-1 bg-white border border-gray-100 rounded-xl h-[48px] px-4 text-sm font-black outline-none focus:border-main/50"
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
                        className="bg-main text-white px-5 h-[48px] rounded-xl text-xs font-black shadow-lg shadow-main/15 active:scale-95 transition-all"
                      >
                        추가
                      </button>
                    </div>
                  </div>

                  {formData.operatingTimes[day].length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-12">
                      {formData.operatingTimes[day].map((time: string) => (
                        <div
                          key={time}
                          className="flex items-center gap-2 bg-white text-gray-700 px-3 py-2 rounded-xl text-[12px] font-black border border-gray-100 shadow-sm animate-in zoom-in-95 duration-300"
                        >
                          <span className="text-main/60 mr-0.5 opacity-50">
                            ●
                          </span>
                          <span>
                            {formData.duration
                              ? `${time} ~ ${calculateEndTime(time, formData.duration)}`
                              : time}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTime(day, time)}
                            className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
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
