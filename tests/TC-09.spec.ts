//TC-09: Verify users can update quantity of product in cart
import { test } from "@playwright/test";
import { HomePage, LoginPage, ProductPage, CartPage } from "../pages";
import * as assistant from "../utils";

test("Verify users can update quantity of product in cart", async ({
  page,
}) => {
  // 1. Open browser and go to https://demo.testarchitect.com/
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

  //4. Add a product
  const productPage = new ProductPage(page);
  const {
    name: pickedName,
    price: pickedPrice,
    quantity: pickedQuantity,
  } = await productPage.addRandomProductToCart();

  //5. Go to the cart
  await assistant.clickCartIcon(page);

  //6. Verify quantity of added product
  const cartPage = new CartPage(page);
  await cartPage.verifyQuantityOfProductInCart(pickedName!, pickedQuantity);

  //7. Click on Plus(+) button
  await cartPage.clickOnPlusButtonOfTheProductQuantity(pickedName!);

  //8. Verify quantity of product and SUB TOTAL price
  await cartPage.verifyQuantityOfProductInCart(pickedName!, pickedQuantity + 1);
  await cartPage.verifySubTotalPrice(pickedName!);

  //9. Enter 4 into quantity textbox then click on UPDATE CART button
  await cartPage.editProductQuantityNumer(pickedName!, 4);

  //10. Verify quantity of product is 4 and SUB TOTAL price
  await cartPage.verifyQuantityOfProductInCart(pickedName!, 4);
  await cartPage.verifySubTotalPrice(pickedName!);

  //11. Click on Minus(-) button
  await cartPage.clickOnMinusButtonOfTheProductQuantity(pickedName!);

  //12. Verify quantity of product and SUB TOTAL price
  await cartPage.verifyQuantityOfProductInCart(pickedName!, 3);
  await cartPage.verifySubTotalPrice(pickedName!);
});
