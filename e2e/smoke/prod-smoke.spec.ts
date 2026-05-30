import { expect, test } from "@playwright/test";
import {
  createAuthenticatedSession,
  expectOk,
  hasTrainerSmokeCredentials,
  waitForApiResponse,
} from "./support/session";

test.describe("prod smoke", () => {
  test("member 홈 핵심 API가 실제 응답한다", async ({ page }) => {
    await createAuthenticatedSession(page);

    const attendanceStatusResponse = waitForApiResponse(
      page,
      "/users/me/attendance/status"
    );
    const attendanceWeeklyResponse = waitForApiResponse(
      page,
      "/users/me/attendance/weekly"
    );
    const levelResponse = waitForApiResponse(page, "/users/me/level");
    const levelPolicyResponse = waitForApiResponse(page, "/levels/policies");
    const locationResponse = waitForApiResponse(page, "/users/me/locations");
    const workoutCompletionResponse = waitForApiResponse(
      page,
      "/verification/today-completion"
    );

    await page.goto("/");

    await Promise.all([
      expectOk(attendanceStatusResponse),
      expectOk(attendanceWeeklyResponse),
      expectOk(levelResponse),
      expectOk(levelPolicyResponse),
      expectOk(locationResponse),
      expectOk(workoutCompletionResponse),
    ]);

    const workoutButton = page.getByRole("button", { name: "운동 인증" });
    await expect(workoutButton).toBeVisible();

    if (await workoutButton.isEnabled()) {
      await workoutButton.click();
      await expect(
        page.getByRole("button", { name: /위치\s*인증/ })
      ).toBeVisible();
    }
  });

  test("member 로그아웃 요청이 실제 응답하고 로그인 화면으로 이동한다", async ({
    page,
  }) => {
    await createAuthenticatedSession(page);
    await page.goto("/my");

    await page.getByRole("button", { name: "로그아웃" }).click();
    const confirmLogoutButton = page
      .getByRole("button", { name: "로그아웃" })
      .last();
    await expect(confirmLogoutButton).toBeVisible();

    const logoutResponse = waitForApiResponse(page, "/auth/logout");
    await confirmLogoutButton.click();

    await expectOk(logoutResponse);
    await expect(page).toHaveURL(/\/login$/);
  });

  test("trainer 대시보드 매장 API가 실제 응답한다", async ({ page }) => {
    test.skip(
      !hasTrainerSmokeCredentials(),
      "trainer smoke credentials are not configured."
    );

    await createAuthenticatedSession(page, "trainer");

    const trainerStoreResponse = waitForApiResponse(
      page,
      "/marketplace/trainer/store",
      (status) => status === 200 || status === 404
    );

    await page.goto("/trainer");

    const response = await trainerStoreResponse;
    expect([200, 404]).toContain(response.status());
    await expect(page).toHaveURL(/\/trainer$/);
  });
});
