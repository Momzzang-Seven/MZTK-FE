import axios from "axios";
import type { PresignedUrlRequest, PresignedUrlResponse } from "@types";
import { api } from "./client";

export type IssuePresignedUrlsRequest = PresignedUrlRequest;

export interface IssuePresignedUrlsResponse {
  items: PresignedUrlResponse[];
}

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

  /**
   * S3 업로드 완료 후 백엔드에 PENDING → COMPLETED 전환 요청
   */
  async confirmImageUpload(imageId: number): Promise<void> {
    await api.patch(`/images/${imageId}/confirm`, undefined, {
      _skipNotFoundRedirect: true,
    });
  },

  async uploadFileToPresignedUrl(url: string, file: File): Promise<void> {
    await imageService.uploadImageToS3(url, file);
  },
};
