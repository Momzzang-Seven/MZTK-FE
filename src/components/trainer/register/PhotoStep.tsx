import { type RefObject } from "react";
import { Camera, Plus, X, Image as ImageIcon, Sparkles } from "lucide-react";

interface PhotoStepProps {
  imagePreviews: string[];
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  triggerFileInput: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

const PhotoStep = ({
  imagePreviews,
  onImageChange,
  onRemoveImage,
  triggerFileInput,
  fileInputRef,
}: PhotoStepProps) => {
  const mainPreview = imagePreviews.length > 0 ? imagePreviews[0] : null;

  return (
    <div className="flex flex-col h-full bg-[#FDFDFD] animate-in fade-in slide-in-from-bottom-4 duration-700 font-pretendard">
      {/* ── Tips Banner (Moved to top) ── */}
      <div className="mx-5 mb-8 p-6 bg-amber-50/50 rounded-[32px] border border-amber-100/30 flex gap-5 items-center">
        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
          <Camera size={24} className="text-main" />
        </div>
        <div className="flex flex-col gap-1">
          <h4 className="text-[14px] font-black text-gray-900">PRO TIP</h4>
          <p className="text-[12px] font-bold text-gray-400 leading-relaxed">
            전문적인 프로필과 수업 환경 사진은
            <br />
            <span className="text-main/80">
              예약 성공률을 40% 이상 높여줍니다.
            </span>
          </p>
        </div>
      </div>

      {/* ── Main Preview Section ── */}
      <div className="relative px-5 pb-2">
        <div className="aspect-[4/3] w-full bg-white rounded-[40px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-gray-100 flex items-center justify-center group relative">
          {mainPreview ? (
            <>
              <img
                src={mainPreview}
                alt="Representative"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute top-6 left-6 bg-gray-900/80 backdrop-blur-xl px-4 py-2 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-500">
                <Sparkles size={14} className="text-main" />
                <span className="text-[11px] font-black text-white uppercase tracking-[0.15em]">
                  Main Cover
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          ) : (
            <button
              onClick={triggerFileInput}
              className="flex flex-col items-center gap-6 text-gray-300 active:scale-95 transition-all group"
            >
              <div className="w-20 h-20 rounded-[28px] bg-gray-50 flex items-center justify-center shadow-inner group-hover:bg-amber-50 group-hover:scale-110 transition-all duration-500">
                <ImageIcon
                  size={36}
                  className="text-gray-200 group-hover:text-main transition-colors"
                />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[16px] font-black text-gray-900 tracking-tight">
                  대표 사진을 선택하세요
                </span>
                <span className="text-[12px] font-bold text-gray-300">
                  클래스의 첫인상을 결정합니다
                </span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* ── Gallery Header ── */}
      <div className="px-7 py-10 flex justify-between items-end">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <h2 className="text-[20px] font-black text-gray-900 tracking-tight">
              갤러리
            </h2>
            <div className="w-1.5 h-1.5 rounded-full bg-main" />
          </div>
          <p className="text-[13px] font-bold text-gray-400 leading-relaxed">
            다양한 각도의 사진으로 전문성을 보여주세요.
          </p>
        </div>
        <div className="flex items-baseline gap-1.5 bg-gray-50 px-4 py-2 rounded-[18px] border border-gray-100 shadow-sm">
          <span className="text-[17px] font-black text-gray-900">
            {imagePreviews.length}
          </span>
          <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">
            / 5
          </span>
        </div>
      </div>

      {/* ── Thumbnails Grid ── */}
      <div className="px-7 pb-16">
        <div className="grid grid-cols-3 gap-5">
          {/* Add Button */}
          {imagePreviews.length < 5 && (
            <button
              onClick={triggerFileInput}
              className="aspect-square bg-white rounded-[28px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-main/40 hover:bg-amber-50/5 transition-all group active:scale-95"
            >
              <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center shadow-inner group-hover:bg-amber-50">
                <Plus
                  size={24}
                  className="text-gray-400 group-hover:text-main"
                />
              </div>
            </button>
          )}

          {/* Thumbnails */}
          {imagePreviews.map((img, idx) => (
            <div
              key={idx}
              className={`aspect-square relative rounded-[28px] overflow-hidden border-2 transition-all duration-500 group ${
                idx === 0
                  ? "border-main shadow-[0_15px_35px_rgba(255,107,0,0.15)] ring-8 ring-main/5"
                  : "border-white shadow-[0_10px_25px_rgba(0,0,0,0.03)]"
              }`}
            >
              <img
                src={img}
                alt={`thumb-${idx}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Remove Button */}
              <button
                onClick={() => onRemoveImage(idx)}
                className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-md text-gray-900 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-red-500 hover:text-white z-10"
              >
                <X size={15} strokeWidth={3} />
              </button>

              {/* Index Badge */}
              <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-black/30 backdrop-blur-sm text-white text-[9px] font-black rounded-lg">
                0{idx + 1}
              </div>

              {/* Cover Indicator Overlay */}
              {idx === 0 && (
                <div className="absolute inset-0 border-4 border-main/20 rounded-[28px] pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={onImageChange}
        accept="image/*"
        multiple
        className="hidden"
      />
    </div>
  );
};

export default PhotoStep;
