export type ImageReferenceType = "COMMUNITY_FREE" | "COMMUNITY_QUESTION" | "COMMUNITY_ANSWER";

export interface UploadedImage {
  imageId: number;
  imageUrl: string;
}

export interface PresignedUrlRequest {
  referenceType: ImageReferenceType;
  images: string[];
}

export interface PresignedUrlResponse {
  imageId: number;
  tmpObjectKey: string;
  presignedUrl: string;
}