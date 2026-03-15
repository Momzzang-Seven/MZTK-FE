/**
 * 위치 항목 DTO
 */
export interface LocationItem {
  locationId: number;
  locationName: string;
  postalCode?: string;
  address?: string;
  detailAddress?: string;
  latitude?: number;
  longitude?: number;
  registeredAt: string;
}

/**
 * 내 위치 목록 조회 응답 DTO
 */
export interface GetMyLocationsResponse {
  locations: LocationItem[];
  totalCount: number;
}

/**
 * 위치 등록 요청 DTO
 */
export interface RegisterLocationRequest {
  locationName: string;
  postalCode?: string;
  address?: string;
  detailAddress?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * 위치 등록 응답 DTO
 */
export interface RegisterLocationResponse extends LocationItem {
  userId: number;
}

/**
 * 위치 인증 요청 DTO
 */
export interface VerifyLocationRequest {
  locationId: number;
  currentLatitude: number;
  currentLongitude: number;
}

/**
 * 위치 인증 응답 DTO
 */
export interface VerifyLocationResponse {
  verificationId: number;
  locationId: number;
  locationName: string;
  userId: number;
  isVerified: boolean;
  distance: number;
  registeredLatitude: number;
  registeredLongitude: number;
  currentLatitude: number;
  currentLongitude: number;
  verifiedAt: string;
  xpGranted: boolean;
  grantedXp: number;
  xpGrantMessage: string;
}

/**
 * 위치 삭제 응답 DTO
 */
export interface DeleteLocationResponse {
  locationId: number;
  locationName: string;
  deletedAt: string;
}
