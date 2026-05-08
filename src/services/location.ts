import { api } from "./client";
import type {
  GetMyLocationsResponse,
  RegisterLocationRequest,
  RegisterLocationResponse,
  VerifyLocationRequest,
  VerifyLocationResponse,
  DeleteLocationResponse,
} from "../types/location";

/**
 * 위치(Location) 관련 API 서비스
 */
export const locationService = {
  /**
   * 내 위치 목록 조회
   */
  async getMyLocations(): Promise<GetMyLocationsResponse> {
    const response = await api.get("/users/me/locations");
    return response.data.data;
  },

  /**
   * 위치 등록
   */
  async registerLocation(
    request: RegisterLocationRequest
  ): Promise<RegisterLocationResponse> {
    const response = await api.post("/users/me/locations/register", request);
    return response.data.data;
  },

  /**
   * 위치 인증 (GPS 검증 및 XP 지급)
   */
  async verifyLocation(
    request: VerifyLocationRequest
  ): Promise<VerifyLocationResponse> {
    const response = await api.post("/locations/verify", request);
    return response.data.data;
  },

  /**
   * 위치 삭제
   */
  async deleteLocation(locationId: number): Promise<DeleteLocationResponse> {
    const response = await api.delete(`/users/me/locations/${locationId}`);
    return response.data.data;
  },
};
