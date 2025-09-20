import { Page, expect } from "@playwright/test";
import { Order } from "../models";

export class MyAccountPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // High-level Actions
  async verifyOrderDetail(inputOrder: Order) {
    const orderNumber = inputOrder.getOrderNumber();
    const orderDate = inputOrder.getOrderdate();
    const orderTotal = `${inputOrder.getOrderTotalPrice()} for ${inputOrder.getQuantity()} item`;

    const targetRow = this.page
      .locator(".woocommerce-orders-table__row")
      .filter({ hasText: `#${orderNumber}` });
    if ((await targetRow.count()) === 0) {
      throw new Error(
        `The order with order number #${orderNumber} does not exist in the Recent Orders table.`
      );
    }
    await expect(
      targetRow.locator(".woocommerce-orders-table__cell-order-date")
    ).toContainText(orderDate);
    await expect(
      targetRow.locator(".woocommerce-orders-table__cell-order-total")
    ).toContainText(orderTotal);
  }
}
