//TC-02: Verify users can buy multiple items successfully
import { test } from "@playwright/test";
import {
  HomePage,
  LoginPage,
  ProductPage,
  CartPage,
  CheckOutPage,
  OrderPage,
} from "../pages";
import * as assistant from "../utils";

test("Verify users can buy multiple items successfully", async ({ page }) => {
  //Precondition: Register a valid account
  //1.Open browser and go to https://demo.testarchitect.com/
  const homePage = new HomePage(page);
  await homePage.goto();

  //2. Login with valid credentials
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  const authenAcc = await assistant.getAuthenticatedAccount();
  await loginPage.login(authenAcc);
  await assistant.cleanUpCart(page);

  //3. Go to Shop page
  await assistant.selectPage(page, "Shop");

  //4. Select multiple items and add to cart
  const productPage = new ProductPage(page);
  const randomList = await productPage.addMultipleProductToCart(3);

  //5. Go to the cart and verify all selected items
  await assistant.clickCartIcon(page);
  const cartPage = new CartPage(page);
  await cartPage.verifyAllSelectedItems(randomList);

  //6. Proceed to checkout and confirm order
  await cartPage.checkOut();

  const chkOutPage = new CheckOutPage(page);
  await chkOutPage.verifyAllCheckOutDetails(randomList);

  const defaultMethod = await chkOutPage.getDefaultPaymentMethod();

  await chkOutPage.placeOrder();

  //7. Verify order confirmation message
  const orderPage = new OrderPage(page);

  await orderPage.verifyOrderMessage(
    await chkOutPage.getTotalPrice(),
    authenAcc.getEmail(),
    defaultMethod
  );

  //Additional VP: All selected items are purchased
  await assistant.verifyCartQuantity(page, 0);
});
