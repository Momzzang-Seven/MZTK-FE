import { defineConfig, devices } from "@playwright/test";

const smokePort = Number(process.env.E2E_SMOKE_PORT ?? "4174");
const localBaseUrl = `http://127.0.0.1:${smokePort}`;
const smokeBaseUrl = process.env.E2E_SMOKE_BASE_URL || localBaseUrl;
const useRemoteFe = Boolean(process.env.E2E_SMOKE_BASE_URL);

export default defineConfig({
  testDir: "./e2e/smoke",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: smokeBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "prod-smoke",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: useRemoteFe
    ? undefined
    : {
        command: `pnpm build && pnpm exec vite preview --host 127.0.0.1 --port ${smokePort}`,
        env: {
          ...process.env,
          VITE_API_BASE_URL: process.env.E2E_SMOKE_API_BASE_URL ?? "",
        },
        url: localBaseUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 300000,
      },
});
