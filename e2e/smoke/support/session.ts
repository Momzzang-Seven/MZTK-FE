import { expect, type Page, type Response } from "@playwright/test";

type SmokeRole = "member" | "trainer";

type SmokeCredentials = {
  email: string;
  password: string;
};

type LoginResponseData = {
  accessToken: string;
  userInfo: {
    userId: number;
    email: string;
    nickname: string;
    profileImage: string;
    role: string;
    walletAddress: string;
  };
};

const getRequiredEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required for prod smoke tests.`);
  }

  return value;
};

const getOptionalCredentials = (
  emailEnv: string,
  passwordEnv: string
): SmokeCredentials | null => {
  const email = process.env[emailEnv];
  const password = process.env[passwordEnv];

  if (!email || !password) {
    return null;
  }

  return { email, password };
};

const getCredentials = (role: SmokeRole): SmokeCredentials => {
  if (role === "trainer") {
    const trainerCredentials = getOptionalCredentials(
      "E2E_SMOKE_TRAINER_EMAIL",
      "E2E_SMOKE_TRAINER_PASSWORD"
    );

    if (!trainerCredentials) {
      throw new Error(
        "Trainer smoke credentials are missing. Set E2E_SMOKE_TRAINER_EMAIL and E2E_SMOKE_TRAINER_PASSWORD."
      );
    }

    return trainerCredentials;
  }

  return {
    email: getRequiredEnv("E2E_SMOKE_EMAIL"),
    password: getRequiredEnv("E2E_SMOKE_PASSWORD"),
  };
};

const buildPersistedUserStorage = (loginData: LoginResponseData) => ({
  state: {
    user: loginData.userInfo,
    isAuthenticated: true,
    accessToken: loginData.accessToken,
    level: 1,
    xp: 0,
    attendanceStreak: 0,
    lastAttendanceDate: null,
    lastExerciseDate: null,
    gymLocation: null,
    analysisStatus: "idle",
    analysisType: null,
    analysisTargetTime: null,
  },
  version: 0,
});

export const hasTrainerSmokeCredentials = () =>
  Boolean(
    process.env.E2E_SMOKE_TRAINER_EMAIL &&
      process.env.E2E_SMOKE_TRAINER_PASSWORD
  );

export const createAuthenticatedSession = async (
  page: Page,
  role: SmokeRole = "member"
) => {
  const apiBaseUrl = getRequiredEnv("E2E_SMOKE_API_BASE_URL");
  const credentials = getCredentials(role);

  const response = await page.request.post(`${apiBaseUrl}/auth/login`, {
    data: {
      provider: "LOCAL",
      email: credentials.email,
      password: credentials.password,
    },
  });

  expect(response.ok()).toBeTruthy();

  const payload = (await response.json()) as { data: LoginResponseData };
  const loginData = payload.data;

  await page.addInitScript(
    ({ storageValue, walletAddress, role }) => {
      window.localStorage.setItem("user-storage", storageValue);

      if (walletAddress) {
        window.localStorage.setItem("wallet_address", walletAddress);
      }

      if (role === "trainer") {
        window.localStorage.setItem("hasVisitedTrainerDashboard", "true");
        window.localStorage.setItem("trainerStoreRegistered", "true");
      }
    },
    {
      storageValue: JSON.stringify(buildPersistedUserStorage(loginData)),
      walletAddress: loginData.userInfo.walletAddress,
      role,
    }
  );

  return loginData;
};

export const waitForApiResponse = (
  page: Page,
  path: string,
  statusPredicate: (status: number) => boolean = (status) =>
    status >= 200 && status < 300
) =>
  page.waitForResponse(
    (response) => response.url().includes(path) && statusPredicate(response.status()),
    { timeout: 30000 }
  );

export const expectOk = async (responsePromise: Promise<Response>) => {
  const response = await responsePromise;
  expect(response.status()).toBeGreaterThanOrEqual(200);
  expect(response.status()).toBeLessThan(300);
  return response;
};
