import { useRef, useCallback } from "react";
import { usePostStore } from "@store";
import { useImageUpload } from "@hooks";
import { Image as ImageIcon, X, Plus } from "lucide-react";

interface MultiImageUploaderProps {
  maxImages?: number;
}

const FreePostImageUploader = ({ maxImages = 5 }: MultiImageUploaderProps) => {
  const images = usePostStore((s) => s.images);
  const addImage = usePostStore((s) => s.addImage);
  const removeImage = usePostStore((s) => s.removeImage);
  const incrementUploading = usePostStore((s) => s.incrementUploading);
  const decrementUploading = usePostStore((s) => s.decrementUploading);

  const { uploadImages } = useImageUpload("COMMUNITY_FREE", {
    onUploaded: addImage,
    onUploadStart: incrementUploading,
    onUploadEnd: decrementUploading,
  });

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectImages = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const remaining = maxImages - images.length;
      const selected = Array.from(files).slice(0, remaining);

      await uploadImages(selected);

      if (inputRef.current) inputRef.current.value = "";
    },
    [images.length, maxImages, uploadImages]
  );

  return (
    <div className="w-full px-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2 text-gray-900 font-black tracking-tight">
          <ImageIcon size={18} className="text-main" />
          <span>사진 추가</span>
        </div>
        <span className="text-[12px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
          {images.length} / {maxImages}
        </span>
      </div>

      {/* 이미지 그리드 */}
      <div className="grid grid-cols-3 gap-3">
        {images.map((img) => (
          <div key={img.imageId} className="relative aspect-square group">
            <img
              src={img.imageUrl}
              alt="uploaded"
              className="w-full h-full object-cover rounded-[24px] shadow-sm group-hover:brightness-90 transition-all"
            />
            <button
              type="button"
              onClick={() => removeImage(img.imageId)}
              className="absolute -top-1.5 -right-1.5 w-6 h-6 flex items-center justify-center bg-gray-900/80 text-white rounded-full shadow-lg backdrop-blur-sm active:scale-90 transition-all"
            >
              <X size={14} strokeWidth={3} />
            </button>
          </div>
        ))}

        {/* 추가 버튼 */}
        {images.length < maxImages && (
          <button
            type="button"
            className="aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-[24px] flex flex-col items-center justify-center cursor-pointer hover:border-main/50 hover:bg-main/5 transition-all active:scale-95 group"
            onClick={() => inputRef.current?.click()}
          >
            <div className="p-3 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
              <Plus
                size={24}
                className="text-gray-400 group-hover:text-main"
                strokeWidth={3}
              />
            </div>
            <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest">
              Add Photo
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleSelectImages}
      />
    </div>
  );
};

export default FreePostImageUploader;
