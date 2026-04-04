import { useAuthModalStore, useUserStore } from "@store";
import axios, { type AxiosInstance } from "axios";

const BASE_ENV = import.meta.env.VITE_API_BASE_URL;
let BASE = (BASE_ENV && BASE_ENV !== "undefined") ? (BASE_ENV as string) : "";

if (import.meta.env.DEV && BASE && BASE.includes("localhost:8080")) {
  console.warn("Detected localhost:8080 in VITE_API_BASE_URL during DEV. Forcing proxy usage.");
  BASE = "";
}

console.log("Current API BASE URL:", BASE); // Debugging
const authModalState = useAuthModalStore.getState();


const attachInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;

      // 401 Unauthorized
      const originalRequest = error.config as { _retry?: boolean; url?: string; headers: Record<string, string> };
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        // Do not retry if the request was already a login or reissue attempt
        if (originalRequest.url?.includes('/auth/reissue') || originalRequest.url?.includes('/auth/login')) {
          authModalState.setUnauthorized(true);
          useUserStore.getState().clearUser();
          return Promise.reject(error);
        }

        // Attempt to reissue token
        return axios.post(`${BASE}/auth/reissue`, {}, { withCredentials: true })
          .then((res) => {
             const data = res.data.data;
             useUserStore.getState().setAccessToken(data.accessToken);
             originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
             return instance(originalRequest);
          })
          .catch((err) => {
             authModalState.setUnauthorized(true);
             useUserStore.getState().clearUser();
             return Promise.reject(err);
          });
      }

      // 404
      if (status === 404) {
        window.location.href = "/404";
      }

      return Promise.reject(error);
    }
  );

  instance.interceptors.request.use((config) => {
    const token = useUserStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};

export const api = attachInterceptors(
  axios.create({
    baseURL: BASE,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  })
);


export const authApi = attachInterceptors(
  axios.create({
    baseURL: `${BASE}/auth`,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  })
);

export const walletApi = attachInterceptors(
  axios.create({
    baseURL: `${BASE}/api/auth/wallet`,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  })
);
