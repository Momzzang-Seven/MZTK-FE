import { api } from "./client";

export type UserRole = "USER" | "TRAINER";

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
