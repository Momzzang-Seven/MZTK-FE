import { http, HttpResponse } from 'msw';

export const locationHandlers = [
  http.get('/users/me/locations', () =>
    HttpResponse.json({
      success: true,
      data: {
        locations: [
          {
            locationId: 1,
            locationName: '나의 헬스장',
            address: '서울시 강남구 테헤란로 123',
            latitude: 37.5665,
            longitude: 126.9780,
          },
        ],
      },
    })
  ),

  http.post('/users/me/locations/register', () =>
    HttpResponse.json({
      success: true,
      data: { locationId: 1 },
    })
  ),

  http.post('/locations/verify', () =>
    HttpResponse.json({
      success: true,
      data: {
        isVerified: true,
        grantedXp: 100,
      },
    })
  ),

  http.delete('/users/me/locations/:locationId', () =>
    HttpResponse.json({ 
      success: true, 
      data: { success: true } 
    })
  ),
];

export const locationVerifyFailHandlers = [
  http.post('/locations/verify', () =>
    HttpResponse.json({
      success: true,
      data: { isVerified: false, grantedXp: 0 },
    })
  ),
];

export const locationEmptyHandlers = [
  http.get('/users/me/locations', () =>
    HttpResponse.json({
      success: true,
      data: { locations: [] },
    })
  ),
];
