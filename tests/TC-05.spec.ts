//TC-05: Verify orders appear in order history
import { test } from "@playwright/test";
import { HomePage, LoginPage, MyAccountPage } from "../pages";
import { Account } from "../models";
import * as assistant from "../utils";
import dotenv from "dotenv";

test("Verify orders appear in order history", async ({ page }) => {
  //Precondition: User has placed 02 orders
  const homePage = new HomePage(page);
  await homePage.goto();

  const loginPage = new LoginPage(page);
  await loginPage.goto();

  dotenv.config();
  const email = process.env.TEST_EMAIL!;
  const password = process.env.TEST_PASSWORD!;
  let authenAcc = new Account(email, password);
  await loginPage.login(authenAcc);

  await assistant.cleanUpCart(page);

  const order1 = await assistant.createOrder(page);
  const order2 = await assistant.createOrder(page);

  //1. Go to My Account page
  await page.goto("/my-account");
  await assistant.verifyNavigationByCheckPageTitle(page, "My Account");

  // 2. Click on Orders in left navigation
  await assistant.clickButton(page, " RECENT ORDERS");

  // 3. Verify order details
  //VP: The orders are displayed in the user’s order history
  const recentOrder = new MyAccountPage(page);
  await recentOrder.verifyRecentOrderDetail(order1);
  await recentOrder.verifyRecentOrderDetail(order2);
});
