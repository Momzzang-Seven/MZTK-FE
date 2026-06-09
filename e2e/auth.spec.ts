import { test, expect } from "@playwright/test";
import { mockCoreAppApis, TEST_USER, MOCK_WALLET } from "./fixtures/testUser";

test.describe("로그인 및 로그아웃 흐름", () => {
  test.beforeEach(async ({ page }) => {
    page.on("pageerror", (err) => {
      console.error(`PAGE ERROR: ${err.message}\n${err.stack}`);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.error(`CONSOLE ERROR: ${msg.text()}`);
      }
    });

    await mockCoreAppApis(page);
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
  });

  test("로그아웃 시 로그인 페이지로 리다이렉트된다", async ({ page }) => {
    await page.addInitScript(
      ({ storageValue, walletAddress, encryptedJson }) => {
        window.localStorage.setItem("user-storage", storageValue);
        window.localStorage.setItem("wallet_address", walletAddress);
        window.localStorage.setItem("encrypted_wallet", encryptedJson);
      },
      {
        storageValue: JSON.stringify({
          state: {
            user: {
              userId: TEST_USER.userId,
              email: TEST_USER.email,
              nickname: TEST_USER.nickname,
              profileImage: TEST_USER.profileImage,
              role: TEST_USER.role,
              walletAddress: MOCK_WALLET.address,
            },
            isAuthenticated: true,
            accessToken: "mock-e2e-access-token",
            level: 1,
            xp: 0,
            maxXp: 100,
            rewardMztkForNext: null,
            attendanceStreak: 0,
            lastAttendanceDate: null,
            lastExerciseDate: null,
            lastWorkoutRewardAppliedDate: null,
            gymLocation: {
              locationId: 1,
              lat: 37.5665,
              lng: 126.978,
              address: "테스트 헬스장",
            },
            analysisStatus: "idle",
            analysisType: null,
            analysisTargetTime: null,
            analysisStartedAt: null,
          },
          version: 0,
        }),
        walletAddress: MOCK_WALLET.address,
        encryptedJson: MOCK_WALLET.encryptedJson,
      }
    );

    await page.goto("/my");

    // 로그아웃 확인창 핸들러
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    const logoutBtn = page.getByRole("button", { name: /로그아웃/ });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();
    await page.getByRole("button", { name: "로그아웃" }).last().click();

    await expect(page).toHaveURL(/\/login/);
  });

  test("제재 계정 OAuth callback 실패 시 안내와 문의 링크가 표시된다", async ({
    page,
  }) => {
    await page.route("**/auth/login", async (route) => {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          status: "ERROR",
          code: "AUTH_005",
          message: "Account blocked by administrator",
        }),
      });
    });

    await page.goto("/callback?code=blocked-code&state=kakao");

    await expect(
      page.getByRole("heading", { name: /계정.*제재/ })
    ).toBeVisible();
    const appealLink = page.getByRole("link", { name: /이의 제기 문의하기/ });
    await expect(appealLink).toBeVisible();
    await expect(appealLink).toHaveAttribute(
      "href",
      /forms\.(gle|google\.com)/
    );
  });
});
