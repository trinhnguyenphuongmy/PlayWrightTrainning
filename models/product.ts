export class Product {
  private productName: string;
  private productPrice: string;
  private productQuantity: number;

  constructor(
    productName: string,
    productPrice: string,
    productQuantity: number
  ) {
    this.productName = productName;
    this.productPrice = productPrice;
    this.productQuantity = productQuantity;
  }

  getName(): string {
    return this.productName;
  }

  getPrice(): string {
    return this.productPrice;
  }

  getQuantity(): number {
    return this.productQuantity;
  }
}
