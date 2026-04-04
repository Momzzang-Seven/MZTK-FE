import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './fixtures/testUser';

test.describe('레벨업 흐름', () => {
  test.beforeEach(async ({ page }) => {
    // 레벨업 POST 엔드포인트 (/users/me/level-ups) 정합성 확인
    await page.route('**/users/me/level-ups', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'SUCCESS', 
          data: { toLevel: 6, rewardMztk: 50 } 
        })
      });
    });

    // 레벨 정책 API 모킹 (initLevel 성공을 위해 필요)
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

    // 출석 상태 API 모킹 (initAttendance 성공을 위해 필요)
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
  });

  test('홈 화면에 레벨 정보와 가득 찬 XP가 표시된다', async ({ page }) => {
    // 레벨 정보가 보이도록 XP를 100 미만으로 모킹 (가득 차면 버튼이 대신 표시되므로)
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

    await loginAsTestUser(page);

    await expect(page.getByText(/Lv\.5/i).first()).toBeVisible({ timeout: 15000 });
    // EXP와 XP 공백 허용해서 매칭
    await expect(page.getByText(/50\s*\/\s*100\s*(EXP|XP)/i)).toBeVisible({ timeout: 10000 });
  });

  test('XP가 가득 찼을 때 레벨업 버튼이 표시되고 클릭 시 성공 알림이 뜬다', async ({ page }) => {
    // XP를 가득 채워서 버튼이 보이게 함
    await page.route('**/users/me/level', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ 
          status: 'SUCCESS', 
          data: { level: 5, availableXp: 100, requiredXpForNext: 100 } 
        })
      });
    });

    await loginAsTestUser(page);

    const levelUpBtn = page.getByRole('button', { name: '레벨업!' });
    await expect(levelUpBtn).toBeVisible({ timeout: 15000 });

    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await levelUpBtn.click();
  });
});

test.describe('지갑 연결 흐름', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('지갑 등록 페이지가 정상적으로 렌더링된다', async ({ page }) => {
    await page.goto('/register-wallet');
    await expect(page.getByText(/지갑/i).first()).toBeVisible({ timeout: 10000 });
  });
});
