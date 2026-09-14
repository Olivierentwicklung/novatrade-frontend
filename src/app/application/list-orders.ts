import { OrderReadApi, OrderSummary } from './ports/order-read-api';

export async function listOrders(orderApi: OrderReadApi): Promise<OrderSummary[]> {
  return orderApi.listOrders();
}
