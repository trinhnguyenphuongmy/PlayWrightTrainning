import { Page } from "@playwright/test";
import { Account } from "../models/account";

export class RegisterPage {
  private page: Page;
  private registeredEmail: string | null = null;

  getEmail(): string | null {
    return this.registeredEmail;
  }

  constructor(page: Page) {
    this.page = page;
  }

  async goto(): Promise<void> {
    await this.page.getByRole("link", { name: "Log in / Sign up" }).click();
  }

  // High-level Actions
  async registerNewAccount(): Promise<void> {
    let newAccount: Account;
    try {
      newAccount = await Account.createRandomAccount();
    } catch (error) {
      throw new Error("Error creating account:" + error);
    }
    this.registeredEmail = newAccount.getEmail();
    await this.page
      .getByRole("textbox", { name: "Email address *", exact: true })
      .fill(this.registeredEmail);
    await this.page.getByRole("button", { name: "Register" }).click();
  }
}
