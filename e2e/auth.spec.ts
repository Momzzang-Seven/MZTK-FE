import { test, expect } from '@playwright/test';

test.describe('로그인 및 로그아웃 흐름', () => {
  test.beforeEach(async ({ page }) => {
    // API 모킹: 초기 레벨 정보를 설정하여 테스트 일관성 유지
    await page.route('**/users/me/level', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'SUCCESS', 
          data: { level: 3, availableXp: 50, requiredXpForNext: 100 } 
        })
      });
    });

    await page.goto('/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
  });

  test('회원 목업로그인 후 홈으로 이동한다', async ({ page }) => {
    const mockLoginBtn = page.getByRole('button', { name: '회원 목업로그인' }).first();
    await expect(mockLoginBtn).toBeVisible();
    await mockLoginBtn.click();

    await expect(page).toHaveURL('/');
    // 레벨 표시 확인 (유연한 매칭)
    await expect(page.getByText(/Lv\.\d+/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('트레이너 목업로그인 후 홈으로 이동한다', async ({ page }) => {
    const mockLoginBtn = page.getByRole('button', { name: '트레이너 목업로그인' }).first();
    await expect(mockLoginBtn).toBeVisible();
    await mockLoginBtn.click();

    await expect(page).toHaveURL('/');
  });

  test('로그아웃 시 로그인 페이지로 리다이렉트된다', async ({ page }) => {
    await page.getByRole('button', { name: '회원 목업로그인' }).first().click();
    await page.waitForURL('/');

    await page.goto('/my');
    
    // 로그아웃 확인창 핸들러
    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    const logoutBtn = page.getByRole('button', { name: /로그아웃/ });
    await expect(logoutBtn).toBeVisible();
    await logoutBtn.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('제재 계정 OAuth callback 실패 시 안내와 문의 링크가 표시된다', async ({ page }) => {
    await page.route('**/auth/login', async route => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ERROR',
          code: 'AUTH_005',
          message: 'Account blocked by administrator',
        }),
      });
    });

    await page.goto('/callback?code=blocked-code&state=kakao');

    await expect(page.getByText('제재된 계정입니다')).toBeVisible();
    const appealLink = page.getByRole('link', { name: '이의 제기 문의하기' });
    await expect(appealLink).toBeVisible();
    await expect(appealLink).toHaveAttribute('href', /forms\.google\.com/);
  });
});
