import { Page, expect } from "@playwright/test";

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

  async goToCart(): Promise<void> {
    await this.page
      .locator('a[href="https://demo.testarchitect.com/cart/"]')
      .first()
      .click();
  }

  async selectPage(pageName: string): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
    await this.page
      .locator("#menu-main-menu-1")
      .getByRole("link", { name: pageName })
      .click();
    await this.verifyNavigationByCheckPageTitle(pageName);
  }

  async navigateTo(pageName: string): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
    const menu = await this.page.locator('[class*="-menu-toggle"]');
    await menu.waitFor({ state: "visible", timeout: 6000 });
    await menu.click();

    const targetLink = await this.page
      .locator(".item-link", {
        hasText: pageName,
      })
      .first();
    await targetLink.waitFor({ state: "visible", timeout: 6000 });
    await targetLink.click({ force: true });
    await this.verifyNavigationByCheckPageTitle(pageName);
  }

  async verifyNavigationByCheckPageTitle(pageName: string): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
    const pageTitle = await this.page.locator(".title");
    await expect(pageTitle).toHaveText(pageName, { timeout: 10000 });
  }

  async verifyPageUrl(expectedUrl: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl);
  }
}
