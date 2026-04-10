import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect, useRef } from "react";
import { useCreatePostStore } from "@store/createPostStore";
import { getPresignedUrl, uploadImageToS3 } from "@services/community";
import ImageUploadNode from "@components/community/tiptapEditor/ImageUploadNode";

export const useTiptapEditor = (onChange: (html: string) => void) => {
  const addImage = useCreatePostStore((s) => s.addImage);
  const removeImage = useCreatePostStore((s) => s.removeImage);
  const incrementUploading = useCreatePostStore((s) => s.incrementUploading);
  const decrementUploading = useCreatePostStore((s) => s.decrementUploading);

  // [Fix 1] prevImageIdsRef를 에디터 노드 기준으로만 관리
  // images 스토어와 동기화하지 않음 → tempId 누락 방지
  const prevImageIdsRef = useRef<Set<string>>(new Set());

  // tempId → blob URL 매핑: 업로드 완료/실패 시 revoke를 위해 추적
  const previewUrlsRef = useRef<Map<string, string>>(new Map());

  // [Fix 2] addImage 직후 onUpdate에서 removeImage가 역호출되는 것을 방지하기 위해
  // 업로드 완료 후 스토어에 등록될 imageId를 미리 등록해두는 allowlist
  const pendingImageIdsRef = useRef<Set<string>>(new Set());

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

      // [Fix 2] prevImageIdsRef에 있었지만 현재 없는 uuid 중
      // pendingImageIds에 등록된 것은 삭제로 처리하지 않음
      prevImageIdsRef.current.forEach((id) => {
        if (!currentIds.has(id) && !pendingImageIdsRef.current.has(id)) {
          removeImage(id);
        }
      });

      // pendingImageIds에서 현재 에디터에 존재하는 id는 처리 완료로 제거
      pendingImageIdsRef.current.forEach((id) => {
        if (currentIds.has(id)) {
          pendingImageIdsRef.current.delete(id);
        }
      });

      prevImageIdsRef.current = currentIds;
    },
  });

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

        // [Fix 2] setNodeMarkup이 onUpdate를 트리거하기 전에 allowlist에 등록
        pendingImageIdsRef.current.add(imageId);

        // [Fix 4] 동시 업로드 시 tr 충돌 방지:
        // descendants 순회 중 매번 editor.state.tr을 새로 참조하지 않고
        // 단일 tr을 누적하여 한 번에 dispatch
        let tr = editor.state.tr;
        let found = false;

        editor.state.doc.descendants((node, pos) => {
          if (
            node.type.name === "imageUploadNode" &&
            node.attrs.uuid === tempId
          ) {
            tr = tr.setNodeMarkup(pos, undefined, {
              ...node.attrs,
              uuid: imageId,
              uploading: false,
            });
            found = true;
          }
        });

        if (found) {
          editor.view.dispatch(tr);
        }

        URL.revokeObjectURL(previewUrl);
        previewUrlsRef.current.delete(tempId);
        addImage({ id: imageId, previewUrl });
      } catch (error) {
        // [Fix 3] 업로드 실패 시 tempId를 prevImageIdsRef에서도 제거하여
        // 스토어 상태 비일관 방지 (onUpdate의 removeImage 역호출 차단)
        prevImageIdsRef.current.delete(tempId);

        // [Fix 4] 실패한 노드 삭제도 단일 tr으로 처리
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