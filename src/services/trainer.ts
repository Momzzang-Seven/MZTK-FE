import { api } from "./client";

export interface TrainerStorePayload {
  storeName: string;
  address: string;
  detailAddress: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  homepageUrl?: string | null;
  instagramUrl?: string | null;
  xProfileUrl?: string | null;
}

export interface TrainerStoreResponse {
  storeId: number;
  storeName: string;
  address: string;
  detailAddress: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  homepageUrl: string | null;
  instagramUrl: string | null;
  xProfileUrl: string | null;
}

export interface UpsertTrainerStoreResponse {
  storeId: number;
}

/**
 * 트레이너 이의 요청
 */
export const postTrainerAppeal = async (content: string) => {
  const { data } = await api.post("/trainer/appeal", { content });
  return data;
};

/**
 * 트레이너 상태 조회
 */
export const getTrainerStatus = async () => {
  const { data } = await api.get("/trainer/status");
  return data;
};

export const getTrainerStore = async (): Promise<TrainerStoreResponse> => {
  const response = await api.get("/marketplace/trainer/store", {
    _skipNotFoundRedirect: true,
  });
  return response.data.data;
};

export const upsertTrainerStore = async (
  payload: TrainerStorePayload
): Promise<UpsertTrainerStoreResponse> => {
  const response = await api.put("/marketplace/trainer/store", payload);
  return response.data.data;
};
