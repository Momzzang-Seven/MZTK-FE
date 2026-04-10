import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

const ImageUploadNodeView = ({ node }: NodeViewProps) => {
  const { src, uploading } = node.attrs;

  return (
    <NodeViewWrapper>
      <div className="relative my-2">
        {src && (
          <img
            src={src}
            alt="삽입된 이미지"
            className={`w-full rounded-lg ${
              uploading ? "opacity-50" : ""
            }`}
          />
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/60 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-gray-300 border-t-main rounded-full animate-spin" />
              <span className="text-xs text-gray-500 font-medium">
                업로드 중...
              </span>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ImageUploadNodeView;
