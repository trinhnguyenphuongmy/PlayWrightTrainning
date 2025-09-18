//TC-01: Verify users can buy an item successfully
import { test, expect } from "@playwright/test";
import { HomePage } from "../pages/home-page";
import { RegisterPage } from "../pages/register-page";
import { ProductPage } from "../pages/product-page";
import { CartPage } from "../pages/cart-page";
import { CheckOutPage } from "../pages/checkout-page";
import { BillingDetails } from "../models/billing-detail";
import { OrderPage } from "../pages/order-page";

test("Verify users can buy an item successfully", async ({ page }) => {
  //Precondition: Register a valid account
  //1.Open browser and go to https://demo.testarchitect.com/
  const homePage = new HomePage(page);
  await homePage.goto();

  //2. Login with valid credentials
  const registerPage = new RegisterPage(page);
  await registerPage.goto();
  let firstAccount = await registerPage.registerNewAccount();

  //3. Navigate to All departments section
  //4. Select Electronic Components & Supplies
  homePage.navigateTo("Electronic Components & Supplies");

  //5. Verify the items should be displayed as a grid
  const productPage = new ProductPage(page);
  await productPage.expectProductGridVisible();

  //6. Switch view to list
  await productPage.switchToListView();

  //7. Verify the items should be displayed as a list
  await productPage.expectProductListVisible();

  //8. Select any item randomly to purchase
  //9. Click 'Add to Cart'
  const {
    name: pickedName,
    price: pickedPrice,
    quantity: pickedQuantity,
  } = await productPage.addRandomProductToCart();

  //10. Go to the cart
  await homePage.goToCart();

  //11. Verify item details in mini content
  const cartPage = new CartPage(page);
  await cartPage.verifyProductDetails(
    pickedName!,
    pickedPrice!,
    pickedQuantity
  );

  //12. Click on Checkout
  await cartPage.checkOut();

  //13. Verify Checkout page displays
  await homePage.verifyNavigationByCheckPageTitle("Checkout");

  //14. Verify item details in order
  const chkOutPage = new CheckOutPage(page);
  chkOutPage.verifyOrderDetails(pickedName!, pickedPrice!, pickedQuantity);

  //15. Fill the billing details with default payment method
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

  //16. Click on PLACE ORDER
  await chkOutPage.placeOrder();

  //17. Verify Order status page displays
  await homePage.verifyPageUrl(/.*order-received.*/);

  //18. Verify the Order details with billing and item information
  const orderPage = new OrderPage(page);
  await orderPage.verifyOrderDetails(
    billingDetail,
    await chkOutPage.getOrderedProduct(),
    await chkOutPage.getOrderedQuantity(),
    (await chkOutPage.getTotalPrice()).toString(),
    defaultMethod
  );
});
