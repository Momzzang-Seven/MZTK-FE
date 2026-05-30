import { api } from "./client";

export interface GetMarketClassesParams {
  lat?: number;
  lng?: number;
  category?: string;
  sort?: string;
  trainerId?: number;
  startTime?: string;
  endTime?: string;
  keyword?: string;
  page?: number;
}

export interface MarketClassItem {
  classId: number;
  title: string;
  category: string;
  priceAmount: number;
  durationMinutes: number;
  thumbnailFinalObjectKey: string | null;
  tags: string[];
  distance: number | null;
}

export interface GetMarketClassesResponse {
  items: MarketClassItem[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

export const getMarketClasses = async (
  params: GetMarketClassesParams
): Promise<GetMarketClassesResponse> => {
  const response = await api.get("/marketplace/classes", { params });
  return response.data.data || response.data;
};
