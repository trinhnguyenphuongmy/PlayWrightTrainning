import { Page } from "@playwright/test";

/**
 * Simulates a "thinking" delay using Playwright's page.waitForTimeout
 * @param page - Playwright Page object
 * @param ms - Duration to wait in milliseconds (default: 1000ms)
 */
export async function thinking(page: Page, s: number = 1): Promise<void> {
  await page.waitForTimeout(s * 1000);
}
