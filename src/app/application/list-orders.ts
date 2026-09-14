import { OrderApi, OrderSummary } from './ports/order-api';

export async function listOrders(orderApi: OrderApi): Promise<OrderSummary[]> {
  return orderApi.listOrders();
}
