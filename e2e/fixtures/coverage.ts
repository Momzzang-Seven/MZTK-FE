/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { test as base } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    await use(page);

    // Capture coverage after test execution
    try {
      const coverage: unknown = await page.evaluate(
        () => (window as any).__coverage__
      );
      if (coverage) {
        const coverageDir = path.join(process.cwd(), ".nyc_output");
        if (!fs.existsSync(coverageDir)) {
          fs.mkdirSync(coverageDir, { recursive: true });
        }
        const sanitizedTitle = testInfo.title
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase();
        fs.writeFileSync(
          path.join(
            coverageDir,
            `playwright_${sanitizedTitle}_${testInfo.project.name}_${Date.now()}.json`
          ),
          JSON.stringify(coverage)
        );
      }
    } catch (e) {
      console.warn(
        "Failed to collect E2E coverage for test:",
        testInfo.title,
        e
      );
    }
  },
});

export { expect } from "@playwright/test";
