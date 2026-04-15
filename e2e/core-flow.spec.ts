import { test, expect } from '@playwright/test';
import { loginAsTestUser, mockGeolocation } from './fixtures/testUser';

test.describe('핵심 비즈니스 흐름 (로그인 → 운동 인증 → 보상 수령)', () => {
  let mockLevelData = { level: 5, availableXp: 90, requiredXpForNext: 100 };

  test.beforeEach(async ({ page }) => {
    // 1. 공통 환경 모킹 (레벨 정책, 출석 등)
    await page.route('**/users/me/level', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'SUCCESS', 
          data: mockLevelData 
        })
      });
    });

    await page.route('**/levels/policies', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'SUCCESS', 
          data: [{ level: 5, requiredXp: 100, rewardMztk: 50 }, { level: 6, requiredXp: 200, rewardMztk: 100 }]
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
          data: { attendedCount: 3, history: [] } 
        })
      });
    });

    // 2. 헬스장 위치 등록 데이터 모킹
    await page.route('**/users/me/locations', async route => {
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

    // 3. 위치 인증 성공 API 모킹
    await page.route('**/locations/verify', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'SUCCESS', 
          data: { isVerified: true, grantedXp: 10 } 
        })
      });
    });

    // 4. 레벨업 API 모킹 (XP 90 + 10 = 100 이므로 다음 단계에서 호출될 수 있음)
    await page.route('**/users/me/level-ups', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'SUCCESS', 
          data: { toLevel: 6, rewardMztk: 100 } 
        })
      });
    });
  });

  test('사용자가 로그인 후 위치를 인증하고 레벨업 보상을 획득하는 흐름을 완수한다', async ({ page }) => {
    // 1단계: 사용자 로그인 (지갑 연결은 생략)
    await loginAsTestUser(page);

    // 홈 화면 진입 확인
    await expect(page.getByText(/Lv\.5/i).first()).toBeVisible({ timeout: 15000 });

    // 2단계: 위치 인증 페이지로 이동 및 위치 모킹 (정위치 - 37.5665, 126.978)
    await mockGeolocation(page, 37.5665, 126.978);
    const locationBtn = page.getByRole('button', { name: /위치 인증|헬스장 인증/ });
    await expect(locationBtn).toBeVisible();
    await locationBtn.click();
    await expect(page).toHaveURL(/\/verify/, { timeout: 10000 });

    // 3단계: 인증 프로세스
    const verifyBtn = page.getByRole('button', { name: "위치 인증하기" });
    await expect(verifyBtn).toBeVisible({ timeout: 15000 });

    // 인증 완료 후에는 level=5, xp=100을 반환하도록 mock 데이터 변경
    mockLevelData = { level: 5, availableXp: 100, requiredXpForNext: 100 };
    await verifyBtn.click();

    // 인증 완료 후 홈으로 자동 리다이렉션 대기 (2초)
    await expect(page).toHaveURL('/', { timeout: 10000 });

    // 4단계: 인증 성공 후 XP 적립 (90 -> 100)으로 인한 상태 변화로 레벨업 버튼 등장 (Zustand 자동 업데이트)
    const levelUpBtn = page.getByRole('button', { name: '레벨업!' });
    await expect(levelUpBtn).toBeVisible({ timeout: 15000 });

    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    // 레벨업 동작 시 level=6, xp=0 반환하도록 mock 데이터 변경
    mockLevelData = { level: 6, availableXp: 0, requiredXpForNext: 200 };
    await levelUpBtn.click({ force: true });

    // 5단계: 레벨업 API 후 홈화면의 레벨 표시 갱신 (6으로 변경됨)
    await expect(page.getByText(/Lv\.6/i).first()).toBeVisible({ timeout: 15000 });
  });
});
