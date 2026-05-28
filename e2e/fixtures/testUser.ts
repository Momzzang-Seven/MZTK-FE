import { expect, type Page } from "@playwright/test";

export const TEST_USER = {
  userId: 101,
  email: "test@mztk.com",
  password: "Test1234!",
  nickname: "테스트유저",
  role: "USER",
  profileImage: "",
};

export const TEST_TRAINER = {
  userId: 202,
  email: "trainer@mztk.com",
  password: "Trainer1234!",
  nickname: "테스트트레이너",
  role: "TRAINER",
  profileImage: "",
};

export const MOCK_WALLET = {
  address: "0xMockWalletAddress123456789",
  encryptedJson: "mock-e2e-encrypted-wallet-json",
};

type TestUser = typeof TEST_USER;
type GymLocation = {
  locationId?: number;
  lat: number;
  lng: number;
  address: string;
} | null;

const DEFAULT_GYM_LOCATION = {
  locationId: 1,
  lat: 37.5665,
  lng: 126.978,
  address: "테스트 헬스장",
};

const buildPersistedUserStorage = (
  user: TestUser,
  gymLocation: GymLocation = DEFAULT_GYM_LOCATION
) => ({
  state: {
    user: {
      userId: user.userId,
      email: user.email,
      nickname: user.nickname,
      profileImage: user.profileImage,
      role: user.role,
      walletAddress: MOCK_WALLET.address,
    },
    isAuthenticated: true,
    accessToken: "mock-e2e-access-token",
    level: 1,
    xp: 0,
    attendanceStreak: 0,
    lastAttendanceDate: null,
    lastExerciseDate: null,
    lastWorkoutRewardAppliedDate: null,
    gymLocation,
    analysisStatus: "idle",
    analysisType: null,
    analysisTargetTime: null,
    analysisStartedAt: null,
  },
  version: 0,
});

const successResponse = (data: unknown) =>
  JSON.stringify({ status: "SUCCESS", data });

export async function mockCoreAppApis(page: Page) {
  await page.route("**/users/me/attendance/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: successResponse({ streakCount: 3, hasAttendedToday: false }),
    });
  });

  await page.route("**/users/me/attendance/weekly", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: successResponse({ attendedCount: 3, history: [] }),
    });
  });

  await page.route("**/users/me/level-up-histories**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: successResponse({ content: [], totalElements: 0, totalPages: 0 }),
    });
  });

  await page.route("**/users/me/xp-ledger**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: successResponse({ content: [], totalElements: 0, totalPages: 0 }),
    });
  });

  await page.route("**/users/me/level", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: successResponse({
        level: 5,
        availableXp: 50,
        requiredXpForNext: 100,
      }),
    });
  });

  await page.route("**/levels/policies", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: successResponse([{ level: 5, requiredXp: 100, rewardMztk: 50 }]),
    });
  });

  await page.route("**/users/me/locations", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: successResponse({
        locations: [
          {
            locationId: 1,
            latitude: 37.5665,
            longitude: 126.978,
            address: "테스트 헬스장",
          },
        ],
      }),
    });
  });

  await page.route("**/locations/verify", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: successResponse({ isVerified: true, grantedXp: 100 }),
    });
  });

  await page.route("**/verification/today-completion", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: successResponse({
        todayCompleted: false,
        completedMethod: null,
        rewardGrantedToday: false,
        grantedXp: 0,
        earnedDate: null,
        latestVerification: null,
      }),
    });
  });

  await page.route("**/users/me/attendance", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: successResponse({
        success: true,
        message: "출석이 완료되었습니다.",
        grantedXp: 10,
        bonusXp: 0,
        streakDays: 4,
      }),
    });
  });

  await page.route("**/auth/logout", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: successResponse(null),
    });
  });

  await page.route("**/trainer/status", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: successResponse({ isRestricted: false }),
    });
  });

  await page.route("**/marketplace/trainer/store", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: successResponse({
        storeId: 1,
        storeName: "테스트 스토어",
        address: "서울시 중구 세종대로",
        detailAddress: "1층",
        latitude: 37.5665,
        longitude: 126.978,
        phoneNumber: "010-0000-0000",
        homepageUrl: null,
        instagramUrl: null,
        xProfileUrl: null,
      }),
    });
  });
}

export async function mockLocalLogin(page: Page, user: TestUser = TEST_USER) {
  await page.evaluate(
    ({ encryptedJson, walletAddress }) => {
      window.localStorage.setItem("encrypted_wallet", encryptedJson);
      window.localStorage.setItem("wallet_address", walletAddress);
    },
    {
      encryptedJson: MOCK_WALLET.encryptedJson,
      walletAddress: MOCK_WALLET.address,
    }
  );

  await page.route("**/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: successResponse({
        accessToken: "mock-e2e-access-token",
        grantType: "Bearer",
        expiresIn: 3600,
        isNewUser: false,
        userInfo: {
          userId: user.userId,
          email: user.email,
          nickname: user.nickname,
          profileImage: user.profileImage,
          role: user.role,
          walletAddress: MOCK_WALLET.address,
        },
      }),
    });
  });
}

export async function loginAsTestUser(
  page: Page,
  user: TestUser = TEST_USER,
  options: { gymLocation?: GymLocation } = {}
) {
  await page.addInitScript(
    ({ storageValue, walletAddress, encryptedJson }) => {
      window.localStorage.setItem("user-storage", storageValue);
      window.localStorage.setItem("wallet_address", walletAddress);
      window.localStorage.setItem("encrypted_wallet", encryptedJson);
    },
    {
      storageValue: JSON.stringify(
        buildPersistedUserStorage(user, options.gymLocation)
      ),
      walletAddress: MOCK_WALLET.address,
      encryptedJson: MOCK_WALLET.encryptedJson,
    }
  );

  await page.goto("/");
  await expect(page.getByRole("button", { name: "운동 인증" })).toBeVisible({
    timeout: 15000,
  });
  await page.waitForLoadState("networkidle");
}

export async function mockGeolocation(
  page: Page,
  lat = 37.5665,
  lng = 126.978
) {
  await page.context().setGeolocation({ latitude: lat, longitude: lng });
  await page.context().grantPermissions(["geolocation"]);
}
