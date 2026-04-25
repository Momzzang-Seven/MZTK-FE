import { useCallback, useEffect, useRef, useState } from "react";
import { imageService } from "@services";
import type { ImageReferenceType, UploadedImage } from "@types";

interface UploadCallbacks {
  /** 파일 1개 업로드 성공 시 호출 */
  onUploaded?: (image: UploadedImage) => void;
  /** 파일 1개 업로드 시작 전 호출 (업로드 카운트 증가 등) */
  onUploadStart?: () => void;
  /** 파일 1개 업로드 완료 후 호출 — 성공·실패 모두 (업로드 카운트 감소 등) */
  onUploadEnd?: () => void;
}

export const useImageUpload = (
  referenceType: ImageReferenceType,
  callbacks: UploadCallbacks = {},
) => {
  const { onUploaded, onUploadStart, onUploadEnd } = callbacks;

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
   * 여러 파일을 한 번에 업로드
   *
   * presigned URL 발급 → S3 업로드 → onUploaded 콜백 호출을 파일별로 수행.
   * 파일별로 onUploadStart / onUploadEnd가 호출되므로 업로드 카운트를 정확히 추적할 수 있다.
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
            onUploadStart?.();
            try {
              const previewUrl = URL.createObjectURL(file);
              blobUrlsRef.current.add(previewUrl);

              const { imageId, presignedUrl } = presignedResults[i];
              await imageService.uploadImageToS3(presignedUrl, file);

              onUploaded?.({ imageId: imageId, imageUrl: previewUrl });
            } finally {
              onUploadEnd?.();
            }
          }),
        );
      } finally {
        setIsUploading(false);
      }
    },
    [referenceType, onUploaded, onUploadStart, onUploadEnd],
  );

  /**
   * 단일 파일 업로드 준비 (에디터 인라인 이미지용)
   *
   * blob URL을 동기적으로 생성해 에디터에 즉시 미리보기를 삽입할 수 있도록 하고,
   * 실제 S3 업로드는 반환된 commit 함수를 통해 비동기로 수행한다.
   * commit은 onUploadStart/End 호출·onUploaded 콜백·blob URL 정리까지 담당한다.
   */
  const prepareSingleUpload = useCallback(
    (file: File) => {
      const previewUrl = URL.createObjectURL(file);
      blobUrlsRef.current.add(previewUrl);

      const commit = async (): Promise<{ imageId: number }> => {
        onUploadStart?.();
        try {
          const [{ imageId, presignedUrl }] = await imageService.getPresignedUrl({
            referenceType,
            images: [file.name],
          });
          await imageService.uploadImageToS3(presignedUrl, file);

          URL.revokeObjectURL(previewUrl);
          blobUrlsRef.current.delete(previewUrl);
          onUploaded?.({ imageId: imageId, imageUrl: previewUrl });

          return { imageId };
        } catch (err) {
          URL.revokeObjectURL(previewUrl);
          blobUrlsRef.current.delete(previewUrl);
          throw err;
        } finally {
          onUploadEnd?.();
        }
      };

      return { previewUrl, commit };
    },
    [referenceType, onUploaded, onUploadStart, onUploadEnd],
  );

  return { uploadImages, prepareSingleUpload, isUploading };
};
