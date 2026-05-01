import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageUploadNodeView from "./ImageUploadNodeView";

const ImageUploadNode = Image.extend({
  name: "imageUploadNode",

  draggable: false,

  addAttributes() {
    return {
      ...this.parent?.(),
      imageId: {
        default: null,
        parseHTML: (element) => element.getAttribute("imageId"),
        renderHTML: (attrs) =>
          attrs.imageId ? { "imageId": attrs.imageId } : {},
      },
      uploading: {
        default: false,
        // HTML에 반영하면 안 되는 UI 전용 상태이므로 직렬화/파싱 시 무시
        renderHTML: () => ({}),
        parseHTML: () => false,
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageUploadNodeView);
  },
});

export default ImageUploadNode;
