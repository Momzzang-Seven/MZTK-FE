import { useCallback } from "react";
import { useUserStore } from "@store";
import type { 
  LoginRequest,
  SignupRequest,
  ReactivateRequest
} from "@services/auth";
import { 
  PostLogin, 
  PostSignup, 
  PostLogout, 
  PostReactivate, 
  PostReissueToken,
} from "@services/auth";

export const useAuth = () => {
  const { setUser, setAccessToken, clearUser, isAuthenticated } = useUserStore();

  const login = useCallback(async (request: LoginRequest) => {
    try {
      const data = await PostLogin(request);
      setAccessToken(data.accessToken);
      setUser(data.userInfo);
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, [setAccessToken, setUser]);

  const signup = useCallback(async (request: SignupRequest) => {
    try {
      const data = await PostSignup(request);
      return data;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await PostLogout();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      clearUser();
    }
  }, [clearUser]);

  const reactivate = useCallback(async (request: ReactivateRequest) => {
    try {
      const data = await PostReactivate(request);
      setAccessToken(data.accessToken);
      setUser(data.userInfo);
      return data;
    } catch (error) {
      console.error("Reactivation failed:", error);
      throw error;
    }
  }, [setAccessToken, setUser]);

  const refresh = useCallback(async () => {
    try {
      const data = await PostReissueToken();
      setAccessToken(data.accessToken);
      return data;
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearUser();
      throw error;
    }
  }, [setAccessToken, clearUser]);

  return {
    isAuthenticated,
    login,
    signup,
    logout,
    reactivate,
    refresh
  };
};
