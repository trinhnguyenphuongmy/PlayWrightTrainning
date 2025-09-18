import { Page, expect } from "@playwright/test";
import { BillingDetails } from "../models/billing-detail";

export class CheckOutPage {
  private page: Page;
  private orderedProduct: string;
  private orderedQuantity: number;
  private totalPrice: string;

  constructor(page: Page) {
    this.page = page;
    this.orderedProduct = "";
    this.orderedQuantity = 0;
    this.totalPrice = "";
  }

  // High-level Actions
  async getOrderedProduct(): Promise<string> {
    return this.orderedProduct;
  }

  async getOrderedQuantity(): Promise<number> {
    return this.orderedQuantity;
  }

  async getTotalPrice(): Promise<string> {
    return this.totalPrice;
  }

  async verifyOrderDetails(
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
    let itemTotalPrice = (
      parseFloat(itemPrice.replace(/[^0-9.]/g, "")) * itemQuantity
    ).toFixed(2);
    // Create a regex to match the price format, allowing for optional .00
    // Example: $49.99 or $49.00
    // The ^ and $ ensure the entire string matches, and \s* allows for optional whitespace
    const regex = new RegExp(`^\\s*\\$${itemTotalPrice}(\\.00)?\\s*$`);
    await expect(productTotalCell).toHaveText(regex);

    await expect(this.page.locator(".cart-subtotal").locator("td")).toHaveText(
      regex
    );

    await expect(this.page.locator(".order-total").locator("td")).toHaveText(
      regex
    );
    this.orderedProduct = itemName;
    this.orderedQuantity = itemQuantity;
    this.totalPrice = itemTotalPrice;
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
  }
}
