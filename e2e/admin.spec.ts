import { test, expect } from "./fixtures/coverage";

test.describe("관리자 사용자 관리", () => {
  let mockUsers = [
    {
      userId: 1,
      nickname: "헬스존맛",
      email: "fitness_lover@test.com",
      joinedAt: "2026-05-01T00:00:00.000Z",
      status: "ACTIVE" as const,
      postCount: 5,
      commentCount: 10,
      role: "USER" as const,
    },
  ];

  test.beforeEach(async ({ page }) => {
    // Mock the user list
    await page.route(/\/admin\/users(\?|$)/, async (route) => {
      if (
        route.request().resourceType() !== "fetch" &&
        route.request().resourceType() !== "xhr"
      ) {
        return route.continue();
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "SUCCESS",
          data: {
            totalPages: 1,
            totalElements: mockUsers.length,
            size: 100,
            content: mockUsers,
            number: 0,
            first: true,
            last: true,
            numberOfElements: mockUsers.length,
            empty: false,
          },
        }),
      });
    });

    // Mock patching status
    await page.route(/\/admin\/users\/\d+\/status/, async (route) => {
      const url = route.request().url();
      const match = url.match(/\/users\/(\d+)\/status/);
      const userId = match ? parseInt(match[1], 10) : 1;
      const requestBody = JSON.parse(route.request().postData() || "{}");
      const nextStatus = requestBody.status;

      // Update mock database state
      mockUsers = mockUsers.map((u) =>
        u.userId === userId ? { ...u, status: nextStatus } : u
      );

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "SUCCESS",
          data: {
            userId: userId,
            status: nextStatus,
          },
        }),
      });
    });
  });

  test("사용자 제한/해제 버튼이 상태에 맞게 전환된다", async ({ page }) => {
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
