import { test, expect } from '@playwright/test';

test.describe('관리자 사용자 관리', () => {
  test('사용자 제한/해제 버튼이 상태에 맞게 전환된다', async ({ page }) => {
    await page.goto('/admin/users');

    const banButton = page.getByRole('button', {
      name: 'fitness_lover@test.com 사용자 제한',
    });
    await expect(banButton).toBeVisible({ timeout: 10000 });
    await banButton.click({ force: true });

    const unbanButton = page.getByRole('button', {
      name: 'fitness_lover@test.com 사용자 제한 해제',
    });
    await expect(unbanButton).toBeVisible();
    await unbanButton.click({ force: true });

    await expect(
      page.getByRole('button', {
        name: 'fitness_lover@test.com 사용자 제한',
      })
    ).toBeVisible();
  });
});
