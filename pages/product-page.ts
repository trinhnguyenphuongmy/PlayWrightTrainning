import { Page, expect } from "@playwright/test";
import * as assistant from "../utils/common";

export class ProductPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // High-level Actions
  async switchToListView(): Promise<void> {
    await this.page.locator(".switch-list").click();
  }

  async switchToGridView(): Promise<void> {
    await this.page.locator(".switch-grid").click();
  }

  async expectProductGridVisible(): Promise<void> {
    const productGrid = this.page.locator(".products-grid");
    await expect(productGrid).toBeVisible();
  }

  async expectProductListVisible(): Promise<void> {
    const productList = this.page.locator(".products-list");
    await expect(productList).toBeVisible();
  }

  async addProductToCartByIndex(index: number): Promise<void> {
    const products = this.page.locator(".products-list .product");
    const count = await products.count();
    if (index < 0 || index >= count) {
      throw new Error("Index out of bounds");
    }
    const product = products.nth(index);
    await product
      .getByRole("link", { name: "Add to cart" })
      .click({ force: true });
  }

  async addRandomProductToCart(): Promise<{
    name: string | null;
    price: string | null;
    quantity: number;
  }> {
    const products = this.page.locator(".products-list .product");
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

    const itemQuantity = 1;

    await assistant.thinking(this.page, 6);

    await randomProduct.waitFor({ state: "visible", timeout: 6000 });

    // Click 'Add to cart'
    await randomProduct
      .getByRole("link")
      .filter({ hasText: "Add to cart" })
      .nth(1)
      .click({ force: true });

    await assistant.thinking(this.page, 5);

    // Verify the cart quantity is updated
    await expect(this.page.locator(".et-cart-quantity").first()).toHaveText(
      itemQuantity.toString()
    );

    // Return the details of the added product
    return {
      name: pickedName?.trim() ?? null,
      price: pickedPrice?.trim() ?? null,
      quantity: itemQuantity,
    };
  }
}
