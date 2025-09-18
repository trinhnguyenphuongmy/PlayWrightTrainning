export class Product {
  private productName: string;
  private productPrice: string;
  private productQuantity: number;

  constructor(name: string, price: string, quantity: number) {
    this.productName = name;
    this.productPrice = price;
    this.productQuantity = quantity;
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
