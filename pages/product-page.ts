import { Page, expect } from "@playwright/test";
import { Product } from "../models/product";
import * as assistant from "../utils/common";

export class ProductPage {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // High-level Actions
  async switchToListView(): Promise<void> {
    await assistant.waitForPageLoadedCompletely(this.page);
    const switchList = this.page.locator(".switch-list");
    await switchList.waitFor({ state: "visible", timeout: 10000 });
    await switchList.click();
    await this.expectProductListVisible();
  }

  async switchToGridView(): Promise<void> {
    // Wait for the page to be fully loaded
    await assistant.waitForPageLoadedCompletely(this.page);
    const switchGrid = this.page.locator(".switch-grid");
    await switchGrid.waitFor({ state: "visible", timeout: 10000 });
    await switchGrid.click();
    await this.expectProductGridVisible();
  }

  async expectProductGridVisible(): Promise<void> {
    const productGrid = this.page.locator(".products-grid");
    await expect(productGrid).toBeVisible();
  }

  async expectProductListVisible(): Promise<void> {
    const productList = this.page.locator(".products-list");
    await expect(productList).toBeVisible();
  }

  async sortProduct(sortingType: string): Promise<void> {
    await assistant.waitForPageLoadedCompletely(this.page);
    await assistant.thinking(this.page, 10);
    const sortCombobox = this.page.getByRole("combobox", {
      name: "Shop order",
    });
    await sortCombobox.waitFor({ state: "visible", timeout: 6000 });
    await sortCombobox.selectOption({ label: sortingType });
  }

  async verifyProductSortedBy(sortingType: string): Promise<void> {
    const productListLocator = await this.page.locator(
      ".products .product-type"
    );
    const count = await productListLocator.count();
    const priceArray: number[] = [];

    for (let i = 0; i < count; i++) {
      const product = productListLocator.nth(i);

      const hasDel = (await product.locator(".price .del").count()) > 0;

      // Use sale price if exists, else regular price
      let itemPriceText: string;
      if (hasDel) {
        itemPriceText = await product.locator(".price .del").innerText();
      } else {
        itemPriceText = await product.locator(".price").innerText();
      }

      const price = parseFloat(itemPriceText.replace(/[^0-9.]/g, ""));
      priceArray.push(price);
    }

    // Sort check
    if (sortingType === "Sort by price: low to high") {
      expect(await assistant.isSortedAscending(priceArray)).toBe(true);
    } else if (sortingType === "Sort by price: high to low") {
      expect(await assistant.isSortedDescending(priceArray)).toBe(true);
    } else {
      throw new Error(`Unknown sorting type: ${sortingType}`);
    }
  }

  async addProductToCartByIndex(index: number): Promise<void> {
    const products = this.page.locator(".products .product");
    const count = await products.count();
    if (index < 0 || index >= count) {
      throw new Error("Index out of bounds");
    }
    const product = products.nth(index);
    await product
      .getByRole("link", { name: "Add to cart" })
      .click({ force: true });
  }

  async addRandomProductToCart(addIndex?: number): Promise<{
    name: string | null;
    price: string | null;
    quantity: number;
    addIndex?: number;
  }> {
    const products = this.page.locator(".products .product");

    await products.first().waitFor({ state: "visible", timeout: 30000 });
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

    const priceLocator = randomProduct.locator(".price");

    //Handle for discountPrice if any
    const hasDiscount = (await priceLocator.locator("ins").count()) > 0;

    let pickedPrice: string;

    if (hasDiscount) {
      //Get discounted Price
      pickedPrice =
        (await priceLocator.locator("ins").textContent())?.trim() || "";
    } else {
      //Get original Price
      pickedPrice = (await priceLocator.textContent())?.trim() || "";
    }

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
    if (addIndex !== undefined) {
      await assistant.verifyCartQuantity(this.page, addIndex);
    } else {
      await assistant.verifyCartQuantity(this.page, itemQuantity);
    }

    // Return the details of the added product
    return {
      name: pickedName?.trim() ?? null,
      price: pickedPrice?.trim() ?? null,
      quantity: itemQuantity,
    };
  }

  async addMultipleProductToCart(numberProduct: number): Promise<Product[]> {
    const productList: Product[] = [];

    for (let i = 0; i < numberProduct; i++) {
      const {
        name: productName,
        price: productPrice,
        quantity: productQuantity,
      } = await this.addRandomProductToCart(i + 1);

      const newProduct = new Product(
        productName!,
        productPrice!,
        productQuantity
      );

      productList.push(newProduct);
    }

    return productList;
  }
}
