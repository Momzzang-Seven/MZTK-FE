import { test, expect } from "@playwright/test";

const successResponse = (data: unknown) =>
  JSON.stringify({
    status: "SUCCESS",
    message: "OK",
    data,
    code: "OK",
    retryable: false,
  });

const mockUserPage = (status: "ACTIVE" | "BLOCKED" = "ACTIVE") => ({
  totalPages: 1,
  totalElements: 1,
  size: 100,
  content: [
    {
      userId: 1,
      nickname: "운동하는직장인",
      role: "TRAINER",
      email: "fitness_lover@test.com",
      joinedAt: "2024-02-03T00:00:00.000Z",
      status,
      postCount: 18,
      commentCount: 89,
    },
  ],
  number: 0,
  first: true,
  last: true,
  numberOfElements: 1,
  empty: false,
});

test.describe("관리자 사용자 관리", () => {
  test("사용자 제한/해제 버튼이 상태에 맞게 전환된다", async ({ page }) => {
    let userStatus: "ACTIVE" | "BLOCKED" = "ACTIVE";

    await page.route("**/admin/users?**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: successResponse(mockUserPage(userStatus)),
      });
    });

    await page.route("**/admin/users/*/status", async (route) => {
      const request = route.request();
      const body = request.postDataJSON() as {
        status?: "ACTIVE" | "BLOCKED";
      };
      userStatus = body.status ?? userStatus;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: successResponse({ userId: 1, status: userStatus }),
      });
    });

    await page.goto("/admin/users");

    const banButton = page.getByRole("button", {
      name: "fitness_lover@test.com 사용자 제한",
    });
    await expect(banButton).toBeVisible({ timeout: 10000 });
    await banButton.click({ force: true });

    const unbanButton = page.getByRole("button", {
      name: "fitness_lover@test.com 사용자 제한 해제",
    });
    await expect(unbanButton).toBeVisible();
    await unbanButton.click({ force: true });

    await expect(
      page.getByRole("button", {
        name: "fitness_lover@test.com 사용자 제한",
      })
    ).toBeVisible();
  });
});
