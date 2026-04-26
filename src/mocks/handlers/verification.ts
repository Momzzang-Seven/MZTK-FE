import { http, HttpResponse } from "msw";

export const verificationHandlers = [
  http.get("/verification/today-completion", () =>
    HttpResponse.json({
      success: true,
      data: {
        todayCompleted: false,
        completedMethod: null,
        rewardGrantedToday: false,
        grantedXp: 0,
        earnedDate: null,
        latestVerification: null,
      },
    }),
  ),
];
