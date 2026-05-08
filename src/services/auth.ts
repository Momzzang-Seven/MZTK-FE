import { authApi } from "./client";

// DTO Interfaces based on Backend
export interface LoginRequest {
  provider: "KAKAO" | "GOOGLE" | "LOCAL";
  email?: string;
  password?: string;
  authorizationCode?: string;
  redirectUri?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export type ReactivateRequest = LoginRequest;

export interface StepUpRequest {
  password?: string;
  authorizationCode?: string;
  redirectUri?: string;
}

export interface UserInfo {
  userId: number;
  email: string;
  nickname: string;
  profileImage: string;
  role: string;
  walletAddress: string;
}

export interface LoginResponse {
  accessToken: string;
  grantType: string;
  expiresIn: number;
  isNewUser: boolean;
  userInfo: UserInfo;
}

export interface SignupResponse {
  userId: number;
}

export interface ReissueTokenResponse {
  accessToken: string;
  grantType: string;
  expiresIn: number;
}

// POST: Login
export const PostLogin = async (
  request: LoginRequest
): Promise<LoginResponse> => {
  const { data } = await authApi.post("/login", request);
  return data.data; // ApiResponse.success(response) 구조 대응
};

// POST: Signup
export const PostSignup = async (
  request: SignupRequest
): Promise<SignupResponse> => {
  const { data } = await authApi.post("/signup", request);
  return data.data;
};

// POST: Reissue Token
export const PostReissueToken = async (): Promise<ReissueTokenResponse> => {
  const { data } = await authApi.post("/reissue");
  return data.data;
};

// POST: Logout
export const PostLogout = async () => {
  await authApi.post("/logout");
};

// POST: Reactivate
export const PostReactivate = async (
  request: ReactivateRequest
): Promise<LoginResponse> => {
  const { data } = await authApi.post("/reactivate", request);
  return data.data;
};

// POST: StepUp
export const PostStepUp = async (
  request: StepUpRequest
): Promise<{ accessToken: string }> => {
  const { data } = await authApi.post("/stepup", request);
  return data.data;
};

// GET: Check Login Status (Get Me)
export const GetLoginStatus = async (): Promise<ReissueTokenResponse> => {
  const { data } = await authApi.post("/reissue");
  return data.data;
};

// POST: Issue Challenge for Wallet Login
export const PostIssueChallenge = async (
  walletAddress: string
): Promise<string> => {
  const { data: responseData } = await authApi.post("/challenge", {
    walletAddress,
  });
  return responseData.data;
};

// POST: Verify Challenge for Wallet Login
export const PostVerifyChallenge = async (
  walletAddress: string,
  signature: string
): Promise<LoginResponse> => {
  const { data: responseData } = await authApi.post("/verify", {
    walletAddress,
    signature,
  });
  return responseData.data;
};
