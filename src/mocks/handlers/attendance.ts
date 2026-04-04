import { http, HttpResponse } from 'msw';

export const attendanceHandlers = [
  http.post('/users/me/attendance', () =>
    HttpResponse.json({
      success: true,
      data: {
        success: true,
        message: '출석 체크 완료! +10 XP',
        grantedXp: 10,
        bonusXp: 0,
        streakDays: 3,
      },
    })
  ),

  http.get('/users/me/attendance/status', () =>
    HttpResponse.json({
      success: true,
      data: {
        hasAttendedToday: false,
        streakCount: 2,
      },
    })
  ),

  http.get('/users/me/attendance/weekly', () =>
    HttpResponse.json({
      success: true,
      data: {
        attendedCount: 3,
        weeklyRecord: [true, true, true, false, false, false, false],
      },
    })
  ),
];

export const attendanceAlreadyCheckedHandlers = [
  http.post('/users/me/attendance', () =>
    HttpResponse.json(
      { success: false, message: '오늘 이미 출석했습니다.' },
      { status: 409 }
    )
  ),
];
