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
        page.getByRole("button", { name: "위치 인증" })
      ).toBeVisible();
    }
  });

  test("member 로그아웃 요청이 실제 응답하고 로그인 화면으로 이동한다", async ({
    page,
  }) => {
    await createAuthenticatedSession(page);
    await page.goto("/my");

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    const logoutResponse = waitForApiResponse(page, "/auth/logout");

    await page.getByRole("button", { name: "로그아웃" }).click();

    await expectOk(logoutResponse);
    await expect(page).toHaveURL(/\/login$/);
  });

  test("trainer 대시보드 상태 API가 실제 응답한다", async ({ page }) => {
    test.skip(
      !hasTrainerSmokeCredentials(),
      "trainer smoke credentials are not configured."
    );

    await createAuthenticatedSession(page, "trainer");

    const trainerStatusResponse = waitForApiResponse(page, "/trainer/status");

    await page.goto("/trainer");

    await expectOk(trainerStatusResponse);
    await expect(page).toHaveURL(/\/trainer$/);
  });
});
