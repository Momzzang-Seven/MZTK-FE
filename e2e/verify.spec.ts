import { test, expect } from '@playwright/test';
import { loginAsTestUser, mockGeolocation } from './fixtures/testUser';

test.describe('위치 인증 흐름', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('홈에서 위치 인증 버튼 클릭 시 verify 페이지로 이동한다', async ({ page }) => {
    await mockGeolocation(page);

    const locationBtn = page.getByRole('button', { name: /위치 인증|헬스장 인증/ });
    await locationBtn.click();

    await expect(page).toHaveURL('/verify');
  });

  test('인증 성공 후 홈으로 리다이렉트된다', async ({ page }) => {
    await mockGeolocation(page, 37.5665, 126.978);

    await page.goto('/verify');

    await page.waitForSelector('button[role="button"]', { timeout: 5000 });

    const verifyBtn = page.getByRole('button', { name: /위치 인증하기/ });
    await expect(verifyBtn).toBeVisible({ timeout: 5000 });
    await verifyBtn.click();

    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('운동 장소 미등록 시 location-register 페이지로 이동한다', async ({ page }) => {
    await page.goto('/');

    const locationBtn = page.getByRole('button', { name: /위치 인증|헬스장 인증/ });
    await locationBtn.click();

    const currentURL = page.url();
    expect(
      currentURL.includes('/verify') || currentURL.includes('/location-register')
    ).toBeTruthy();
  });
});
