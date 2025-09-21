//TC-04: Verify users can sort items by price
import { test } from "@playwright/test";
import { HomePage, LoginPage, ProductPage } from "../pages";
import { Account } from "../models";
import * as assistant from "../utils";
import dotenv from "dotenv";

test("Verify users can sort items by price", async ({ page }) => {
  //Precondition: Register a valid account

  // 1. Open browser and go to https://demo.testarchitect.com/
  const homePage = new HomePage(page);
  await homePage.goto();

  // 2. Login with valid credentials
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  const authenAcc = await assistant.getAuthenticatedAccount();
  await loginPage.login(authenAcc);

  // 3. Go to Shop page
  await assistant.selectPage(page, "Shop");

  // 4. Switch view to list
  const productPage = new ProductPage(page);
  await productPage.switchToListView();

  // 5. Sort items by price (low to high / high to low)
  //Test sort low to high price
  await productPage.sortProduct("Sort by price: low to high");

  // 6. Verify the order of items
  //VP: The items should be sorted correctly by price
  await productPage.verifyProductSortedBy("Sort by price: low to high");

  //Test sort high to low price
  await productPage.sortProduct("Sort by price: high to low");
  //VP: The items should be sorted correctly by price
  await productPage.verifyProductSortedBy("Sort by price: high to low");
});
