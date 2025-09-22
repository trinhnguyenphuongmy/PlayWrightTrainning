import { Page, expect } from "@playwright/test";
import { BillingDetails, Product } from "../models";
import * as assistant from "../utils/common";
import { OrderDetailParams } from "../types/type";

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
  async verifyAllOrderDetails(
    billingDetail: BillingDetails,
    productName: string,
    productQuantity: number,
    totalPrice: number,
    pickedPaymentMethod: string
  ): Promise<void> {
    await this.verifyOrderMessage(
      totalPrice,
      billingDetail.getEmail(),
      pickedPaymentMethod
    );
    await this.verifyOrderDetail({
      orderedProduct: productName,
      orderedQuantity: productQuantity,
      orderedPrice: totalPrice,
      orderedPaymentMethod: pickedPaymentMethod,
      orderNote: billingDetail.getOrderNote(),
    });
    await this.verifyBillingDetail(billingDetail);
  }

  async verifyOrderMessage(
    totalPrice: number,
    orderEmail?: string,
    pickedPaymentMethod?: string
  ): Promise<void> {
    await assistant.thinking(this.page, 6);

    const pageBody = this.page.locator("body");

    await pageBody.waitFor({ state: "visible", timeout: 6000 });

    await expect(this.page.locator(".woocommerce-notice")).toContainText(
      "Thank you. Your order has been received."
    );

    await expect(this.page.locator("li.order")).toHaveText(
      /Order number:\s*\d+/i
    );

    const today = new Date();
    const formattedDate = today.toLocaleDateString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    await expect(
      this.page.locator(".woocommerce-order-overview__date")
    ).toContainText(`Date: ${formattedDate}`);

    if (orderEmail) {
      await expect(
        this.page.locator(".woocommerce-order-overview__email")
      ).toContainText(`Email: ${orderEmail}`);
    }
    await expect(
      this.page.locator(
        ".woocommerce-thankyou-order-details .woocommerce-order-overview__total"
      )
    ).toContainText("Total: " + assistant.formatPrice(totalPrice));

    if (pickedPaymentMethod) {
      await expect(
        await this.page
          .locator('//tr[th[contains(text(), "Payment method:")]]')
          .locator("td")
      ).toContainText(pickedPaymentMethod);
    }
  }

  async verifyOrderDetail({
    orderedProduct,
    orderedQuantity,
    orderedPrice,
    orderedPaymentMethod,
    orderNote,
  }: OrderDetailParams): Promise<void> {
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

    let totalPrice = assistant.formatPrice(orderedPrice * orderedQuantity);
    await expect(
      productCell.locator("xpath=following-sibling::td")
    ).toContainText(totalPrice);

    if (orderedPaymentMethod) {
      await expect(
        this.page.locator('tr:has(th:text("Payment method:")) td')
      ).toContainText(orderedPaymentMethod);
    }

    await expect(
      this.page.locator('tr:has(th:text("Note:")) td')
    ).toContainText(orderNote!);
  }

  async verifyOrderSubTotalAndTotalPrice(orderList: Product[]): Promise<void> {
    let subTotal = 0;
    for (const order of orderList) {
      let moneyAmount = parseFloat(order.getPrice().replace(/[^0-9.]/g, ""));
      subTotal += moneyAmount;
    }

    let expectedPrice = assistant.formatPrice(subTotal);

    await expect(
      this.page
        .locator('tr:has(th:text("Subtotal:")) span[class*="Price-amount"]')
        .first()
    ).toContainText(expectedPrice);

    await expect(
      this.page
        .locator('tr:has(th:text("Total:")) span[class*="Price-amount"]')
        .first()
    ).toContainText(expectedPrice);
  }

  async verifyBillingDetail(billingDetail: BillingDetails): Promise<void> {
    const addressLocator = this.page.locator(
      "section.woocommerce-customer-details > address"
    );
    await expect(addressLocator).toContainText(
      billingDetail.getFirstName() + " " + billingDetail.getLastName()
    );
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
