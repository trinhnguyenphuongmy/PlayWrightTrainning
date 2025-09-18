import { Page, expect } from "@playwright/test";
import { BillingDetails } from "../models/billing-detail";
import * as assistant from "../utils/common";

export class OrderPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // High-level Actions
  async verifyOrderDetails(
    billingDetail: BillingDetails,
    productName: string,
    productQuantity: number,
    totalPrice: string,
    pickedPaymentMethod: string
  ): Promise<void> {
    await this.verifyOrderMessage(
      billingDetail,
      totalPrice,
      pickedPaymentMethod
    );
    await this.verifyOrderDetail(
      billingDetail,
      productName,
      productQuantity,
      totalPrice,
      pickedPaymentMethod
    );
    await this.verifyBillingDetail(billingDetail);
  }

  async verifyOrderMessage(
    billingDetail: BillingDetails,
    totalPrice: string,
    pickedPaymentMethod: string
  ): Promise<void> {
    await assistant.thinking(this.page, 6);

    const pageBody = await this.page.locator("body");

    await pageBody.waitFor({ state: "visible", timeout: 6000 });

    await expect(this.page.locator("body")).toContainText(
      "Thank you. Your order has been received."
    );

    await expect(this.page.locator("li.order")).toHaveText(
      /Order number:\s*\d+/i
    );

    const today = new Date();
    const formattedDate = await today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    /*await expect(this.page.locator("body")).toContainText(
      `Date: ${formattedDate}`
    );*/
    await expect(this.page.locator("body")).toContainText(
      `Email: ${billingDetail.getEmail()}`
    );
    await expect(this.page.locator("body")).toContainText(
      "Total: $" + totalPrice
    );
    const paymentRow = await this.page.locator(
      '//tr[th[contains(text(), "Payment method:")]]'
    );
    const paymentMethodText = await paymentRow.locator("td").textContent();

    await expect(paymentMethodText?.trim()).toBe(pickedPaymentMethod?.trim());
  }

  async verifyOrderDetail(
    billingDetail: BillingDetails,
    orderedProduct: string,
    orderedQuantity: number,
    orderedPrice: string,
    pickedPaymentMethod: string
  ): Promise<void> {
    const row = await this.page
      .locator("h2", { hasText: "Other Details" })
      .locator("xpath=following-sibling::table//tr");

    const productNameCell = await this.page.locator("td.product-name");

    const actualProductName = await productNameCell.locator("a").textContent();
    await expect(actualProductName?.trim()).toBe(orderedProduct);

    // Find the product name cell containing the text
    const productCell = await this.page.locator(".product-name", {
      hasText: orderedProduct,
    });

    const actualQuantityText = await productCell
      .locator(".product-quantity")
      .textContent();
    const quantityMatch = actualQuantityText?.match(/×\s*(\d+)/);
    await expect(quantityMatch?.[1]).toBe(orderedQuantity.toString());
  }

  async verifyBillingDetail(billingDetail: BillingDetails): Promise<void> {
    const addressLocator = await this.page.locator(
      "section.woocommerce-customer-details > address"
    );
    await expect(addressLocator).toContainText(billingDetail.getFirstName());
    await expect(addressLocator).toContainText(
      billingDetail.getStreetAddress()
    );
    await expect(addressLocator).toContainText(billingDetail.getCity());
    await expect(addressLocator).toContainText(billingDetail.getCountry());

    await expect(
      this.page.locator(".woocommerce-customer-details--phone")
    ).toHaveText(billingDetail.getPhoneNumber());

    await expect(
      this.page.locator(".woocommerce-customer-details--email")
    ).toHaveText(billingDetail.getEmail());
  }
}
