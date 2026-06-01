import {
  expect,
  type APIRequestContext,
  type APIResponse,
} from "@playwright/test";

export type AuthRole = "USER" | "TRAINER";

export type AuthSession = {
  token: string;
  userId: number;
  email: string;
  nickname: string;
  password: string;
};

export type AdminSession = {
  token: string;
  loginId: string;
};

export const shouldRunLocalFullstack = () =>
  process.env.E2E_SMOKE_API_BASE_URL?.startsWith("http://localhost") ?? false;

export const hasAdminSmokeCredentials = () =>
  Boolean(
    process.env.E2E_SMOKE_ADMIN_LOGIN_ID && process.env.E2E_SMOKE_ADMIN_PASSWORD
  );

export const apiBaseUrl = () => {
  const value = process.env.E2E_SMOKE_API_BASE_URL;
  if (!value) throw new Error("E2E_SMOKE_API_BASE_URL is required");
  return value.replace(/\/$/, "");
};

export const suffix = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const readJson = async (response: APIResponse) => {
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
};

export const expectOk = async (name: string, response: APIResponse) => {
  const body = await readJson(response);
  expect(
    response.status(),
    `${name} failed with status ${response.status()}: ${JSON.stringify(body)}`
  ).toBeGreaterThanOrEqual(200);
  expect(
    response.status(),
    `${name} failed with status ${response.status()}: ${JSON.stringify(body)}`
  ).toBeLessThan(300);
  if (body?.status)
    expect(body.status, `${name} envelope status`).toBe("SUCCESS");
  return body;
};

export const expectNoServerError = async (
  name: string,
  response: APIResponse
) => {
  const body = await readJson(response);
  expect(
    response.status(),
    `${name} server error with body: ${JSON.stringify(body)}`
  ).toBeLessThan(500);
  return { status: response.status(), body };
};

export const signupAndLogin = async (
  request: APIRequestContext,
  role: AuthRole
): Promise<AuthSession> => {
  const id = suffix();
  const email = `local-api-${role.toLowerCase()}-${id}@mztk.local`;
  const nickname = `api${id.slice(-8)}`;
  const password = "LocalFullstack123!";

  await expectOk(
    `${role} signup`,
    await request.post(`${apiBaseUrl()}/auth/signup`, {
      data: {
        email,
        password,
        nickname,
        role,
      },
    })
  );

  const loginBody = await expectOk(
    `${role} login`,
    await request.post(`${apiBaseUrl()}/auth/login`, {
      data: {
        provider: "LOCAL",
        email,
        password,
      },
    })
  );

  return {
    token: loginBody.data.accessToken,
    userId: loginBody.data.userInfo.userId,
    email,
    nickname,
    password,
  };
};

export const loginAdmin = async (
  request: APIRequestContext
): Promise<AdminSession> => {
  const loginId = process.env.E2E_SMOKE_ADMIN_LOGIN_ID;
  const password = process.env.E2E_SMOKE_ADMIN_PASSWORD;

  if (!loginId || !password) {
    throw new Error(
      "E2E_SMOKE_ADMIN_LOGIN_ID and E2E_SMOKE_ADMIN_PASSWORD are required"
    );
  }

  const loginBody = await expectOk(
    "admin login",
    await request.post(`${apiBaseUrl()}/auth/login`, {
      data: {
        provider: "LOCAL_ADMIN",
        loginId,
        password,
      },
    })
  );

  return {
    token: loginBody.data.accessToken,
    loginId,
  };
};
