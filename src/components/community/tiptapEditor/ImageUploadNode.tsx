import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageUploadNodeView from "./ImageUploadNodeView";

const ImageUploadNode = Image.extend({
  name: "imageUploadNode",

  draggable: false,

  addAttributes() {
    return {
      ...this.parent?.(),
      uuid: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-uuid"),
        // 서버 제출 시 src 대신 uuid로 이미지를 식별해야 하므로 data-uuid로 직렬화
        renderHTML: (attrs) =>
          attrs.uuid ? { "data-uuid": attrs.uuid } : {},
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
