import { type RefObject } from "react";

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
  // The first image is the representative one (idx 0)
  const mainPreview = imagePreviews.length > 0 ? imagePreviews[0] : null;

  return (
    <div className="flex flex-col h-full bg-[#FDFDFD] animate-in fade-in duration-700">
      {/* ── Main Preview Section ── */}
      <div className="relative px-6 pt-6 pb-2">
        <div className="aspect-[4/3] w-full bg-white rounded-[32px] overflow-hidden shadow-2xl shadow-gray-200/40 border border-gray-50 flex items-center justify-center group relative">
          {mainPreview ? (
            <>
              <img
                src={mainPreview}
                alt="Representative"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute top-5 left-5 bg-main/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                <span className="text-[11px] font-black text-white uppercase tracking-wider">
                  Main Cover
                </span>
              </div>
            </>
          ) : (
            <button
              onClick={triggerFileInput}
              className="flex flex-col items-center gap-5 text-gray-300 btn-press group-active:scale-95 transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center shadow-inner group-hover:bg-amber-50 transition-colors">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-30 text-gray-400 group-hover:text-main group-hover:opacity-100 transition-all"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <span className="text-sm font-black text-gray-400 tracking-tight">
                클래스 대표 사진을 선택하세요
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ── Gallery Header ── */}
      <div className="px-6 py-6 flex justify-between items-end">
        <div>
          <h2 className="text-[18px] font-black text-gray-900 tracking-tight">
            갤러리
          </h2>
          <p className="text-[12px] font-bold text-gray-400 mt-0.5">
            매력적인 사진으로 수강생의 시선을 사로잡으세요.
          </p>
        </div>
        <div className="flex items-baseline gap-1.5 bg-amber-50 px-3 py-1 rounded-xl border border-main/10">
          <span className="text-[15px] font-black text-main">
            {imagePreviews.length}
          </span>
          <span className="text-[11px] font-black text-main/40 uppercase tracking-tighter">
            / 5
          </span>
        </div>
      </div>

      {/* ── Thumbnails Grid ── */}
      <div className="px-6 pb-12">
        <div className="grid grid-cols-3 gap-4">
          {/* Add Button */}
          {imagePreviews.length < 5 && (
            <button
              onClick={triggerFileInput}
              className="aspect-square bg-white rounded-[24px] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-2 btn-press hover:border-main/40 hover:bg-amber-50/10 transition-all"
            >
              <div className="w-10 h-10 rounded-[18px] bg-gray-50 flex items-center justify-center shadow-inner">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
            </button>
          )}

          {/* Thumbnails */}
          {imagePreviews.map((img, idx) => (
            <div
              key={idx}
              className={`aspect-square relative rounded-[24px] overflow-hidden border-2 transition-all duration-300 ${idx === 0 ? "border-main shadow-xl shadow-main/20 ring-4 ring-main/5" : "border-white shadow-md shadow-gray-200/50"}`}
            >
              <img
                src={img}
                alt={`thumb-${idx}`}
                className="w-full h-full object-cover"
              />

              {/* Remove Button */}
              <button
                onClick={() => onRemoveImage(idx)}
                className="absolute top-2.5 right-2.5 w-7 h-7 bg-white/90 backdrop-blur-md text-gray-900 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform z-10"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>

              {/* Label */}
              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-main py-1.5">
                  <p className="text-[10px] font-black text-white text-center uppercase tracking-widest">
                    Main
                  </p>
                </div>
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
