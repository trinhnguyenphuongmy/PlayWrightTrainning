import { Page, expect } from "@playwright/test";
import { BillingDetails } from "../models";
import * as assistant from "../utils/common";

export class OrderPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async getOrderNumber(): Promise<string | null> {
    return await this.page
      .locator(".woocommerce-order-overview__order strong")
      .textContent();
  }

  async getOrderTotalPrice(): Promise<string | null> {
    return await this.page
      .locator(".woocommerce-order-overview__total strong")
      .textContent();
  }

  async getOrderDate(): Promise<string | null> {
    return await this.page
      .locator(".woocommerce-order-overview__date strong")
      .textContent();
    //September 20, 2025
  }

  // High-level Actions
  async verifyOrderDetails(
    billingDetail: BillingDetails,
    productName: string,
    productQuantity: number,
    totalPrice: number,
    pickedPaymentMethod: string
  ): Promise<void> {
    await this.verifyOrderMessage(
      billingDetail.getEmail(),
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
    orderEmail: string,
    totalPrice: number,
    pickedPaymentMethod: string
  ): Promise<void> {
    await assistant.thinking(this.page, 6);

    const pageBody = await this.page.locator("body");

    await pageBody.waitFor({ state: "visible", timeout: 6000 });

    await expect(this.page.locator(".woocommerce-notice")).toContainText(
      "Thank you. Your order has been received."
    );

    await expect(this.page.locator("li.order")).toHaveText(
      /Order number:\s*\d+/i
    );

    const today = new Date();
    const formattedDate = await today.toLocaleDateString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await expect(
      this.page.locator(".woocommerce-order-overview__date")
    ).toContainText(`Date: ${formattedDate}`);

    await expect(
      this.page.locator(".woocommerce-order-overview__email")
    ).toContainText(`Email: ${orderEmail}`);

    await expect(
      this.page.locator(
        ".woocommerce-thankyou-order-details .woocommerce-order-overview__total"
      )
    ).toContainText("Total: " + (await assistant.formatPrice(totalPrice)));
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
    orderedPrice: number,
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
