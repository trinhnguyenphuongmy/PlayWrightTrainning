import { Page, expect } from "@playwright/test";
import { Product } from "../models/product";
import * as assistant from "../utils/common";

export class CartPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // High-level Actions
  async clickButton(buttonName: string): Promise<void> {
    await this.page.getByRole("link", { name: buttonName }).click();
  }

  async checkOut(): Promise<void> {
    await this.clickButton("2 Checkout");
  }

  async verifyProductDetails(
    itemName: String,
    itemPrice: String,
    itemQuantity: number
  ): Promise<void> {
    const trimmedName = itemName?.trim() ?? "";

    // Filter .cart-item elements that contain the product name (case-insensitive)
    const newItem = this.page
      .locator('[class*="cart-item"]')
      .filter({ hasText: trimmedName });

    await newItem.first().waitFor({ state: "visible", timeout: 6000 });

    // Optionally check if at least one item is found
    const itemCount = await newItem.count();
    if (itemCount === 0) {
      throw new Error(`The item '${trimmedName}' was not found in the cart.`);
    }

    // Assert the product details contain the expected name
    await expect(newItem.locator(".product-details")).toContainText(
      trimmedName
    );

    await assistant.thinking(this.page, 5);

    // Assert the product price and quantity contain the expected values
    await expect(newItem.locator(".product-price")).toContainText(
      `${itemPrice}`
    );
    await expect(
      newItem.locator(".product-quantity").getByRole("spinbutton")
    ).toHaveValue("" + itemQuantity);

    const cleanedPrice = itemPrice.replace(/[^0-9.]/g, ""); // Remove $ or currency symbols
    let unitPrice: number = parseFloat(cleanedPrice); // Convert to number
    let subTotal: number = unitPrice * itemQuantity;

    // Assert the product subtotal contains the expected subtotal
    await expect(newItem.locator(".product-subtotal")).toContainText(
      `$${subTotal.toFixed(2)}`
    );
  }

  async verifyAllSelectedItems(selectedList: Product[]): Promise<void> {
    for (const product of selectedList) {
      await this.verifyProductDetails(
        product.getName(),
        product.getPrice(),
        product.getQuantity()
      );
    }
  }
}
