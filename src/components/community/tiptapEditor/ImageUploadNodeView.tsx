import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";

const ImageUploadNodeView = ({ node }: NodeViewProps) => {
  const { src, uploading } = node.attrs;

  return (
    <NodeViewWrapper draggable="false" data-drag-handle="">
      <div
        className="relative"
        draggable={false}
        onDragStart={(e) => e.preventDefault()}
      >
        {src && (
          <img
            src={src}
            alt="삽입된 이미지"
            draggable={false}
            className={`w-full rounded-lg select-none ${
              uploading ? "opacity-50" : ""
            }`}
          />
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ImageUploadNodeView;
