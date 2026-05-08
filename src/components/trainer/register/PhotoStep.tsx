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
  const mainPreview =
    imagePreviews.length > 0 ? imagePreviews[imagePreviews.length - 1] : null;

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in duration-500">
      {/* Main Preview */}
      <div className="w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
        {mainPreview ? (
          <img
            src={mainPreview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-300">
            <img
              src="/icon/gallery.svg"
              alt="gallery"
              className="w-16 h-16 opacity-30"
            />
            <span className="text-sm font-medium">사진을 선택해 주세요</span>
          </div>
        )}
      </div>

      {/* Gallery Info & Grid */}
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-bold text-gray-800">최근 항목</span>
          <span className="text-xs font-bold text-gray-400">
            {imagePreviews.length} / 5
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* Add Button */}
          <button
            onClick={triggerFileInput}
            className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center active:scale-95 transition-transform"
          >
            <img
              src="/icon/camera.svg"
              alt="camera"
              className="w-6 h-6 opacity-40"
            />
          </button>

          {/* Thumbnails */}
          {imagePreviews.map((img, idx) => (
            <div
              key={idx}
              className="aspect-square relative rounded-lg overflow-hidden border border-gray-100 group"
            >
              <img
                src={img}
                alt={`thumb-${idx}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onRemoveImage(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center text-[10px]"
              >
                ✕
              </button>
              {idx === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-main/80 backdrop-blur-sm text-[8px] text-white text-center py-0.5 font-bold">
                  대표
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
