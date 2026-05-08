import { useAuthModalStore, useUserStore } from "@store";
import { isSanctionedAccountError } from "@utils";
import axios, { type AxiosInstance } from "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    _retry?: boolean;
    _skipNotFoundRedirect?: boolean;
  }
}

const BASE_ENV = import.meta.env.VITE_API_BASE_URL;
let BASE = BASE_ENV && BASE_ENV !== "undefined" ? (BASE_ENV as string) : "";

// if (import.meta.env.DEV && BASE && BASE.includes("localhost:8080")) {
//   console.warn("Detected localhost:8080 in VITE_API_BASE_URL during DEV. Forcing proxy usage.");
//   BASE = "";
// }

if (import.meta.env.DEV) {
  BASE = "";
}

console.log("Current API BASE URL:", BASE); // Debugging

type RetriableRequestConfig = {
  _retry?: boolean;
  _skipNotFoundRedirect?: boolean;
  url?: string;
  headers: Record<string, string>;
};

const isAuthRequest = (url?: string) =>
  Boolean(
    url === "/login" ||
    url === "/reissue" ||
    url?.includes("/auth/login") ||
    url?.includes("/auth/reissue")
  );

const isMockAccessToken = (token?: string | null) =>
  typeof token === "string" && /^mock[-_]/.test(token);

const showUnauthorizedModal = () => {
  const authModalState = useAuthModalStore.getState();
  authModalState.setSanctioned(false);
  authModalState.setUnauthorized(true);
  useUserStore.getState().clearUser();
};

const showSanctionedModal = () => {
  const authModalState = useAuthModalStore.getState();
  authModalState.setUnauthorized(false);
  authModalState.setSanctioned(true);
  useUserStore.getState().clearUser();
};

const attachInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error.response?.status;
      const originalRequest = error.config as
        | RetriableRequestConfig
        | undefined;
      const allowBareForbidden = isAuthRequest(originalRequest?.url);
      const activeToken = useUserStore.getState().accessToken;

      if (isSanctionedAccountError(error, { allowBareForbidden })) {
        showSanctionedModal();
        return Promise.reject(error);
      }

      if (status === 401 && isMockAccessToken(activeToken)) {
        console.warn("Skipping token reissue for mock auth session.");
        return Promise.reject(error);
      }

      // 401 Unauthorized
      if (status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        // Do not retry if the request was already a login or reissue attempt
        if (isAuthRequest(originalRequest.url)) {
          showUnauthorizedModal();
          return Promise.reject(error);
        }

        // Attempt to reissue token
        return axios
          .post(`${BASE}/auth/reissue`, {}, { withCredentials: true })
          .then((res) => {
            const data = res.data.data;
            useUserStore.getState().setAccessToken(data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return instance(originalRequest);
          })
          .catch((err) => {
            if (isSanctionedAccountError(err, { allowBareForbidden: true })) {
              showSanctionedModal();
            } else {
              showUnauthorizedModal();
            }
            return Promise.reject(err);
          });
      }

      // 404
      if (status === 404 && !originalRequest?._skipNotFoundRedirect) {
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
