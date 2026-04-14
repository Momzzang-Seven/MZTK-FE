import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useRef } from "react";
import type { ImageReferenceType } from "@types";
import { useImageUpload } from "@hooks/useImageUpload";
import ImageUploadNode from "@components/community/tiptapEditor/ImageUploadNode";

export const useTiptapEditor = (
  onChange: (html: string) => void,
  referenceType: ImageReferenceType,
) => {
  const { prepareSingleUpload, removeImage } = useImageUpload(referenceType);

  // 에디터 노드 기준으로 관리되는 uuid 집합.
  // onUpdate에서 사라진 노드의 이미지를 스토어에서 제거하는 데 사용.
  const prevImageIdsRef = useRef<Set<string>>(new Set());

  const editor = useEditor({
    extensions: [StarterKit, ImageUploadNode],
    editorProps: {
      attributes: {
        class:
          "prose lg:prose-lg max-w-none focus:outline-none min-h-[200px]",
      },
    },
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());

      const currentIds = new Set<string>();
      e.state.doc.descendants((node) => {
        if (
          node.type.name === "imageUploadNode" &&
          typeof node.attrs.uuid === "string"
        ) {
          currentIds.add(node.attrs.uuid);
        }
      });

      // 이전 노드 집합에 있었지만 현재 없는 uuid → 사용자가 삭제한 이미지
      prevImageIdsRef.current.forEach((id) => {
        if (!currentIds.has(id)) {
          removeImage(id);
        }
      });

      prevImageIdsRef.current = currentIds;
    },
  });

  const handleImageSelect = useCallback(
    async (file: File) => {
      if (!editor) return;

      const tempId = crypto.randomUUID();
      const { previewUrl, commit } = prepareSingleUpload(file);

      // 업로드 완료 전 미리보기를 즉시 삽입
      editor
        .chain()
        .focus()
        .insertContent({
          type: "imageUploadNode",
          attrs: { uuid: tempId, src: previewUrl, uploading: true },
        })
        .run();

      try {
        const { tmpObjectKey } = await commit();

        // 동시 업로드 시 tr 충돌 방지: 단일 tr을 누적해 한 번에 dispatch
        let tr = editor.state.tr;
        let found = false;

        editor.state.doc.descendants((node, pos) => {
          if (
            node.type.name === "imageUploadNode" &&
            node.attrs.uuid === tempId
          ) {
            tr = tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              uuid: tmpObjectKey,
              uploading: false,
            });
            found = true;
          }
        });

        if (found) {
          editor.view.dispatch(tr);
        }
      } catch (error) {
        // dispatch 전에 미리 제거해 onUpdate의 removeImage 역호출을 차단
        prevImageIdsRef.current.delete(tempId);

        let tr = editor.state.tr;
        let found = false;

        editor.state.doc.descendants((node, pos) => {
          if (
            node.type.name === "imageUploadNode" &&
            node.attrs.uuid === tempId
          ) {
            tr = tr.delete(pos, pos + node.nodeSize);
            found = true;
          }
        });

        if (found) {
          editor.view.dispatch(tr);
        }

        console.error("이미지 업로드 실패:", error);
      }
    },
    [editor, prepareSingleUpload],
  );

  return { editor, handleImageSelect };
};
