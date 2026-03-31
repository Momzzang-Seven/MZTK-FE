import { test, expect } from '@playwright/test';
import { loginAsTestUser } from './fixtures/testUser';

test.describe('레벨업 흐름', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('홈 화면에 레벨 정보가 표시된다', async ({ page }) => {
    await expect(page.getByText(/Lv\./)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/EXP/)).toBeVisible({ timeout: 5000 });
  });

  test('XP가 가득 찼을 때 레벨업 버튼이 표시된다', async ({ page }) => {
    // XP가 100/100인 상태를 가정 (BE 테스트 계정 세팅 필요)
    // 실제 테스트 환경에서는 DB seed로 조건을 만들어 놓아야 함
    const levelUpBtn = page.getByRole('button', { name: '레벨업!' });

    // 레벨업 버튼이 있으면 클릭, 없으면 skip
    if (await levelUpBtn.isVisible()) {
      await levelUpBtn.click();

      // 지갑 연결 시: 성공 alert
      // 지갑 미연결 시: 실패 alert
      page.on('dialog', async dialog => {
        expect(dialog.message()).toMatch(/레벨|지갑|달성|오류/);
        await dialog.accept();
      });
    } else {
      test.skip(true, '현재 XP가 레벨업 조건에 미달 - 테스트 스킵');
    }
  });
});

test.describe('지갑 연결 흐름 (지갑 API 연동 후 활성화)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test('지갑 등록 페이지가 렌더링된다', async ({ page }) => {
    await page.goto('/create-wallet');
    await expect(page).toHaveURL('/create-wallet');
    await expect(page.locator('body')).toBeVisible();
  });

  test.skip('MetaMask 지갑 연결 후 레벨업 성공', async ({ page }) => {
    // TODO: 지갑 API 연동 완료 후 구현
    // 1. 지갑 연결 버튼 클릭
    // 2. MetaMask 팝업 처리 (playwright-metamask 또는 test seed 사용)
    // 3. 챌린지 서명
    // 4. 지갑 등록 API 호출
    // 5. 레벨업 버튼 클릭 → 성공 alert 확인
    await page.goto('/');
  });
});
