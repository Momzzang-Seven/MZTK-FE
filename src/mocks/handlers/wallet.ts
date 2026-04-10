import { http, HttpResponse } from 'msw';

export const walletHandlers = [
  http.post('/web3/challenges', () =>
    HttpResponse.json({
      success: true,
      data: {
        message: 'MZTK 플랫폼 로그인 인증\n\nWallet: 0xMockAddress\nNonce: mock-nonce-12345',
      },
    })
  ),

  http.post('/web3/wallets', () =>
    HttpResponse.json({
      success: true,
      data: {
        walletAddress: '0xMockWalletAddress123',
      },
    })
  ),

  http.delete('/web3/wallets/:walletAddress', () =>
    HttpResponse.json({ success: true })
  ),
];

export const walletNotFoundHandlers = [
  http.post('/users/me/level-ups', () =>
    HttpResponse.json(
      { success: false, message: '연결된 지갑 주소가 없습니다. 지갑을 먼저 등록해주세요.' },
      { status: 400 }
    )
  ),
];
