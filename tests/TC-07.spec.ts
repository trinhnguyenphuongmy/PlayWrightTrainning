//TC-07: Ensure proper error handling when mandatory fields are blank
import { test } from "@playwright/test";
import { HomePage, ProductPage, CheckOutPage } from "../pages";
import * as assistant from "../utils";

test("Ensure proper error handling when mandatory fields are blank", async ({
  page,
}) => {
  //Precondition: User is at checkout
  // Open browser and go to https://demo.testarchitect.com/
  const homePage = new HomePage(page);
  await homePage.goto();

  //Go to Shop page
  await assistant.selectPage(page, "Shop");

  //Select an item and add to cart
  const productPage = new ProductPage(page);
  await productPage.addRandomProductToCart();

  //Go to Checkout page
  const chkOutPage = new CheckOutPage(page);
  await chkOutPage.goto();

  //1. Leave mandatory fields (address, payment info) blank
  //2. Click 'Confirm Order'
  await assistant.clickButtonByRole(page, "button", "Place Order");

  //3. Verify error messages
  //VP: System should highlight missing fields and show an error message
  await chkOutPage.verifyErrorMessageWhenMissingAllMandantoryFields();
  await chkOutPage.checkAllMandatoryFieldsHighlighting();
});
