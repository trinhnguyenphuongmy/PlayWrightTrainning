export class Order {
  private itemName: string;
  private itemPrice: string;
  private itemQuantity: number;
  private orderNumber?: string;
  private orderDate?: string;
  private orderTotalPrice?: string;

  constructor(
    name: string,
    price: string,
    quantity: number,
    orderNumber?: string,
    orderDate?: string,
    orderTotalPrice?: string
  ) {
    this.itemName = name;
    this.itemPrice = price;
    this.itemQuantity = quantity;
    this.orderNumber = orderNumber;
    this.orderDate = orderDate;
    this.orderTotalPrice = orderTotalPrice;
  }

  getName(): string {
    return this.itemName;
  }

  getPrice(): string {
    return this.itemPrice;
  }

  getQuantity(): number {
    return this.itemQuantity;
  }

  getOrderNumber(): string {
    return this.orderNumber!;
  }
  getOrderdate(): string {
    return this.orderDate!;
  }
  getOrderTotalPrice(): string {
    return this.orderTotalPrice!;
  }
}
