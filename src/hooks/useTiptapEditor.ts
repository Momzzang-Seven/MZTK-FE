import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef } from "react";
import { useCreatePostStore } from "@store/createPostStore";
import { getPresignedUrl, uploadImageToS3 } from "@services/community";
import ImageUploadNode from "@components/community/tiptapEditor/ImageUploadNode";

export const useTiptapEditor = (onChange: (html: string) => void) => {
  const addImage = useCreatePostStore((s) => s.addImage);
  const removeImage = useCreatePostStore((s) => s.removeImage);
  const images = useCreatePostStore((s) => s.images);
  const incrementUploading = useCreatePostStore((s) => s.incrementUploading);
  const decrementUploading = useCreatePostStore((s) => s.decrementUploading);

  const prevImageIdsRef = useRef<Set<string>>(new Set());
  // tempId → blob URL 매핑: 업로드 완료/실패 시 revoke를 위해 추적
  const previewUrlsRef = useRef<Map<string, string>>(new Map());

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

      // 이전에 있었지만 지금 없는 uuid → 삭제된 이미지
      prevImageIdsRef.current.forEach((id) => {
        if (!currentIds.has(id)) removeImage(id);
      });

      prevImageIdsRef.current = currentIds;
    },
  });

  // images 배열 변경 시 prevImageIdsRef 동기화
  useEffect(() => {
    prevImageIdsRef.current = new Set(images.map((img) => img.id));
  }, [images]);

  // 언마운트 시 생성된 blob URL 전체 해제
  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const handleImageSelect = useCallback(
    async (file: File) => {
      if (!editor) return;

      const previewUrl = URL.createObjectURL(file);
      const tempId = crypto.randomUUID();
      previewUrlsRef.current.set(tempId, previewUrl);

      incrementUploading();

      editor
        .chain()
        .focus()
        .insertContent({
          type: "imageUploadNode",
          attrs: { uuid: tempId, src: previewUrl, uploading: true },
        })
        .run();

      try {
        const { tmpObjectKey: imageId, presignedUrl: uploadUrl } =
          await getPresignedUrl(file.name);
        await uploadImageToS3(uploadUrl, file);

        // 업로드 완료 → uuid를 S3 key로, uploading = false로 갱신
        editor.state.doc.descendants((node, pos) => {
          if (
            node.type.name === "imageUploadNode" &&
            node.attrs.uuid === tempId
          ) {
            editor.view.dispatch(
              editor.state.tr.setNodeMarkup(pos, undefined, {
                ...node.attrs,
                uuid: imageId,
                uploading: false,
              }),
            );
          }
        });

        URL.revokeObjectURL(previewUrl);
        previewUrlsRef.current.delete(tempId);
        addImage({ id: imageId, previewUrl });
      } catch (error) {
        editor.state.doc.descendants((node, pos) => {
          if (
            node.type.name === "imageUploadNode" &&
            node.attrs.uuid === tempId
          ) {
            editor.view.dispatch(
              editor.state.tr.delete(pos, pos + node.nodeSize),
            );
          }
        });
        URL.revokeObjectURL(previewUrl);
        previewUrlsRef.current.delete(tempId);
        console.error("이미지 업로드 실패:", error);
      } finally {
        decrementUploading();
      }
    },
    [editor, addImage, incrementUploading, decrementUploading],
  );

  return { editor, handleImageSelect };
};
