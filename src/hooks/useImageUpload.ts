import { useCallback, useEffect, useRef, useState } from "react";
import { imageService } from "@services";
import { useCreatePostStore } from "@store";
import type { ImageReferenceType } from "@types";

export const useImageUpload = (referenceType: ImageReferenceType) => {
  const addImage = useCreatePostStore((s) => s.addImage);
  const removeImage = useCreatePostStore((s) => s.removeImage);
  const incrementUploading = useCreatePostStore((s) => s.incrementUploading);
  const decrementUploading = useCreatePostStore((s) => s.decrementUploading);

  const [isUploading, setIsUploading] = useState(false);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = blobUrlsRef.current;
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  /**
   * 여러 파일을 한 번에 업로드 (FreePostImageUploader용)
   *
   * presigned URL 발급 → S3 업로드 → 스토어 등록까지 일괄 처리.
   * 업로드 중에는 uploadingCount를 증가시켜 제출 버튼을 비활성화한다.
   */
  const uploadImages = useCallback(
    async (files: File[]): Promise<void> => {
      if (!files.length) return;

      setIsUploading(true);
      try {
        const filenames = files.map((f) => f.name);
        const presignedResults = await imageService.getPresignedUrl({
          referenceType,
          images: filenames,
        });

        await Promise.all(
          files.map(async (file, i) => {
            incrementUploading();
            try {
              const previewUrl = URL.createObjectURL(file);
              blobUrlsRef.current.add(previewUrl);

              const { tmpObjectKey, presignedUrl } = presignedResults[i];
              await imageService.uploadImageToS3(presignedUrl, file);

              addImage({ id: tmpObjectKey, previewUrl });
            } finally {
              decrementUploading();
            }
          }),
        );
      } finally {
        setIsUploading(false);
      }
    },
    [referenceType, addImage, incrementUploading, decrementUploading],
  );

  /**
   * 단일 파일 업로드 준비 (에디터 인라인 이미지용)
   *
   * blob URL을 동기적으로 생성해 에디터에 즉시 미리보기를 삽입할 수 있도록 하고,
   * 실제 S3 업로드는 반환된 commit 함수를 통해 비동기로 수행한다.
   * commit은 uploadingCount 관리·스토어 등록·blob URL 정리까지 담당한다.
   */
  const prepareSingleUpload = useCallback(
    (file: File) => {
      const previewUrl = URL.createObjectURL(file);
      blobUrlsRef.current.add(previewUrl);

      const commit = async (): Promise<{ tmpObjectKey: string }> => {
        incrementUploading();
        try {
          const [{ tmpObjectKey, presignedUrl }] = await imageService.getPresignedUrl({
            referenceType,
            images: [file.name],
          });
          await imageService.uploadImageToS3(presignedUrl, file);

          URL.revokeObjectURL(previewUrl);
          blobUrlsRef.current.delete(previewUrl);
          addImage({ id: tmpObjectKey, previewUrl });

          return { tmpObjectKey };
        } catch (err) {
          URL.revokeObjectURL(previewUrl);
          blobUrlsRef.current.delete(previewUrl);
          throw err;
        } finally {
          decrementUploading();
        }
      };

      return { previewUrl, commit };
    },
    [referenceType, addImage, incrementUploading, decrementUploading],
  );

  return {
    uploadImages,
    prepareSingleUpload,
    removeImage,
    isUploading,
  };
};
