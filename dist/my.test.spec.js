"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
(0, test_1.test)("homepage has title", async ({ page }) => {
    await page.goto("https://playwright.dev");
    await (0, test_1.expect)(page).toHaveTitle(/Playwright/);
});
