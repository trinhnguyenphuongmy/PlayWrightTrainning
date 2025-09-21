//TC-08: Verify users can clear the cart
import { test } from "@playwright/test";
import { HomePage, LoginPage, ProductPage, CartPage } from "../pages";
import * as assistant from "../utils";

test("Verify users can clear the cart", async ({ page }) => {
  // 1. Open browser and go to https://demo.testarchitect.com/
  const homePage = new HomePage(page);
  await homePage.goto();

  //2. Login with valid credentials
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  const authenAcc = await assistant.getAuthenticatedAccount();
  await loginPage.login(authenAcc);
  await assistant.cleanUpCart(page);

  //Precondition: User added the items into cart
  await assistant.selectPage(page, "Shop");
  const productPage = new ProductPage(page);
  const randomList = await productPage.addMultipleProductToCart(3);

  // 3. Go to Shopping cart page
  await assistant.clickCartIcon(page);

  // 4. Verify items show in table
  const cartPage = new CartPage(page);
  await cartPage.verifyAllSelectedItems(randomList);

  // 5. Click on Clear shopping cart
  // 6. Verify empty cart page displays
  //VP: YOUR SHOPPING CART IS EMPTY displays
  await cartPage.clearCart();
});
