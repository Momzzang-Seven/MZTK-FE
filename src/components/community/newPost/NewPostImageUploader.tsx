import { useRef, useState } from "react";

interface NewPostImageUploaderProps {
  onChange: (file: File | null) => void;
}

const NewPostImageUploader = ({ onChange }: NewPostImageUploaderProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });

    onChange(file);
  };

  return (
    <div className="w-full">
      {/* 사진 선택 영역 */}
      <div
        className="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
        onClick={() => galleryInputRef.current?.click()}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="선택한 사진"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center">
            <img
              src="/icon/gallery.svg"
              alt="gallery"
              className="w-18 h-18 mb-2"
            />
            <span className="font-semibold text-sm text-gray-500">
              사진을 선택하세요
            </span>
          </div>
        )}
      </div>

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSelectImage}
      />
    </div>
  );
};

export default NewPostImageUploader;
