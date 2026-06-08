import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { createAuthenticatedSession } from "./support/session";

type ViewportCase = {
  name: string;
  width: number;
  height: number;
};

const artifactDir = join(
  process.cwd(),
  "..",
  "output",
  "playwright",
  "local-fullstack-visual-20260601-KST"
);

const viewports: ViewportCase[] = [
  { name: "desktop", width: 1440, height: 1100 },
  { name: "mobile", width: 390, height: 844 },
];

const safeName = (value: string) => value.replace(/[^a-z0-9-]+/gi, "-");

const expectNoHorizontalOverflow = async (page: Page) => {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(2);
};

const capture = async (
  page: Page,
  viewport: ViewportCase,
  routeName: string
) => {
  mkdirSync(artifactDir, { recursive: true });
  await page.screenshot({
    path: join(artifactDir, `${viewport.name}-${safeName(routeName)}.png`),
    fullPage: true,
  });
};

const installPageErrorFailFast = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  return () => expect(errors, "browser page errors").toEqual([]);
};

const createAdminSession = async (page: Page) => {
  const loginId = process.env.E2E_SMOKE_ADMIN_LOGIN_ID;
  const password = process.env.E2E_SMOKE_ADMIN_PASSWORD;
  const apiBaseUrl = process.env.E2E_SMOKE_API_BASE_URL;

  test.skip(
    !loginId || !password || !apiBaseUrl,
    "admin visual smoke requires disposable admin credentials"
  );

  const response = await page.request.post(`${apiBaseUrl}/auth/login`, {
    data: { provider: "LOCAL_ADMIN", loginId, password },
  });
  expect(response.ok()).toBeTruthy();

  const payload = await response.json();
  const loginData = payload.data;

  await page.addInitScript(
    ({ storageValue }) => {
      window.localStorage.setItem("user-storage", storageValue);
    },
    {
      storageValue: JSON.stringify({
        state: {
          user: { ...loginData.userInfo, role: "ADMIN" },
          isAuthenticated: true,
          accessToken: loginData.accessToken,
          level: 1,
          xp: 0,
          attendanceStreak: 0,
          lastAttendanceDate: null,
          lastExerciseDate: null,
          gymLocation: null,
          analysisStatus: "idle",
          analysisType: null,
          analysisTargetTime: null,
        },
        version: 0,
      }),
    }
  );
};

test.describe("local fullstack visual smoke", () => {
  for (const viewport of viewports) {
    test(`member key screens render without horizontal overflow - ${viewport.name}`, async ({
      page,
    }) => {
      test.setTimeout(180000);
      const assertNoPageErrors = installPageErrorFailFast(page);
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      await createAuthenticatedSession(page);

      const memberRoutes = [
        { path: "/market", label: /마켓|클래스|전체/ },
        { path: "/market/reservations", label: /예약/ },
        { path: "/community/free", label: /커뮤니티|자유/ },
        { path: "/my", label: /마이|프로필|로그아웃/ },
      ];

      for (const route of memberRoutes) {
        await page.goto(route.path);
        await expect(page.locator("body")).toBeVisible();
        await expect(page.locator("body")).toContainText(route.label);
        await expectNoHorizontalOverflow(page);
        await capture(page, viewport, route.path);
      }

      assertNoPageErrors();
    });

    test(`trainer key screens render without horizontal overflow - ${viewport.name}`, async ({
      page,
    }) => {
      test.setTimeout(180000);
      const assertNoPageErrors = installPageErrorFailFast(page);
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await createAuthenticatedSession(page, "trainer");

      const trainerRoutes = [
        { path: "/trainer", label: /Trainer Center|센터 관리/ },
        { path: "/trainer/list", label: /클래스|등록/ },
        { path: "/trainer/reservations", label: /예약/ },
      ];

      for (const route of trainerRoutes) {
        await page.goto(route.path);
        await expect(page.locator("body")).toBeVisible();
        await expect(page.locator("body")).toContainText(route.label);
        await expectNoHorizontalOverflow(page);
        await capture(page, viewport, route.path);
      }

      assertNoPageErrors();
    });

    test(`admin key screens render without horizontal overflow - ${viewport.name}`, async ({
      page,
    }) => {
      test.setTimeout(180000);
      const assertNoPageErrors = installPageErrorFailFast(page);
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await createAdminSession(page);

      const adminRoutes = [
        { path: "/admin/users", label: /사용자|회원/ },
        { path: "/admin/posts", label: /게시글|댓글/ },
        { path: "/admin/web3", label: /Web3|Treasury|트랜잭션/ },
      ];

      for (const route of adminRoutes) {
        await page.goto(route.path);
        await expect(page.locator("body")).toBeVisible();
        await expect(page.locator("body")).toContainText(route.label);
        await expectNoHorizontalOverflow(page);
        await capture(page, viewport, route.path);
      }

      assertNoPageErrors();
    });
  }
});
