import { test, expect, type Page } from "@playwright/test";
import {
  loginAsTestUser,
  mockCoreAppApis,
  mockGeolocation,
  TEST_USER,
} from "./fixtures/testUser";

const openLocationAuthFromHome = async (page: Page) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  await page.getByRole("button", { name: "운동 인증" }).click();
  await page.getByRole("button", { name: /위치\s*인증/ }).click();
};

test.describe("위치 인증 흐름", () => {
  test.beforeEach(async ({ page }) => {
    await mockCoreAppApis(page);
  });

  test("홈에서 운동 인증 모달의 위치 인증 선택 시 verify 페이지로 이동한다", async ({
    page,
  }) => {
    await loginAsTestUser(page);
    await mockGeolocation(page);

    await openLocationAuthFromHome(page);

    await expect(page).toHaveURL("/verify");
  });

  test("인증 성공 후 홈으로 리다이렉트된다", async ({ page }) => {
    await loginAsTestUser(page);
    await mockGeolocation(page, 37.5665, 126.978);

    await page.goto("/verify");

    const verifyBtn = page.getByRole("button", { name: "위치 인증하기" });
    await expect(verifyBtn).toBeVisible({ timeout: 15000 });
    await verifyBtn.click();

    await expect(page).toHaveURL("/", { timeout: 10000 });
  });

  test("등록 위치가 없으면 verify 또는 location-register 흐름으로 진입한다", async ({
    page,
  }) => {
    await page.route("**/users/me/locations", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "SUCCESS",
          data: { locations: [] },
        }),
      });
    });
    await loginAsTestUser(page, TEST_USER, { gymLocation: null });

    await openLocationAuthFromHome(page);

    const currentURL = page.url();
    expect(
      currentURL.includes("/verify") ||
        currentURL.includes("/location-register")
    ).toBeTruthy();
  });
});
