import { http, HttpResponse } from 'msw';

export const authHandlers = [
  http.post('/auth/login', () =>
    HttpResponse.json({
      success: true,
      data: {
        accessToken: 'mock-access-token',
        grantType: 'Bearer',
        expiresIn: 3600,
        isNewUser: false,
        userInfo: {
          userId: 1,
          email: 'test@mztk.com',
          nickname: '테스트유저',
          profileImage: '',
          role: 'USER',
          walletAddress: '0xMockWalletAddress',
        },
      },
    })
  ),

  http.post('/auth/reissue', () =>
    HttpResponse.json({
      success: true,
      data: {
        accessToken: 'mock-access-token-reissued',
        grantType: 'Bearer',
        expiresIn: 3600,
      },
    })
  ),

  http.post('/auth/logout', () => HttpResponse.json({ success: true })),
];
