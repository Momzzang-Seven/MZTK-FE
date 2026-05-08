import { useRef, useCallback } from "react";
import { usePostStore } from "@store";
import { useImageUpload } from "@hooks";

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

      // 같은 파일 재선택 허용
      if (inputRef.current) inputRef.current.value = "";
    },
    [images.length, maxImages, uploadImages]
  );

  return (
    <div className="w-full px-4">
      {/* 이미지 그리드 */}
      <div className="grid grid-cols-3 gap-2">
        {images.map((img) => (
          <div key={img.imageId} className="relative aspect-square">
            <img
              src={img.imageUrl}
              alt="업로드된 이미지"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => removeImage(img.imageId)}
              className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-black/50 text-white text-xs rounded-full"
            >
              ×
            </button>
          </div>
        ))}

        {/* 추가 버튼 */}
        {images.length < maxImages && (
          <div
            className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <img
              src="/icon/gallery.svg"
              alt="gallery"
              className="w-10 h-10 mb-1"
            />
            <span className="text-xs text-gray-500 font-medium">
              {images.length}/{maxImages}
            </span>
          </div>
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
