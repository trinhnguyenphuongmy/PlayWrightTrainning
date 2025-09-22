import { Page, expect } from "@playwright/test";
import { BillingDetails } from "../models/billing-detail";
import { Product } from "../models/product";
import * as assistant from "../utils/common";

export class CheckOutPage {
  private page: Page;
  private orderedProduct: string;
  private orderedQuantity: number;
  private totalPrice: number;

  constructor(page: Page) {
    this.page = page;
    this.orderedProduct = "";
    this.orderedQuantity = 0;
    this.totalPrice = 0;
  }

  // High-level Actions
  async goto(): Promise<void> {
    await this.page.goto("/checkout");
  }

  async getOrderedProduct(): Promise<string> {
    return this.orderedProduct;
  }

  async getOrderedQuantity(): Promise<number> {
    return this.orderedQuantity;
  }

  async getTotalPrice(): Promise<number> {
    return this.totalPrice;
  }

  async verifyCheckOutDetails(
    itemName: string,
    itemPrice: string,
    itemQuantity: number
  ): Promise<void> {
    let itemDetail = itemName + " × " + itemQuantity;

    // Find the product name cell containing the text
    const productCell = this.page.locator(".product-name", {
      hasText: itemDetail,
    });

    // Verify the product name with quantity is visible in the order details
    await expect(productCell).toBeVisible();

    // From that cell, find its sibling 'td.product-total'
    const productTotalCell = productCell.locator(
      'xpath=following-sibling::td[contains(@class, "product-total")]'
    );

    // Verify the product total price matches the expected price
    let itemTotalPrice =
      parseFloat(itemPrice.replace(/[^0-9.]/g, "")) * itemQuantity;

    // Create a regex to match the price format, allowing for optional .00
    // Example: $49.99 or $49.00
    // The ^ and $ ensure the entire string matches, and \s* allows for optional whitespace
    let expectedItemPrice = assistant.formatPrice(itemTotalPrice);
    await expect(productTotalCell).toContainText(expectedItemPrice);

    this.orderedProduct = itemName;
    this.orderedQuantity = itemQuantity;
  }

  async verifyCheckOutSubTotalAndTotalPrice(
    orderList: Product[]
  ): Promise<void> {
    let subTotal = 0;
    for (const order of orderList) {
      let moneyAmount = parseFloat(order.getPrice().replace(/[^0-9.]/g, ""));
      subTotal += moneyAmount;
    }

    this.totalPrice = subTotal;
    let expectedPrice = assistant.formatPrice(subTotal);

    await expect(
      this.page.locator(".cart-subtotal").locator("td")
    ).toContainText(expectedPrice);

    await expect(this.page.locator(".order-total").locator("td")).toContainText(
      expectedPrice
    );
  }

  async verifyAllCheckOutDetails(orderList: Product[]): Promise<void> {
    await assistant.waitForPageLoadedCompletely(this.page);
    for (const order of orderList) {
      await this.verifyCheckOutDetails(
        order.getName(),
        order.getPrice(),
        order.getQuantity()
      );
    }
    await this.verifyCheckOutSubTotalAndTotalPrice(orderList);
  }

  async getDefaultPaymentMethod(): Promise<string> {
    const defaultMethod = await this.page
      .locator('input[type="radio"]:checked')
      .locator("xpath=following-sibling::label")
      .textContent();
    if (!defaultMethod) {
      throw new Error("No payment method is selected by default.");
    }
    return defaultMethod;
  }

  async selectPaymentMethod(targetPayment: string): Promise<void> {
    const paymentBtn = this.page.getByRole("radio", {
      name: targetPayment,
    });
    await paymentBtn.click();
    await expect(paymentBtn).toBeChecked();
  }

  async fillBillingDetails(billingDetail: BillingDetails): Promise<void> {
    await this.page
      .getByRole("textbox", { name: "First name *" })
      .fill(billingDetail.getFirstName());
    await this.page
      .getByRole("textbox", { name: "Last name *" })
      .fill(billingDetail.getLastName());
    if (billingDetail.getCompanyName()) {
      await this.page
        .getByRole("textbox", { name: "Company name (optional)" })
        .fill(billingDetail.getCompanyName()!);
    }
    await this.page.getByRole("combobox", { name: "Country / Region" }).click();
    await this.page
      .getByRole("option", { name: billingDetail.getCountry() })
      .click();
    await this.page
      .getByRole("textbox", { name: "Street address" })
      .fill(billingDetail.getStreetAddress());
    await this.page
      .getByRole("textbox", { name: "Postcode / ZIP" })
      .fill(billingDetail.getZipCode());
    await this.page
      .getByRole("textbox", { name: "Town / City" })
      .fill(billingDetail.getCity());
    await this.page
      .getByRole("textbox", { name: "Phone" })
      .fill(billingDetail.getPhoneNumber());
    await this.page
      .getByRole("textbox", { name: "Email address" })
      .fill(billingDetail.getEmail());
    if (billingDetail.getOrderNote()) {
      await this.page
        .getByRole("textbox", { name: "Order notes (optional)" })
        .fill(billingDetail.getOrderNote()!);
    }
  }

  async placeOrder(): Promise<void> {
    await this.page.getByRole("button", { name: "Place order" }).click();
    await assistant.verifyPageUrl(this.page, /.*order-received.*/);
  }

  async verifyErrorMessageWhenMissingAllMandantoryFields(): Promise<void> {
    const expErrMess = `Billing First name is a required field.
    
                        Billing Last name is a required field.
    
                        Billing Street address is a required field.
    
                        Billing Town / City is a required field.
    
                        Billing ZIP Code is a required field.
    
                        Billing Phone is a required field.
    
                        Billing Email address is a required field.`;
    await expect(this.page.getByRole("alert")).toHaveText(expErrMess);
  }

  async checkMandatoryFieldHighlighting(targetField: string): Promise<void> {
    const fieldName = this.page.getByLabel(targetField);

    // Get computed styles (e.g., border color)
    const fieldBorder = await fieldName.evaluate((el) => {
      return window.getComputedStyle(el).borderColor;
    });
    //Assert that the borders are red (you can adjust the exact color value as needed)
    expect(fieldBorder).toBe("rgb(198, 40, 40)"); // red
  }

  async checkAllMandatoryFieldsHighlighting(): Promise<void> {
    const allMandFields = [
      "First name",
      "Last name",
      "Street address",
      "Town / City",
      "ZIP Code",
      "Phone",
      "Email address",
    ];
    for (const mandField of allMandFields) {
      await this.checkMandatoryFieldHighlighting(mandField);
    }
  }
}
