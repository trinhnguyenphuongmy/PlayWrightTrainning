//TC-: Verify users can buy multiple item successfully
import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/home-page";
import { RegisterPage } from "../pages/register-page";
import { ProductPage } from "../pages/product-page";
import { CartPage } from "../pages/cart-page";
import { CheckOutPage } from "../pages/checkout-page";
import { BillingDetails } from "../models/billing-detail";

test("Verify users can buy an item successfully", async ({ page }) => {
  //Precondition: Register a valid account
  //1.Open browser and go to https://demo.testarchitect.com/
  const homePage = new HomePage(page);
  await homePage.goto();

  //2. Login with valid credentials
  const registerPage = new RegisterPage(page);
  await registerPage.goto();
  let firstAccount = await registerPage.registerNewAccount();

  //3. Go to Shop page
  homePage.selectPage("Shop");

  //4. Select multiple items and add to cart
  const productPage = new ProductPage(page);
  const randomList = await productPage.addMultipleProductToCart(3);

  //5. Go to the cart and verify all selected items
  homePage.goToCart();
  const cartPage = new CartPage(page);
  cartPage.verifyAllSelectedItems(randomList);

  //6. Proceed to checkout and confirm order
  await cartPage.clickButton("PROCEED TO CHECKOUT");

  const chkOutPage = new CheckOutPage(page);
  await chkOutPage.placeOrder();

  //7. Verify order confirmation message

  await cartPage.checkOut();

  await homePage.verifyNavigationByCheckPageTitle("Checkout");

  const chkOutPage = new CheckOutPage(page);
  chkOutPage.verifyOrderDetails(pickedName!, pickedPrice!, pickedQuantity);

  let billingDetail = new BillingDetails(
    "My",
    "Trinh",
    "Vietnam",
    "253 Hoang Van Thu",
    "Ho Chi Minh City",
    "700000",
    "0909090909",
    registerPage.getEmail()!,
    "My Company",
    "No notes"
  );
  const defaultMethod = await chkOutPage.getDefaultPaymentMethod();

  await chkOutPage.fillBillingDetails(billingDetail);

  await chkOutPage.placeOrder();

  await homePage.verifyPageUrl(/.*order-received.*/);
});
