import { Page, expect } from "@playwright/test";
import { BillingDetails } from "../models/billing-detail";

export class OrderPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // High-level Actions
  async verifyOrderDetail(
    billingDetail: BillingDetails,
    totalPrice: string,
    pickedPaymentMethod: string
  ): Promise<void> {
    await expect(this.page.locator("body")).toContainText(
      "Thank you. Your order has been received."
    );

    await expect(this.page.locator("li.order")).toHaveText(
      /Order number:\s*\d+/i
    );

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await expect(this.page.locator("body")).toContainText(
      `Date: ${formattedDate}`
    );
    await expect(this.page.locator("body")).toContainText(
      `Email: ${billingDetail.getEmail()}`
    );
    await expect(this.page.locator("body")).toContainText(
      "Total: $" + totalPrice
    );
    const paymentRow = this.page.locator(
      '//tr[th[contains(text(), "Payment method:")]]'
    );
    const paymentMethodText = await paymentRow.locator("td").textContent();

    expect(paymentMethodText?.trim()).toBe(pickedPaymentMethod?.trim());
  }

  async verifyOrderMessage(
    billingDetail: BillingDetails,
    totalPrice: string,
    pickedPaymentMethod: string
  ): Promise<void> {
    await expect(this.page.locator("body")).toContainText(
      "Thank you. Your order has been received."
    );

    await expect(this.page.locator("li.order")).toHaveText(
      /Order number:\s*\d+/i
    );

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await expect(this.page.locator("body")).toContainText(
      `Date: ${formattedDate}`
    );
    await expect(this.page.locator("body")).toContainText(
      `Email: ${billingDetail.getEmail()}`
    );
    await expect(this.page.locator("body")).toContainText(
      "Total: $" + totalPrice
    );
    const paymentRow = this.page.locator(
      '//tr[th[contains(text(), "Payment method:")]]'
    );
    const paymentMethodText = await paymentRow.locator("td").textContent();

    expect(paymentMethodText?.trim()).toBe(pickedPaymentMethod?.trim());
  }

  async verifyOrderDetails(
    billingDetail: BillingDetails,
    orderedProduct: string,
    orderedQuantity: string,
    orderedPrice: string,
    pickedPaymentMethod: string
  ): Promise<void> {
    const row = this.page
      .locator("h2", { hasText: "Other Details" })
      .locator("xpath=following-sibling::table//tr");

    const productNameCell = this.page.locator("td.product-name");

    const actualProductName = await productNameCell.locator("a").textContent();
    expect(actualProductName?.trim()).toBe(orderedProduct);

    // Find the product name cell containing the text
    const productCell = this.page.locator(".product-name", {
      hasText: orderedProduct,
    });

    const actualQuantityText = await productCell
      .locator(".product-quantity")
      .textContent();
    const quantityMatch = actualQuantityText?.match(/×\s*(\d+)/);
    expect(quantityMatch?.[1]).toBe(orderedQuantity.toString());
  }

  async verifyBillingDetails(billingDetail: BillingDetails): Promise<void> {
    const addressLocator = this.page.locator(
      "section.woocommerce-customer-details > address"
    );
    await expect(addressLocator).toContainText(billingDetail.getFirstName());
    await expect(addressLocator).toContainText(
      billingDetail.getStreetAddress()
    );
    await expect(addressLocator).toContainText(billingDetail.getCity());
    await expect(addressLocator).toContainText(billingDetail.getCountry());

    await expect(
      this.page.locator("woocommerce-customer-details--phone")
    ).toHaveText(billingDetail.getPhoneNumber());

    await expect(
      this.page.locator("woocommerce-customer-details--email")
    ).toHaveText(billingDetail.getEmail());
  }
}
