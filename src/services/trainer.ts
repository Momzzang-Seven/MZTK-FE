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

export type MarketplaceClassCategory =
  | "PT"
  | "PILATES"
  | "YOGA"
  | "CROSSFIT"
  | "BOXING"
  | "DANCE"
  | "REHABILITATION"
  | "OTHER";

export type MarketplaceDayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface MarketplaceClassTimePayload {
  daysOfWeek: MarketplaceDayOfWeek[];
  startTime: string;
  capacity: number;
}

export interface RegisterTrainerClassPayload {
  title: string;
  category: MarketplaceClassCategory;
  description: string;
  priceAmount: number;
  durationMinutes: number;
  tags?: string[];
  features?: string[];
  personalItems?: string | null;
  imageIds?: number[];
  classTimes: MarketplaceClassTimePayload[];
}

export interface RegisterTrainerClassResponse {
  classId: number;
}

export interface TrainerClassItem {
  classId: number;
  title: string;
  category: string;
  priceAmount: number;
  tags: string[];
  active: boolean;
  thumbnailFinalObjectKey: string | null;
}

export interface GetTrainerClassesResponse {
  isSuspended: boolean;
  suspendedUntil: string | null;
  items: TrainerClassItem[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
}

export interface ToggleTrainerClassStatusResponse {
  classId: number;
  active: boolean;
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
    headers: {
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
    },
  });
  return response.data.data;
};

export const upsertTrainerStore = async (
  payload: TrainerStorePayload
): Promise<UpsertTrainerStoreResponse> => {
  const response = await api.put("/marketplace/trainer/store", payload);
  return response.data.data;
};

export const registerTrainerClass = async (
  payload: RegisterTrainerClassPayload
): Promise<RegisterTrainerClassResponse> => {
  const response = await api.post("/marketplace/trainer/classes", payload);
  return response.data.data;
};

export const getTrainerClasses = async (
  page = 0
): Promise<GetTrainerClassesResponse> => {
  const response = await api.get("/marketplace/trainer/classes", {
    params: { page },
  });
  return response.data.data;
};

export const toggleTrainerClassStatus = async (
  classId: number
): Promise<ToggleTrainerClassStatusResponse> => {
  const response = await api.patch(`/marketplace/trainer/classes/${classId}/status`);
  return response.data.data;
};
