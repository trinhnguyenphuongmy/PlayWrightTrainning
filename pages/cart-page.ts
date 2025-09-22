import { Locator, Page, expect } from "@playwright/test";
import { Product } from "../models/product";
import * as assistant from "../utils/common";

export class CartPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // High-level Actions
  async checkOut(): Promise<void> {
    await this.page.getByRole("link", { name: "PROCEED TO CHECKOUT" }).click();
    await assistant.verifyNavigationByCheckPageTitle(this.page, "Checkout");
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

    let expectedPrice = await assistant.formatPrice(subTotal);

    // Assert the product subtotal contains the expected subtotal
    await expect(newItem.locator(".product-subtotal")).toContainText(
      expectedPrice
    );
  }

  async verifyAllSelectedItems(selectedList: Product[]): Promise<void> {
    const mergedMap: Map<string, { price: string; quantity: number }> =
      new Map();

    for (const product of selectedList) {
      const name = product.getName();
      const price = product.getPrice();
      const quantity = product.getQuantity();

      if (mergedMap.has(name)) {
        const existing = mergedMap.get(name)!;
        existing.quantity += quantity;
      } else {
        mergedMap.set(name, { price, quantity });
      }
    }

    for (const [name, { price, quantity }] of mergedMap) {
      await this.verifyProductDetails(name, price, quantity);
    }
  }

  async clearCart(): Promise<void> {
    // Loop until no more "Remove" links are found
    this.page.on("dialog", async (dialog) => {
      console.log("Dialog detected. Accepting...");
      await dialog.accept();
    });

    await this.page.locator(".clear-cart").click();

    // Wait for item to be removed (more robust than static timeout)
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForSelector("text=YOUR SHOPPING CART IS EMPTY", {
      timeout: 6000,
    });
  }

  async verifyQuantityOfProductInCart(
    productName: string,
    itemNumber: number
  ): Promise<void> {
    await expect(await this.getQuantityLocator(productName)).toHaveValue(
      itemNumber.toString()
    );
  }

  async getItemPrice(productName: string): Promise<string> {
    return (await this.getProductLocator(productName))
      .locator(".product-price")
      .innerText();
  }
  async getQuantityLocator(productName: string): Promise<Locator> {
    return (await this.getProductLocator(productName)).locator(
      ".product-quantity input"
    );
  }

  async getProductQuantity(productName: string): Promise<string> {
    return (await this.getQuantityLocator(productName)).inputValue();
  }
  async getProductLocator(productName: string): Promise<Locator> {
    return this.page.locator("tr").filter({
      has: this.page.locator(".product-details", { hasText: productName }),
    });
  }
  async getProductTotalPriceLocator(productName: string): Promise<Locator> {
    return (await this.getProductLocator(productName)).locator(
      ".product-subtotal .amount"
    );
  }

  async clickOnPlusButtonOfTheProductQuantity(
    productName: string
  ): Promise<void> {
    const beforePrice = await this.getSubTotalPrice(productName);
    await (await this.getProductLocator(productName))
      .locator(".et-plus")
      .click();
    await this.waitForProductTotalPriceUpdated(productName, beforePrice);
  }

  async clickOnMinusButtonOfTheProductQuantity(
    productName: string
  ): Promise<void> {
    const beforePrice = await this.getSubTotalPrice(productName);
    await (await this.getProductLocator(productName))
      .locator(".et-minus")
      .click();
    await this.waitForProductTotalPriceUpdated(productName, beforePrice);
  }

  async waitForProductTotalPriceUpdated(
    productName: string,
    oldPrice: string
  ): Promise<void> {
    expect(
      await this.getProductTotalPriceLocator(productName)
    ).not.toContainText(oldPrice);
  }

  async editProductQuantityNumer(
    productName: string,
    inputNumber: number
  ): Promise<void> {
    await (
      await this.getQuantityLocator(productName)
    ).fill(inputNumber.toString());
    await assistant.clickButtonByRole(this.page, "button", "UPDATE CART");
  }

  async getSubTotalPrice(productName: string): Promise<string> {
    return (await this.getProductTotalPriceLocator(productName)).innerText();
  }

  async verifySubTotalPrice(productName: string): Promise<void> {
    const itemPrice = await this.getItemPrice(productName);
    const productQuantity = await this.getProductQuantity(productName);
    let totalPrice =
      parseFloat(itemPrice.replace(/[^0-9.]/g, "")) * parseInt(productQuantity);

    const subTotal = await this.getProductTotalPriceLocator(productName);
    await expect(subTotal).toHaveText(assistant.formatPrice(totalPrice));
  }
}
