import { test, expect } from "@playwright/test";
import {
  mockCoreAppApis,
  mockLocalLogin,
  TEST_TRAINER,
  TEST_USER,
} from "./fixtures/testUser";

test.describe("로그인 및 로그아웃 흐름", () => {
  test.beforeEach(async ({ page }) => {
    await mockCoreAppApis(page);
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
  });

  test("회원 로컬 로그인 후 홈으로 이동한다", async ({ page }) => {
    await mockLocalLogin(page, TEST_USER);
    await page.getByPlaceholder("이메일").fill(TEST_USER.email);
    await page.getByPlaceholder("비밀번호").fill(TEST_USER.password);
    await page.getByRole("button", { name: "로컬 계정 로그인" }).click();

    await expect(page).toHaveURL("/");
    // 레벨 표시 확인 (유연한 매칭)
    await expect(page.getByText(/Lv\.\d+/i).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("트레이너 로컬 로그인 후 트레이너 대시보드로 이동한다", async ({
    page,
  }) => {
    await mockLocalLogin(page, TEST_TRAINER);
    await page.getByPlaceholder("이메일").fill(TEST_TRAINER.email);
    await page.getByPlaceholder("비밀번호").fill(TEST_TRAINER.password);
    await page.getByRole("button", { name: "로컬 계정 로그인" }).click();

    await expect(page).toHaveURL("/trainer");
  });

  test("로그아웃 시 로그인 페이지로 리다이렉트된다", async ({ page }) => {
    await mockLocalLogin(page, TEST_USER);
    await page.getByPlaceholder("이메일").fill(TEST_USER.email);
    await page.getByPlaceholder("비밀번호").fill(TEST_USER.password);
    await page.getByRole("button", { name: "로컬 계정 로그인" }).click();
    await page.waitForURL("/");

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
