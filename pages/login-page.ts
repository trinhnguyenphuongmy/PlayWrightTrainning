import { Page, expect } from "@playwright/test";
import { Account } from "../models/account";

export class LoginPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.getByRole("link", { name: "Log in / Sign up" }).click();
  }

  // High-level Actions
  async login(authenAcc: Account): Promise<void> {
    await this.page
      .getByRole("textbox", { name: "Username or email address *" })
      .fill(authenAcc.getEmail());
    await this.page
      .getByRole("textbox", { name: "Password *" })
      .fill(authenAcc.getPassword());
    await this.page.getByRole("button", { name: "Log in" }).click();

    await expect(this.page.locator("body")).toContainText(
      "Welcome to your account page"
    );
  }
}
