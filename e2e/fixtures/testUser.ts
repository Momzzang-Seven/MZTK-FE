import { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'test@mztk.com',
  password: 'Test1234!',
  nickname: '테스트유저',
};

export const MOCK_WALLET = {
  address: '0xMockWalletAddress123456789',
};

export async function loginAsTestUser(page: Page) {
  await page.goto('/login');
  await page.getByPlaceholder('이메일').fill(TEST_USER.email);
  await page.getByPlaceholder('비밀번호').fill(TEST_USER.password);
  await page.getByRole('button', { name: /로그인/ }).click();
  await page.waitForURL('/');
}

export async function mockGeolocation(page: Page, lat = 37.5665, lng = 126.978) {
  await page.context().setGeolocation({ latitude: lat, longitude: lng });
  await page.context().grantPermissions(['geolocation']);
}
