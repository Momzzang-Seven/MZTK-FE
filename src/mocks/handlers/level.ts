import { http, HttpResponse } from 'msw';

export const levelHandlers = [
  http.get('/users/me/level', () =>
    HttpResponse.json({
      success: true,
      data: {
        level: 5,
        availableXp: 80,
        requiredXpForNext: 100,
      },
    })
  ),

  http.get('/levels/policies', () =>
    HttpResponse.json({
      success: true,
      data: {
        policies: [
          { level: 1, requiredXp: 100 },
          { level: 2, requiredXp: 200 },
          { level: 3, requiredXp: 300 },
        ],
      },
    })
  ),

  http.post('/users/me/level-ups', () =>
    HttpResponse.json({
      success: true,
      data: {
        toLevel: 6,
        rewardMztk: 100,
      },
    })
  ),

  http.get('/users/me/xp-ledger', () =>
    HttpResponse.json({
      success: true,
      data: { content: [], totalElements: 0 },
    })
  ),

  http.get('/users/me/level-up-histories', () =>
    HttpResponse.json({
      success: true,
      data: { content: [], totalElements: 0 },
    })
  ),
];

export const levelUpFailHandlers = [
  http.post('/users/me/level-ups', () =>
    HttpResponse.json(
      { success: false, message: '연결된 지갑이 없습니다.' },
      { status: 400 }
    )
  ),
];

export const levelReadyHandlers = [
  http.get('/users/me/level', () =>
    HttpResponse.json({
      success: true,
      data: {
        level: 5,
        availableXp: 100,
        requiredXpForNext: 100,
      },
    })
  ),
];
