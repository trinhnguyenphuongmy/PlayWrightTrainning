export interface OrderDetailParams {
  orderedProduct: string;
  orderedQuantity: number;
  orderedPrice: number;
  orderedPaymentMethod?: string;
  orderNote?: string;
}
