import { Page } from "@playwright/test";
import {
  HomePage,
  LoginPage,
  CartPage,
  CheckOutPage,
  ProductPage,
  OrderPage,
} from "../pages";
import { Account, Order } from "../models";
import * as assistant from "../utils";
import dotenv from "dotenv";

export async function createOrder(page: Page): Promise<Order> {
  await assistant.selectPage(page, "Shop");

  const product = new ProductPage(page);
  const checkout = new CheckOutPage(page);
  const cart = new CartPage(page);

  const {
    name: orderName,
    price: orderPrice,
    quantity: orderQuantity,
  } = await product.addRandomProductToCart();

  //await checkout.verifyOrderDetails(orderName!, orderPrice!, orderQuantity);

  await page.goto("/checkout");
  await checkout.placeOrder();

  const order = new OrderPage(page);

  const newOrder = new Order(
    orderName!,
    orderPrice!,
    orderQuantity,
    (await order.getOrderNumber())!,
    (await order.getOrderDate())!,
    (await order.getOrderTotalPrice())!
  );

  return newOrder;
}
