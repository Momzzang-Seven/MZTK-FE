import { test, expect, type Page } from '@playwright/test';
import { loginAsTestUser, mockGeolocation } from './fixtures/testUser';

const openLocationAuthFromHome = async (page: Page) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: '운동 인증' }).click();
  await page.getByRole('button', { name: '위치 인증' }).click();
};

test.describe('위치 인증 흐름', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/users/me/level', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          data: { level: 5, availableXp: 50, requiredXpForNext: 100 },
        }),
      });
    });

    await page.route('**/levels/policies', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          data: [{ level: 5, requiredXp: 100, rewardMztk: 50 }],
        }),
      });
    });

    await page.route('**/users/me/attendance/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          data: { streakCount: 3, hasAttendedToday: false },
        }),
      });
    });

    await page.route('**/users/me/attendance/weekly', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          data: { attendedCount: 3 },
        }),
      });
    });

    await page.route('**/users/me/locations', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          data: {
            locations: [
              {
                locationId: 1,
                latitude: 37.5665,
                longitude: 126.978,
                address: '테스트 헬스장',
              },
            ],
          },
        }),
      });
    });

    await page.route('**/locations/verify', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          data: { isVerified: true, grantedXp: 100 },
        }),
      });
    });

    await loginAsTestUser(page);
  });

  test('홈에서 운동 인증 모달의 위치 인증 선택 시 verify 페이지로 이동한다', async ({ page }) => {
    await mockGeolocation(page);

    await openLocationAuthFromHome(page);

    await expect(page).toHaveURL('/verify');
  });

  test('인증 성공 후 홈으로 리다이렉트된다', async ({ page }) => {
    await mockGeolocation(page, 37.5665, 126.978);

    await page.goto('/verify');

    const verifyBtn = page.getByRole('button', { name: '위치 인증하기' });
    await expect(verifyBtn).toBeVisible({ timeout: 15000 });
    await verifyBtn.click();

    await expect(page).toHaveURL('/', { timeout: 10000 });
  });

  test('등록 위치가 없으면 verify 또는 location-register 흐름으로 진입한다', async ({ page }) => {
    await page.route('**/users/me/locations', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'SUCCESS',
          data: { locations: [] },
        }),
      });
    });

    await openLocationAuthFromHome(page);

    const currentURL = page.url();
    expect(
      currentURL.includes('/verify') || currentURL.includes('/location-register')
    ).toBeTruthy();
  });
});
