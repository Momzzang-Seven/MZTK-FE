import axios from "axios";
import type { PresignedUrlRequest, PresignedUrlResponse } from "@types";
import { api } from "./client";

export interface IssuePresignedUrlsRequest extends PresignedUrlRequest {}

export interface IssuePresignedUrlsResponse {
  items: PresignedUrlResponse[];
}

export const imageService = {
  async getPresignedUrl(
    request: PresignedUrlRequest,
  ): Promise<PresignedUrlResponse[]> {
    const response = await api.post("/images/presigned-urls", request);
    return response.data.data.items as PresignedUrlResponse[];
  },

  async issuePresignedUrls(
    request: IssuePresignedUrlsRequest,
  ): Promise<IssuePresignedUrlsResponse> {
    const response = await api.post("/images/presigned-urls", request);
    return response.data.data;
  },

  async uploadImageToS3(url: string, file: File): Promise<void> {
    await axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
  },

  async uploadFileToPresignedUrl(url: string, file: File): Promise<void> {
    await imageService.uploadImageToS3(url, file);
  },
};
