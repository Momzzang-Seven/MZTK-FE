import { api } from "./client";
import axios from "axios";
import type { PresignedUrlRequest, PresignedUrlResponse } from "@types";

export const imageService = {
    /**
     * Presigned URL 요청
     */
    async getPresignedUrl(request: PresignedUrlRequest): Promise<PresignedUrlResponse[]> {
        const response = await api.post("/images/presigned-urls", request);
        return response.data.data.items as PresignedUrlResponse[];
    },

    /**
     * S3 Presigned URL로 이미지 직접 업로드
     */
    async uploadImageToS3(url: string, file: File): Promise<void> {
    await axios.put(url, file, {
      headers: {
        "Content-Type": file.type,
      },
    });
  },
}