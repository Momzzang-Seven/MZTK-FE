import { useAuthModalStore, useUserStore, useAdminErrorStore } from "@store";
import { isSanctionedAccountError } from "@utils";
import { getKoreanErrorMessage } from "@constant";
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

const isAdminRequest = (url?: string) => url?.startsWith("/admin");

const isMockAccessToken = (token?: string | null) =>
  typeof token === "string" && /^mock[-_]/.test(token);

// 동시에 여러 401이 발생해도 reissue 요청은 단 한 번만 전송
let pendingReissue: Promise<string> | null = null;

const showUnauthorizedModal = () => {
  const isAdmin = window.location.pathname.startsWith("/admin");
  // Do not redirect if we are already on the admin login page and it's a login attempt
  // This is handled by the caller or skip conditions in the interceptor
  useUserStore.getState().clearUser();

  if (isAdmin) {
    // Only redirect to /admin if we are NOT already on the admin login page
    if (window.location.pathname !== "/admin") {
      window.location.href = "/admin";
    }
    return;
  }

  const authModalState = useAuthModalStore.getState();
  authModalState.setSanctioned(false);
  authModalState.setUnauthorized(true);
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

        // For admin requests, redirect immediately on 401 instead of attempting reissue
        if (isAdminRequest(originalRequest.url)) {
          showUnauthorizedModal();
          return Promise.reject(error);
        }

        // 동시 401 발생 시 reissue를 한 번만 호출하고 나머지는 대기
        if (!pendingReissue) {
          pendingReissue = axios
            .post(`${BASE}/auth/reissue`, {}, { withCredentials: true })
            .then((res) => res.data.data.accessToken as string)
            .finally(() => {
              pendingReissue = null;
            });
        }

        return pendingReissue
          .then((newToken) => {
            useUserStore.getState().setAccessToken(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
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

      // 404 — 페이지 이동 없이 항상 스낵바로 표시
      if (status === 404 && !isAdminRequest(originalRequest?.url)) {
        const code: string | undefined = error.response?.data?.code;
        const serverMessage: string | undefined = error.response?.data?.message;
        useUserStore
          .getState()
          .showSnackbar(getKoreanErrorMessage(code, serverMessage), {
            variant: "error",
          });
        return Promise.reject(error);
      }

      // 그 외 4xx / 5xx — 스낵바 혹은 관리자 전용 에러 모달
      if (status && status !== 401) {
        // 인증 요청은 호출부에서 직접 에러 처리를 수행하므로 전역 UI 처리를 건너뜀
        if (isAuthRequest(originalRequest?.url)) {
          return Promise.reject(error);
        }

        const code: string | undefined = error.response?.data?.code;
        const serverMessage: string | undefined = error.response?.data?.message;
        const detail = error.response?.data;

        if (isAdminRequest(originalRequest?.url)) {
          useAdminErrorStore.getState().openErrorModal({
            status,
            code,
            message: getKoreanErrorMessage(code, serverMessage),
            detail,
            url: originalRequest?.url,
            method: error.config?.method?.toUpperCase(),
          });
        } else {
          useUserStore
            .getState()
            .showSnackbar(getKoreanErrorMessage(code, serverMessage), {
              variant: "error",
            });
        }
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
