import { test, expect, type Page } from "@playwright/test";
import {
  loginAsTestUser,
  mockCoreAppApis,
  mockGeolocation,
} from "./fixtures/testUser";

const openLocationAuthFromHome = async (page: Page) => {
  await page.getByRole("button", { name: "운동 인증" }).click();
  await page.getByRole("button", { name: "위치 인증" }).click();
};

test.describe("핵심 비즈니스 흐름 (로그인 → 운동 인증 → 보상 수령)", () => {
  let mockLevelData = { level: 5, availableXp: 90, requiredXpForNext: 100 };

  test.beforeEach(async ({ page }) => {
    mockLevelData = { level: 5, availableXp: 90, requiredXpForNext: 100 };

    await mockCoreAppApis(page);

    await page.route("**/users/me/level", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "SUCCESS",
          data: mockLevelData,
        }),
      });
    });

    await page.route("**/locations/verify", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "SUCCESS",
          data: { isVerified: true, grantedXp: 10 },
        }),
      });
    });

    await page.route("**/users/me/level-ups", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "SUCCESS",
          data: { toLevel: 6, rewardMztk: 100 },
        }),
      });
    });
  });

  test("사용자가 로그인 후 위치를 인증하고 레벨업 보상을 획득하는 흐름이 동작한다", async ({
    page,
  }) => {
    await loginAsTestUser(page);

    await expect(page.getByText(/Lv\.5/i).first()).toBeVisible({
      timeout: 15000,
    });

    await mockGeolocation(page, 37.5665, 126.978);
    await openLocationAuthFromHome(page);
    await expect(page).toHaveURL(/\/verify/, { timeout: 10000 });

    const verifyBtn = page.getByRole("button", { name: "위치 인증하기" });
    await expect(verifyBtn).toBeVisible({ timeout: 15000 });

    mockLevelData = { level: 5, availableXp: 100, requiredXpForNext: 100 };
    await verifyBtn.click();

    await expect(page).toHaveURL("/", { timeout: 10000 });

    const levelUpBtn = page.getByRole("button", { name: /레벨업/ });
    await expect(levelUpBtn).toBeVisible({ timeout: 15000 });

    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    mockLevelData = { level: 6, availableXp: 0, requiredXpForNext: 200 };
    await levelUpBtn.click({ force: true });

    await expect(page.getByText(/Lv\.6/i).first()).toBeVisible({
      timeout: 15000,
    });
  });
});
