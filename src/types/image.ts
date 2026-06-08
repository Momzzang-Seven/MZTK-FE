export type ImageReferenceType =
  | "COMMUNITY_FREE"
  | "COMMUNITY_QUESTION"
  | "COMMUNITY_ANSWER"
  | "MARKET_CLASS"
  | "MARKET_STORE"
  | "WORKOUT";

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

export interface GetImagesByIdsRequest {
  ids: number[];
  referenceType: ImageReferenceType;
  referenceId: number;
}

export type ImageMetadataStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "NOT_FOUND";

export interface ImageMetadata {
  imageId: number;
  userId: number;
  referenceType: ImageReferenceType;
  referenceId: number;
  status: ImageMetadataStatus;
  imageUrl: string | null;
  imgOrder: number;
  createdAt: string;
  updatedAt: string;
}
