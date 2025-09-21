//TC-06: Verify users try to buy an item without logging in (As a guest)
import { test } from "@playwright/test";
import {
  HomePage,
  ProductPage,
  CartPage,
  CheckOutPage,
  OrderPage,
} from "../pages";
import { BillingDetails } from "../models";
import * as assistant from "../utils";

test("Verify users try to buy an item without logging in (As a guest)", async ({
  page,
}) => {
  //Precondition: User is NOT logged in

  // 1. Open https://demo.testarchitect.com/
  const homePage = new HomePage(page);
  await homePage.goto();

  // 2. Navigate to 'Shop' or 'Products' section
  await assistant.selectPage(page, "Shop");

  // 3. Add a product to cart
  const productPage = new ProductPage(page);
  const randomList = await productPage.addMultipleProductToCart(1);

  // 4. Click on Cart button
  await assistant.clickCartIcon(page);

  // 5. Proceed to complete order
  const cartPage = new CartPage(page);
  await cartPage.verifyAllSelectedItems(randomList);
  await cartPage.checkOut();
  const chkOutPage = new CheckOutPage(page);

  const guestBilling = new BillingDetails(
    "Duong",
    "Luong",
    "Vietnam",
    "253 Hoang Van Thu",
    "Ho Chi Minh City",
    "700000",
    "0999999999",
    "duong.luong333333@gmail.com"!,
    "My Company",
    "No notes"
  );

  await chkOutPage.fillBillingDetails(guestBilling);
  await chkOutPage.verifyAllCheckOutDetails(randomList);
  await chkOutPage.placeOrder();

  //VP. Guests should be purchased the order successfully
  const orderPage = new OrderPage(page);
  await orderPage.verifyOrderMessage(await chkOutPage.getTotalPrice());
  await orderPage.verifyOrderDetail({
    orderedProduct: await chkOutPage.getOrderedProduct(),
    orderedQuantity: await chkOutPage.getOrderedQuantity(),
    orderedPrice: await chkOutPage.getTotalPrice(),
    orderNote: guestBilling.getOrderNote(),
  });
  await orderPage.verifyOrderSubTotalAndTotalPrice(randomList);
});
