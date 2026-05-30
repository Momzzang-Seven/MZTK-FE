import { expect, test, type Page, type Request } from "@playwright/test";

type CapturedRequest = {
  method: string;
  path: string;
  query: string;
  body: unknown;
};

const apiEnvelope = <T>(data: T) => ({
  status: "SUCCESS",
  message: "OK",
  data,
  code: "SUCCESS",
  retryable: false,
});

const persistUser = async (
  page: Page,
  role: "MEMBER" | "TRAINER" | "ADMIN"
) => {
  await page.addInitScript((roleValue) => {
    window.localStorage.setItem(
      "user-storage",
      JSON.stringify({
        state: {
          user: {
            userId:
              roleValue === "ADMIN" ? 900 : roleValue === "TRAINER" ? 7 : 3,
            email: `${roleValue.toLowerCase()}@qa.local`,
            nickname: `${roleValue.toLowerCase()}-qa`,
            profileImage: "",
            role: roleValue,
            walletAddress: "",
          },
          isAuthenticated: true,
          accessToken: `mock-${roleValue.toLowerCase()}-token`,
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
      })
    );

    if (roleValue === "TRAINER") {
      window.localStorage.setItem("hasVisitedTrainerDashboard", "true");
      window.localStorage.setItem("trainerStoreRegistered", "true");
    }
  }, role);
};

const parseBody = (request: Request) => {
  const text = request.postData();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const installApiRoutes = async (page: Page, captured: CapturedRequest[]) => {
  await page.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    if (request.resourceType() === "document") {
      await route.continue();
      return;
    }

    const isApiRequest =
      path.startsWith("/admin") ||
      path.startsWith("/marketplace") ||
      path.startsWith("/users") ||
      path.startsWith("/levels") ||
      path.startsWith("/verification");

    if (!isApiRequest) {
      await route.continue();
      return;
    }

    captured.push({
      method: request.method(),
      path,
      query: url.searchParams.toString(),
      body: parseBody(request),
    });

    if (path === "/marketplace/trainer/store") {
      await route.fulfill({
        json: apiEnvelope({
          storeId: 5,
          storeName: "QA Trainer Store",
          address: "Seoul",
          detailAddress: "QA",
          latitude: 37.5,
          longitude: 127,
          phoneNumber: "010-0000-0000",
          homepageUrl: null,
          instagramUrl: null,
          xProfileUrl: null,
        }),
      });
      return;
    }

    if (path === "/marketplace/classes/101/reservation-info") {
      await route.fulfill({
        json: apiEnvelope({
          classId: 101,
          classTitle: "QA PT",
          trainerId: 7,
          priceAmount: 0,
          durationMinutes: 50,
          availableDates: [
            {
              date: "2026-06-01",
              availableTimes: [
                {
                  slotId: 77,
                  startTime: "10:00:00",
                  capacity: 3,
                  availableCapacity: 2,
                },
              ],
            },
          ],
        }),
      });
      return;
    }

    if (path === "/marketplace/classes/101") {
      await route.fulfill({
        json: apiEnvelope({
          classId: 101,
          trainerId: 7,
          store: {
            storeId: 5,
            storeName: "QA Trainer Store",
            address: "Seoul",
            detailAddress: "QA",
            latitude: 37.5,
            longitude: 127,
          },
          title: "QA PT",
          category: "PT",
          description: "QA class",
          priceAmount: 0,
          thumbnailFinalObjectKey: null,
          images: [],
          tags: [],
          features: [],
          durationMinutes: 50,
          personalItems: null,
          classTimes: [],
        }),
      });
      return;
    }

    if (
      request.method() === "POST" &&
      path === "/marketplace/classes/101/reservations"
    ) {
      await route.fulfill({
        json: apiEnvelope({
          reservationId: 501,
          status: "PENDING",
          web3: null,
        }),
      });
      return;
    }

    if (path === "/admin/users") {
      await route.fulfill({
        json: apiEnvelope({
          totalPages: 1,
          totalElements: 1,
          size: 20,
          content: [
            {
              userId: 3,
              nickname: "member",
              role: "USER",
              email: "member@qa.local",
              joinedAt: "2026-05-29T00:00:00",
              status: "ACTIVE",
              postCount: 0,
              commentCount: 0,
            },
          ],
          number: 0,
          first: true,
          last: true,
          numberOfElements: 1,
          empty: false,
        }),
      });
      return;
    }

    if (path === "/admin/web3/treasury-keys") {
      await route.fulfill({ json: apiEnvelope([]) });
      return;
    }

    await route.fulfill({ json: apiEnvelope({}) });
  });
};

test.describe("QA API browser contract evidence", () => {
  test("trainer dashboard uses marketplace trainer APIs and does not call legacy trainer status", async ({
    page,
  }) => {
    const captured: CapturedRequest[] = [];
    await persistUser(page, "TRAINER");
    await installApiRoutes(page, captured);

    await page.goto("/trainer");
    await expect(page.getByText("Trainer Center")).toBeVisible();

    expect(captured).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: "GET",
          path: "/marketplace/trainer/store",
        }),
      ])
    );
    expect(captured.some((request) => request.path === "/trainer/status")).toBe(
      false
    );
  });

  test("market purchase submits the reservation create contract from the browser", async ({
    page,
  }) => {
    const captured: CapturedRequest[] = [];
    await persistUser(page, "MEMBER");
    await installApiRoutes(page, captured);

    await page.goto("/market/purchase/101");
    await expect(page.getByText("Selected Class")).toBeVisible();
    await page.getByRole("button", { name: /6\.1/ }).click();
    await page.getByRole("button", { name: /10:00/ }).click();
    await page.locator("textarea").fill("qa browser request");

    const reservationRequest = page.waitForRequest(
      (request) =>
        request.method() === "POST" &&
        request.url().includes("/marketplace/classes/101/reservations")
    );
    await page.getByRole("button", { name: /MZTK/ }).click();
    const request = await reservationRequest;

    const body = JSON.parse(request.postData() ?? "{}");
    expect(body).toMatchObject({
      slotId: 77,
      reservationDate: "2026-06-01",
      reservationTime: "10:00:00",
      userRequest: "qa browser request",
      signedAmount: "0",
    });
    expect(body.idempotencyKey).toEqual(
      expect.stringMatching(/^reservation:101:77:2026-06-01:10:00:00:/)
    );
  });

  test("admin pages request BE admin APIs for users and web3 settings", async ({
    page,
  }) => {
    const captured: CapturedRequest[] = [];
    await persistUser(page, "ADMIN");
    await installApiRoutes(page, captured);

    await page.goto("/admin/users");
    await expect(page.getByText("User Database")).toBeVisible();
    expect(captured).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: "GET",
          path: "/admin/users",
        }),
      ])
    );

    await page.goto("/admin/web3");
    await expect(
      page.getByText("Manual Transaction Confirmation")
    ).toBeVisible();
    expect(captured).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          method: "GET",
          path: "/admin/web3/treasury-keys",
        }),
      ])
    );
  });
});
