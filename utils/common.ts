import { Page, expect } from "@playwright/test";
import { CheckOutPage } from "../pages/checkout-page";
import * as assistant from "../utils/common";

/**
 * Simulates a "thinking" delay using Playwright's page.waitForTimeout
 * @param page - Playwright Page object
 * @param ms - Duration to wait in milliseconds (default: 1000ms)
 */
export async function thinking(page: Page, s: number = 1): Promise<void> {
  await page.waitForTimeout(s * 1000);
}

export function formatPrice(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export async function cleanUpCart(page: Page): Promise<void> {
  await page.goto("/cart");

  // Loop until no more "Remove" links are found
  while ((await page.getByRole("link", { name: "Remove" }).count()) > 0) {
    const removeButton = page.getByRole("link", { name: "Remove" }).first();
    await removeButton.click();

    // Wait for item to be removed (more robust than static timeout)
    await page.waitForLoadState("networkidle");
  }
  await page.waitForSelector("text=YOUR SHOPPING CART IS EMPTY");
}

export async function verifyCartQuantity(
  page: Page,
  itemNumber: number
): Promise<void> {
  const cartAmount = await page.locator(".et-cart-quantity").first();
  await expect(cartAmount).toHaveText(itemNumber.toString());
}

export async function verifyPageUrl(
  page: Page,
  expectedUrl: string | RegExp
): Promise<void> {
  await expect(page).toHaveURL(expectedUrl);
}

export async function verifyControlExist(page: Page, linkName: string) {
  await expect(page.getByRole("link", { name: linkName })).toBeVisible();
}

export async function isSortedAscending(arr: number[]): Promise<boolean> {
  return arr.every((val, i, array) => i === 0 || array[i - 1] <= val);
}

export async function isSortedDescending(arr: number[]): Promise<boolean> {
  return arr.every((val, i, array) => i === 0 || array[i - 1] >= val);
}

export async function waitForPageLoadedCompletely(page: Page): Promise<void> {
  await page.waitForLoadState("domcontentloaded");
}

export async function verifyNavigationByCheckPageTitle(
  page: Page,
  pageName: string
): Promise<void> {
  await assistant.waitForPageLoadedCompletely(page);
  const pageTitle = page.locator("h1.title");
  await expect(pageTitle).toHaveText(pageName, { timeout: 10000 });
}

export async function clickCartIcon(page: Page): Promise<void> {
  await page
    .locator('a[href="https://demo.testarchitect.com/cart/"]')
    .first()
    .click();
}

export async function selectPage(page: Page, pageName: string): Promise<void> {
  await assistant.waitForPageLoadedCompletely(page);
  await page
    .locator("#menu-main-menu-1")
    .getByRole("link", { name: pageName })
    .click();
  await assistant.verifyNavigationByCheckPageTitle(page, pageName);
}

export async function clickButton(
  page: Page,
  buttonName: string
): Promise<void> {
  await page.getByRole("link", { name: buttonName }).click();
}
