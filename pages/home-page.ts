import { Page, expect } from "@playwright/test";
import * as assistant from "../utils/common";

export class HomePage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // High-level Actions
  async goto(): Promise<void> {
    await this.page.goto("/");

    // Additional steps to close the popup
    await this.page.getByRole("button", { name: "Close" }).click();
  }

  async navigateTo(pageName: string): Promise<void> {
    await assistant.waitForPageLoadedCompletely(this.page);
    const menu = this.page.locator('[class*="-menu-toggle"]');
    await menu.waitFor({ state: "visible", timeout: 6000 });
    await menu.click();

    const targetLink = this.page
      .locator(".item-link", {
        hasText: pageName,
      })
      .first();
    await targetLink.waitFor({ state: "visible", timeout: 10000 });
    await targetLink.click({ force: true });
    await assistant.verifyNavigationByCheckPageTitle(this.page, pageName);
  }
}
