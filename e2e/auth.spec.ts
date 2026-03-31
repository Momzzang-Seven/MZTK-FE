import { test, expect } from '@playwright/test';
import { TEST_USER } from './fixtures/testUser';

test.describe('로그인 흐름', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('이메일/비밀번호로 로그인 후 홈으로 이동한다', async ({ page }) => {
    await page.getByPlaceholder('이메일').fill(TEST_USER.email);
    await page.getByPlaceholder('비밀번호').fill(TEST_USER.password);
    await page.getByRole('button', { name: /로그인/ }).click();

    await expect(page).toHaveURL('/');
  });

  test('틀린 비밀번호로 로그인 시 오류 메시지가 표시된다', async ({ page }) => {
    await page.getByPlaceholder('이메일').fill(TEST_USER.email);
    await page.getByPlaceholder('비밀번호').fill('wrongpassword');
    await page.getByRole('button', { name: /로그인/ }).click();

    await expect(
      page.getByText(/비밀번호|오류|실패/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('로그아웃 후 로그인 페이지로 이동한다', async ({ page }) => {
    // 먼저 로그인
    await page.getByPlaceholder('이메일').fill(TEST_USER.email);
    await page.getByPlaceholder('비밀번호').fill(TEST_USER.password);
    await page.getByRole('button', { name: /로그인/ }).click();
    await page.waitForURL('/');

    // 마이 페이지로 이동 후 로그아웃
    await page.goto('/my');
    await page.getByRole('button', { name: /로그아웃/ }).click();

    await expect(page).toHaveURL('/login');
  });
});
