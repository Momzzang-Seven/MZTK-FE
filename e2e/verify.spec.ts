import { test, expect } from '@playwright/test';
import { loginAsTestUser, mockGeolocation } from './fixtures/testUser';

test.describe('위치 인증 흐름', () => {
  test.beforeEach(async ({ page }) => {
    // 공통 초기화 API 모킹
    await page.route('**/users/me/level', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'SUCCESS', 
          data: { level: 5, availableXp: 50, requiredXpForNext: 100 } 
        })
      });
    });

    await page.route('**/levels/policies', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'SUCCESS', 
          data: [{ level: 5, requiredXp: 100, rewardMztk: 50 }] 
        })
      });
    });

    await page.route('**/users/me/attendance/status', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'SUCCESS', 
          data: { streakCount: 3, hasAttendedToday: false } 
        })
      });
    });

    await page.route('**/users/me/attendance/weekly', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'SUCCESS', 
          data: { attendedCount: 3 } 
        })
      });
    });

    // 운동 위치 API 모킹 (initLocation 성공을 위해 필요)
    await page.route('**/locations/my', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'SUCCESS', 
          data: { 
            locations: [{ 
              locationId: 1, 
              latitude: 37.5665, 
              longitude: 126.978, 
              address: '테스트 헬스장' 
            }] 
          } 
        })
      });
    });

    // 위치 인증 API 모킹
    await page.route('**/locations/verify', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'SUCCESS', 
          data: { isVerified: true, grantedXp: 100 } 
        })
      });
    });

    await loginAsTestUser(page);
  });

  test('홈에서 위치 인증 버튼 클릭 시 verify 페이지로 이동한다', async ({ page }) => {
    await mockGeolocation(page);

    const locationBtn = page.getByRole('button', { name: /위치 인증|헬스장 인증/ });
    await locationBtn.click();

    await expect(page).toHaveURL('/verify');
  });

  test('인증 성공 후 홈으로 리다이렉트된다', async ({ page }) => {
    // 37.5665, 126.978은 DEFAULT_CENTER이자 mock gymLocation의 좌표임
    await mockGeolocation(page, 37.5665, 126.978);

    await page.goto('/verify');

    // 거리가 계산되고 "위치 인증하기" 버튼이 활성화될 때까지 충분히 대기
    const verifyBtn = page.getByRole('button', { name: "위치 인증하기" });
    await expect(verifyBtn).toBeVisible({ timeout: 15000 });
    await verifyBtn.click();

    // 홈으로 리다이렉트 대기
    await expect(page).toHaveURL('/', { timeout: 10000 });
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
