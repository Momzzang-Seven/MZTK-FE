import { useRef } from "react";
import { ACCEPTED_IMAGE_INPUT_TYPES } from "@utils";

interface PhotoUploaderProps {
  previewUrl: string | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  guideTitle: string;
  guideDesc: string;
  uploadNoImageText: string;
  uploadSizeHintText: string;
  height?: string;
}

export const PhotoUploader = ({
  previewUrl,
  onFileChange,
  guideTitle,
  guideDesc,
  uploadNoImageText,
  uploadSizeHintText,
}: PhotoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Guide Card */}
      <div className="bg-gradient-to-br from-main to-amber-400 rounded-[24px] p-5 shadow-xl shadow-main/20">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <div>
            <p className="text-white font-black text-[15px] leading-snug">
              {guideTitle}
            </p>
            <p className="text-white/80 text-[12px] font-bold mt-1 leading-relaxed">
              {guideDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="btn-press w-full rounded-[24px] border-2 border-dashed overflow-hidden transition-all group"
        style={{
          borderColor: previewUrl ? "transparent" : "#E5E7EB",
          background: previewUrl ? "transparent" : "#FAFAFA",
          minHeight: "300px",
          padding: previewUrl ? 0 : undefined,
        }}
      >
        {previewUrl ? (
          /* Preview */
          <div className="relative w-full" style={{ minHeight: "300px" }}>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full object-cover rounded-[22px]"
              style={{ minHeight: "300px" }}
            />
            {/* Re-select overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-[22px] flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#111827"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="text-[12px] font-black text-gray-800">
                  사진 변경
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 group-hover:bg-main/10 transition-colors flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:stroke-main transition-colors"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-gray-700 font-black text-[15px] group-hover:text-gray-900 transition-colors">
                {uploadNoImageText}
              </p>
              <p className="text-gray-400 text-[12px] font-bold mt-1">
                {uploadSizeHintText}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-main/8 text-main px-4 py-2 rounded-xl">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span className="text-[12px] font-black">사진 선택하기</span>
            </div>
          </div>
        )}
      </button>
      <input
        type="file"
        accept={ACCEPTED_IMAGE_INPUT_TYPES}
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        data-testid="photo-input"
      />
    </div>
  );
};
