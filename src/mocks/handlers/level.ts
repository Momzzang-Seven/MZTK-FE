import { http, HttpResponse } from "msw";

export const levelHandlers = [
  http.get("/users/me/level", () =>
    HttpResponse.json({
      success: true,
      data: {
        level: 5,
        availableXp: 80,
        requiredXpForNext: 100,
        rewardMztkForNext: 40,
      },
    })
  ),

  http.get("/levels/policies", () =>
    HttpResponse.json({
      success: true,
      data: {
        levelPolicies: [
          { currentLevel: 1, toLevel: 2, requiredXp: 100, rewardMztk: 20 },
          { currentLevel: 2, toLevel: 3, requiredXp: 200, rewardMztk: 25 },
          { currentLevel: 3, toLevel: 4, requiredXp: 300, rewardMztk: 30 },
          { currentLevel: 5, toLevel: 6, requiredXp: 100, rewardMztk: 40 },
        ],
        xpPolicies: [],
      },
    })
  ),

  http.post("/users/me/level-ups", () =>
    HttpResponse.json({
      success: true,
      data: {
        levelUpHistoryId: 1,
        fromLevel: 5,
        toLevel: 6,
        spentXp: 100,
        rewardMztk: 40,
        rewardStatus: "SUCCESS",
        rewardTxStatus: "SUCCEEDED",
        rewardTxPhase: "SUCCESS",
      },
    })
  ),

  http.get("/users/me/xp-ledger", () =>
    HttpResponse.json({
      success: true,
      data: { content: [], totalElements: 0 },
    })
  ),

  http.get("/users/me/level-up-histories", () =>
    HttpResponse.json({
      success: true,
      data: { content: [], totalElements: 0 },
    })
  ),
];

export const levelUpFailHandlers = [
  http.post("/users/me/level-ups", () =>
    HttpResponse.json(
      { success: false, message: "연결된 지갑이 없습니다." },
      { status: 400 }
    )
  ),
];

export const levelReadyHandlers = [
  http.get("/users/me/level", () =>
    HttpResponse.json({
      success: true,
      data: {
        level: 5,
        availableXp: 100,
        requiredXpForNext: 100,
        rewardMztkForNext: 40,
      },
    })
  ),
];
