import axios from "axios";
import type { PresignedUrlRequest, PresignedUrlResponse } from "@types";
import { api } from "./client";

export type IssuePresignedUrlsRequest = PresignedUrlRequest;

export interface IssuePresignedUrlsResponse {
  items: PresignedUrlResponse[];
}

export type ImageUploadStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "NOT_FOUND";

interface ImageStatusItem {
  imageId: number;
  status: ImageUploadStatus;
}

interface ImageStatusResponse {
  images: ImageStatusItem[];
}

const IMAGE_STATUS_CHUNK_SIZE = 10;
const IMAGE_STATUS_MAX_ATTEMPTS = 10;
const IMAGE_STATUS_POLL_INTERVAL_MS = 1_000;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const chunkImageIds = (imageIds: number[]) => {
  const chunks: number[][] = [];

  for (
    let index = 0;
    index < imageIds.length;
    index += IMAGE_STATUS_CHUNK_SIZE
  ) {
    chunks.push(imageIds.slice(index, index + IMAGE_STATUS_CHUNK_SIZE));
  }

  return chunks;
};

export const imageService = {
  async getPresignedUrl(
    request: PresignedUrlRequest
  ): Promise<PresignedUrlResponse[]> {
    const response = await api.post("/images/presigned-urls", request, {
      _skipNotFoundRedirect: true,
    });
    return response.data.data.items as PresignedUrlResponse[];
  },

  async issuePresignedUrls(
    request: IssuePresignedUrlsRequest
  ): Promise<IssuePresignedUrlsResponse> {
    const response = await api.post("/images/presigned-urls", request, {
      _skipNotFoundRedirect: true,
    });
    return response.data.data;
  },

  async uploadImageToS3(url: string, file: File): Promise<void> {
    await axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
  },

  async confirmImageUpload(imageIds: number[]): Promise<void> {
    if (imageIds.length === 0) return;

    if (
      imageIds.some((imageId) => !Number.isInteger(imageId) || imageId <= 0)
    ) {
      throw new Error("이미지 정보가 올바르지 않습니다.");
    }

    for (let attempt = 1; attempt <= IMAGE_STATUS_MAX_ATTEMPTS; attempt += 1) {
      const statuses = await imageService.getImageStatuses(imageIds);
      const failedStatus = statuses.find(
        ({ status }) => status === "FAILED" || status === "NOT_FOUND"
      );

      if (failedStatus) {
        throw new Error("이미지 업로드 상태를 확인할 수 없습니다.");
      }

      if (statuses.every(({ status }) => status === "COMPLETED")) {
        return;
      }

      if (attempt < IMAGE_STATUS_MAX_ATTEMPTS) {
        await wait(IMAGE_STATUS_POLL_INTERVAL_MS);
      }
    }

    throw new Error("이미지 처리 중입니다. 잠시 후 다시 시도해주세요.");
  },

  async getImageStatuses(imageIds: number[]): Promise<ImageStatusItem[]> {
    const responses = await Promise.all(
      chunkImageIds(imageIds).map((chunk) => {
        const params = new URLSearchParams();
        chunk.forEach((imageId) => {
          params.append("ids", String(imageId));
        });

        return api.get(`/images/status?${params.toString()}`, {
          _skipNotFoundRedirect: true,
        });
      })
    );

    return responses.flatMap(
      (response) => (response.data.data as ImageStatusResponse).images
    );
  },

  async uploadFileToPresignedUrl(url: string, file: File): Promise<void> {
    await imageService.uploadImageToS3(url, file);
  },

  async uploadMarketplaceClassImages(files: File[]): Promise<number[]> {
    if (files.length === 0) return [];

    const presignedResponse = await imageService.issuePresignedUrls({
      referenceType: "MARKET_CLASS",
      images: files.map((file) => file.name),
    });
    const uploadTargets = presignedResponse.items ?? [];

    if (uploadTargets.length !== files.length) {
      throw new Error("클래스 이미지 업로드 URL을 발급받지 못했습니다.");
    }

    await Promise.all(
      uploadTargets.map((target, index) => {
        const file = files[index];
        if (!file) {
          throw new Error("클래스 이미지 파일 정보를 찾지 못했습니다.");
        }
        return imageService.uploadFileToPresignedUrl(target.presignedUrl, file);
      })
    );

    const imageIds = uploadTargets.map((target) => target.imageId);
    await imageService.confirmImageUpload(imageIds);
    return imageIds;
  },
};
