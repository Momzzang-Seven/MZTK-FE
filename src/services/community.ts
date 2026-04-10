// import { api } from "./client";

export interface PostPayload {
  title?: string;
  content: string;
  images: string[];
  reward?: number;
  tags?: string[];
}

interface PresignedUrlResponse {
  tmpObjectKey: string;
  presignedUrl: string;
}

/**
 * Presigned URL 요청 (Mock)
 */
export const getPresignedUrl = async (
  filename: string,
): Promise<PresignedUrlResponse> => {
  // 실제 API 연동 시 아래 mock 제거
  const tmpObjectKey = crypto.randomUUID();
  const presignedUrl = `https://mztk-bucket.s3.ap-northeast-2.amazonaws.com/posts/${tmpObjectKey}/${filename}`;

  return Promise.resolve({
    tmpObjectKey,
    presignedUrl
  });
};

/**
 * S3 Presigned URL로 이미지 직접 업로드
 */
export const uploadImageToS3 = async (
  url: string,
  file: File,
): Promise<void> => {
  console.log(url, file);
  return Promise.resolve();
};

/**
 * 게시물 등록
 */
export const createPost = async (payload: PostPayload): Promise<void> => {
  console.log(payload)
};

/**
 * 답변 등록
 */
export const createAnswer = async (
  postId: number,
  payload: PostPayload,
): Promise<void> => {
  console.log(postId, payload)
};
