import { expect, test, type Page } from "@playwright/test";
import { createAuthenticatedSession } from "./support/session";

const ALLOWED_MARKET_QUERY_KEYS = new Set([
  "lat",
  "lng",
  "category",
  "sort",
  "trainerId",
  "startTime",
  "endTime",
  "search",
  "page",
]);

const isMarketListUrl = (url: string) => {
  try {
    return new URL(url).pathname === "/marketplace/classes";
  } catch {
    return false;
  }
};

const waitForMarketList = (page: Page) =>
  page.waitForResponse(
    (response) =>
      isMarketListUrl(response.url()) &&
      response.request().method() === "GET" &&
      response.status() >= 200 &&
      response.status() < 300,
    { timeout: 30000 }
  );

const waitForAnyMarketList = (page: Page) =>
  page.waitForResponse(
    (response) =>
      isMarketListUrl(response.url()) && response.request().method() === "GET",
    { timeout: 30000 }
  );

const waitForMarketSearch = (page: Page, search: string) =>
  page.waitForResponse(
    (response) =>
      isMarketListUrl(response.url()) &&
      response.request().method() === "GET" &&
      new URL(response.url()).searchParams.get("search") === search,
    { timeout: 30000 }
  );

test.describe("local fullstack market smoke", () => {
  test.setTimeout(60000);

  test.skip(
    !process.env.E2E_SMOKE_API_BASE_URL?.startsWith("http://localhost"),
    "local fullstack smoke requires E2E_SMOKE_API_BASE_URL=http://localhost:..."
  );

  test("market list uses supported params and direct detail back falls back", async ({
    page,
  }) => {
    await createAuthenticatedSession(page);

    const marketListUrls: string[] = [];
    const marketNetworkEvents: string[] = [];
    const trackMarketEvent = (event: string, url: string) => {
      if (url.includes("marketplace") || url.includes("localhost:8080")) {
        marketNetworkEvents.push(`${event} ${url}`);
      }
    };

    page.on("request", (request) => {
      if (isMarketListUrl(request.url())) {
        marketListUrls.push(request.url());
      }
      trackMarketEvent(`REQ ${request.method()}`, request.url());
    });
    page.on("response", (response) => {
      trackMarketEvent(`RES ${response.status()}`, response.url());
    });
    page.on("requestfailed", (request) => {
      trackMarketEvent(
        `FAIL ${request.failure()?.errorText ?? "unknown"}`,
        request.url()
      );
    });

    const listResponsePromise = waitForMarketList(page);
    await page.goto("/market");
    const listResponse = await listResponsePromise.catch((error) => {
      throw new Error(
        [
          "Marketplace list did not return a 2xx /marketplace/classes response.",
          "Observed network events:",
          ...marketNetworkEvents,
          `Original error: ${error}`,
        ].join("\n")
      );
    });
    const payload = await listResponse.json();
    const firstClass = payload.data?.items?.[0];

    expect(firstClass?.classId).toBeTruthy();
    expect(firstClass?.title).toBeTruthy();
    await expect(page.getByText(firstClass.title).first()).toBeVisible({
      timeout: 30000,
    });

    const searchKeyword = firstClass.title.slice(0, 8);
    const searchResponsePromise = waitForMarketSearch(page, searchKeyword);
    await page.getByRole("textbox").fill(searchKeyword);
    const searchResponse = await searchResponsePromise;
    expect(
      searchResponse.status(),
      `market search response body: ${await searchResponse.text()}`
    ).toBeLessThan(300);

    for (const url of marketListUrls) {
      const params = new URL(url).searchParams;
      expect(params.has("keyword")).toBe(false);
      expect(params.has("status")).toBe(false);
      for (const key of params.keys()) {
        expect(ALLOWED_MARKET_QUERY_KEYS.has(key)).toBe(true);
      }
    }

    const directPage = await page.context().newPage();
    const detailResponsePromise = directPage.waitForResponse(
      (response) =>
        new URL(response.url()).pathname ===
          `/marketplace/classes/${firstClass.classId}` &&
        response.status() >= 200 &&
        response.status() < 300,
      { timeout: 30000 }
    );

    await directPage.goto(`/market/${firstClass.classId}`);
    await detailResponsePromise;
    await expect(directPage.getByText(firstClass.title).first()).toBeVisible({
      timeout: 30000,
    });

    await directPage.getByRole("button", { name: "마켓으로 돌아가기" }).click();
    await expect(directPage).toHaveURL(/\/market$/);
  });
});
