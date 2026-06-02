import { api } from "./client";

export type UserRole = "USER" | "TRAINER";
export type AuthProvider = "LOCAL" | "KAKAO" | "GOOGLE";

export interface MyProfileResponse {
  nickname: string;
  email: string;
  provider: AuthProvider | null;
  role: UserRole;
  walletAddress: string | null;
  level: number;
  currentXp: number;
  requiredXpForNextLevel: number;
  hasAttendedToday: boolean;
  hasCompletedWorkoutToday: boolean;
  completedWorkoutMethod: string | null;
  weeklyAttendanceCount: number;
}

export interface UpdateRoleResponse {
  id: number;
  email: string;
  name: string;
  nickname: string;
  profileImageUrl: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export const updateMyRole = async (
  role: UserRole
): Promise<UpdateRoleResponse> => {
  const response = await api.patch("/users/me/role", { role });
  return response.data.data;
};

export const getMyProfile = async (): Promise<MyProfileResponse> => {
  const response = await api.get("/users/me");
  return response.data.data;
};
