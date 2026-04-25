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
  // Use the mock member login button
  const mockLoginBtn = page.getByRole('button', { name: '회원 목업로그인' });
  await mockLoginBtn.click();
  // 홈으로 이동할 때까지 대기
  await page.waitForURL('/');
  await page.evaluate((walletAddress) => {
    localStorage.setItem('wallet_address', walletAddress);
  }, MOCK_WALLET.address);
  // 네트워크가 어느 정도 안정될 때까지 대기하여 초기화 API 호출이 완료되도록 함
  await page.waitForLoadState('networkidle');
}

export async function mockGeolocation(page: Page, lat = 37.5665, lng = 126.978) {
  await page.context().setGeolocation({ latitude: lat, longitude: lng });
  await page.context().grantPermissions(['geolocation']);
}
