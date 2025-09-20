//TC-03: Verify users can buy an item using different payment methods (all payment methods)
import { test } from "@playwright/test";
import {
  HomePage,
  LoginPage,
  ProductPage,
  CheckOutPage,
  OrderPage,
} from "../pages";
import { Account, Product } from "../models";
import * as assistant from "../utils";
import dotenv from "dotenv";

test("Verify users can buy an item using different payment methods (all payment methods)", async ({
  page,
}) => {
  //Precondition: Register a valid account

  // 1. Open browser and go to https://demo.testarchitect.com/
  const homePage = new HomePage(page);
  await homePage.goto();

  // 2. Login with valid credentials
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  dotenv.config();
  const email = process.env.TEST_EMAIL!;
  const password = process.env.TEST_PASSWORD!;
  let authenAcc = new Account(email, password);
  await loginPage.login(authenAcc);
  await assistant.cleanUpCart(page);

  const paymentMethod = [
    "Direct bank transfer",
    "Check payments",
    "Cash on delivery",
  ];

  for (const method of paymentMethod) {
    // 3. Go to Shop page
    await assistant.selectPage(page, "Shop");

    // 4. Select an item and add to cart
    const productPage = new ProductPage(page);
    const {
      name: pickedName,
      price: pickedPrice,
      quantity: pickedQuantity,
    } = await productPage.addRandomProductToCart();

    // 5. Go to Checkout page
    const chkOutPage = new CheckOutPage(page);
    await chkOutPage.goto();

    // 6. Choose a different payment method (Direct bank transfer, Check payments, Cash on delivery)

    await chkOutPage.selectPaymentMethod(method);

    // 7. Complete the payment process
    let pickedProduct = new Product(pickedName!, pickedPrice!, pickedQuantity);
    let addedProduct: Product[] = [];
    await addedProduct.push(pickedProduct);
    await chkOutPage.verifyAllOrderDetails(addedProduct);
    await chkOutPage.placeOrder();

    // 8. Verify order confirmation message
    const orderPage = new OrderPage(page);

    //VP: Payment is processed successfully for each available method
    await orderPage.verifyOrderMessage(
      authenAcc.getEmail(),
      await chkOutPage.getTotalPrice(),
      method
    );

    //Additional VP: All selected items are purchased
    await assistant.verifyCartQuantity(page, 0);
  }
});
