//TC-01: Verify users can buy an item successfully
import { test, expect } from "@playwright/test";
import { Account } from "./account";
import { create } from "domain";
import { BillingDetails } from "./billing-detail";
import * as assistant from "./common";

test("test", async ({ page }) => {
  //Precondition: Register a valid account
  //1.Open browser and go to https://demo.testarchitect.com/
  await page.goto("https://demo.testarchitect.com/");

  // Additional steps to close the popup
  await page.getByRole("button", { name: "Close" }).click();

  // Additional steps to register a new account
  await page.getByRole("link", { name: "Log in / Sign up" }).click();

  let firstAccount: Account;
  try {
    firstAccount = await Account.createRandomAccount();
  } catch (error) {
    throw new Error("Error creating account:" + error);
  }
  await page
    .getByRole("textbox", { name: "Email address *", exact: true })
    .fill(firstAccount.getEmail());
  await page.getByRole("button", { name: "Register" }).click();

  // await page
  //   .getByRole("textbox", { name: "Username or email address *" })
  //   .click();
  // await page
  //   .getByRole("textbox", { name: "Username or email address *" })
  //   .fill("mymy.playwright@gmail.com");
  // await page.getByRole("textbox", { name: "Password *" }).click();

  //3. Navigate to All departments section
  //4. Select Electronic Components & Supplies
  await page.waitForLoadState("domcontentloaded");
  const menu = await page.locator('[class*="-menu-toggle"]');
  await menu.waitFor({ state: "visible", timeout: 6000 });
  await menu.click();

  const targetLink = await page
    .locator(".item-link", {
      hasText: "Electronic Components & Supplies",
    })
    .first();
  await targetLink.waitFor({ state: "visible", timeout: 6000 });
  await targetLink.click({ force: true });

  //5. Verify the items should be displayed as a grid
  expect(await page.locator(".products-grid")).toBeVisible();

  //6. Switch view to list
  await page.locator(".switch-list").click();

  //7. Verify the items should be displayed as a list
  expect(await page.locator(".products-list")).toBeVisible();

  //8. Select any item randomly to purchase
  const products = page.locator(".products-list .product");
  const count = await products.count();

  if (count === 0) {
    throw new Error("No products found!");
  }

  // Pick random index
  const randomIndex = Math.floor(Math.random() * count);

  // Get the random product
  const randomProduct = products.nth(randomIndex);

  // Extract name and price
  const pickedName = await randomProduct
    .locator(".product-title")
    .textContent();
  const pickedPrice = await randomProduct.locator(".price").textContent();
  await assistant.thinking(page, 5);

  //9. Click 'Add to Cart'
  let itemQuantity = 1;
  await randomProduct
    .getByRole("link")
    .filter({ hasText: "Add to cart" })
    .nth(1)
    .click({ force: true });

  const cartText = await page
    .locator('a[href="https://demo.testarchitect.com/cart/"]')
    .first()
    .innerText();

  // Verify the cart quantity is updated
  await expect(
    page.locator('a[href="https://demo.testarchitect.com/cart/"]').first()
  ).toContainText(itemQuantity.toString());

  //10. Go to the cart
  await page
    .locator('a[href="https://demo.testarchitect.com/cart/"]')
    .first()
    .click();

  //11. Verify item details in mini content
  const trimmedName = pickedName?.trim() ?? "";

  // Filter .cart-item elements that contain the product name (case-insensitive)
  const newItem = page
    .locator('[class*="cart-item"]')
    .filter({ hasText: trimmedName });

  await newItem.first().waitFor({ state: "visible", timeout: 6000 });

  // Optionally check if at least one item is found
  const itemCount = await newItem.count();
  if (itemCount === 0) {
    throw new Error(`The item '${trimmedName}' was not found in the cart.`);
  }

  // Assert the product details contain the expected name
  await expect(newItem.locator(".product-details")).toContainText(trimmedName);
  assistant.thinking(page, 2);
  await expect(newItem.locator(".product-price")).toContainText(
    `${pickedPrice}`
  );
  await expect(
    newItem.locator(".product-quantity").getByRole("spinbutton")
  ).toHaveValue("" + itemQuantity);

  let itemDetail = trimmedName + " × " + itemQuantity;
  const cleanedPrice = pickedPrice!.replace(/[^0-9.]/g, ""); // Remove $ or currency symbols
  let unitPrice: number = parseFloat(cleanedPrice); // Convert to number
  let itemPrice: number = unitPrice * itemQuantity;

  // Assert the product subtotal contains the expected price
  await expect(newItem.locator(".product-subtotal")).toContainText(
    `$${itemPrice}`
  );

  //12. Click on Checkout
  await page.getByRole("link", { name: "2 Checkout" }).click();

  //13. Verify Checkbout page displays
  await expect(page).toHaveURL("https://demo.testarchitect.com/checkout/");

  //14. Verify item details in order

  await expect(
    page.locator(".product-name").filter({ hasText: itemDetail })
  ).toBeVisible();

  // Find the product name cell containing the text
  const productCell = page.locator(".product-name", {
    hasText: itemDetail,
  });

  await expect(productCell).toBeVisible();

  // From that cell, find its sibling 'td.product-total'
  const productTotalCell = productCell.locator(
    'xpath=following-sibling::td[contains(@class, "product-total")]'
  );

  const regex = new RegExp(`^\\s*\\$${itemPrice}(\\.00)?\\s*$`);
  await expect(productTotalCell).toHaveText(regex);

  await expect(page.locator(".cart-subtotal").locator("td")).toHaveText(regex);

  await expect(page.locator(".order-total").locator("td")).toHaveText(regex);

  //15. Fill the billing details with default payment method
  let billingDetail = new BillingDetails(
    "My",
    "Trinh",
    "Vietnam",
    "253 Hoang Van Thu",
    "Ho Chi Minh City",
    "700000",
    "0909090909",
    firstAccount.getEmail(),
    "My Company",
    "No notes"
  );

  await page
    .getByRole("textbox", { name: "First name *" })
    .fill(billingDetail.getFirstName());
  await page
    .getByRole("textbox", { name: "Last name *" })
    .fill(billingDetail.getLastName());
  if (billingDetail.getCompanyName()) {
    await page
      .getByRole("textbox", { name: "Company name (optional)" })
      .fill(billingDetail.getCompanyName()!);
  }

  await page.getByRole("combobox", { name: "Country / Region" }).click();

  await page.getByRole("option", { name: billingDetail.getCountry() }).click();

  await page
    .getByRole("textbox", { name: "Street address" })
    .fill(billingDetail.getStreetAddress());
  await page
    .getByRole("textbox", { name: "Postcode / ZIP" })
    .fill(billingDetail.getZipCode());
  await page
    .getByRole("textbox", { name: "Town / City" })
    .fill(billingDetail.getCity());
  await page
    .getByRole("textbox", { name: "Phone" })
    .fill(billingDetail.getPhoneNumber());
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill(billingDetail.getEmail());
  if (billingDetail.getOrderNote()) {
    await page
      .getByRole("textbox", { name: "Order notes (optional)" })
      .fill(billingDetail.getOrderNote()!);
  }

  const defaultMethod = await page
    .locator('input[type="radio"]:checked')
    .locator("xpath=following-sibling::label")
    .textContent();

  //16. Click on PLACE ORDER
  await page.getByRole("button", { name: "Place order" }).click();

  //17. Verify Order status page displays
  await assistant.thinking(page, 5);
  await expect(page).toHaveURL(/.*order-received.*/);

  //18. Verify the Order details with billing and item information
  await expect(page.locator("body")).toContainText(
    "Thank you. Your order has been received."
  );

  await expect(page.locator("li.order")).toHaveText(/Order number:\s*\d+/i);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  await expect(page.locator("body")).toContainText(`Date: ${formattedDate}`);
  await expect(page.locator("body")).toContainText(
    `Email: ${billingDetail.getEmail()}`
  );
  await expect(page.locator("body")).toContainText("Total: $" + itemPrice);
  const paymentRow = page.locator(
    '//tr[th[contains(text(), "Payment method:")]]'
  );
  const paymentMethodText = await paymentRow.locator("td").textContent();

  expect(paymentMethodText?.trim()).toBe(defaultMethod?.trim());

  const row = page
    .locator("h2", { hasText: "Other Details" })
    .locator("xpath=following-sibling::table//tr");

  const productNameCell = page.locator("td.product-name");

  const actualProductName = await productNameCell.locator("a").textContent();
  expect(actualProductName?.trim()).toBe(trimmedName);

  const actualQuantityText = await productCell
    .locator(".product-quantity")
    .textContent();
  const quantityMatch = actualQuantityText?.match(/×\s*(\d+)/);
  expect(quantityMatch?.[1]).toBe(itemQuantity.toString());
});
